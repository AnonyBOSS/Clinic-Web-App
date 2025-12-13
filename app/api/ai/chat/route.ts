// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { chatWithAssistant, ChatResponse } from "@/lib/ai/groq";
import { Appointment } from "@/models/Appointment";
import { Patient } from "@/models/Patient";
import { Doctor } from "@/models/Doctor";
import { ChatHistory } from "@/models/ChatHistory";
import { SymptomCheck } from "@/models/SymptomCheck";
import "@/models/Slot";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Please log in to use the chat assistant" },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => null);
        const { message, language = "en" } = body || {};

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: "Message is required" },
                { status: 400 }
            );
        }

        // Get or create chat history for this user
        let chatHistory = await ChatHistory.findOne({
            user: authUser.id,
            userType: authUser.role
        });

        if (!chatHistory) {
            chatHistory = new ChatHistory({
                user: authUser.id,
                userType: authUser.role,
                messages: [],
                language
            });
        }

        // Update language preference
        chatHistory.language = language;

        // Get context about the user
        let context: any = { language };

        // Get list of all doctors from database
        const allDoctors = await Doctor.find({})
            .select("full_name specializations consultation_fee")
            .lean();

        const doctorsList = allDoctors.map((d: any) => ({
            name: d.full_name,
            specializations: d.specializations?.join(", ") || "General",
            fee: d.consultation_fee || 300
        }));

        // Get previous symptom checks for context
        const recentSymptomChecks = await SymptomCheck.find({ patient: authUser.id })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        const symptomHistory = recentSymptomChecks.map((check: any) => ({
            symptoms: check.symptoms,
            suggestedSpecialties: check.aiAnalysis?.suggestedSpecialties || []
        }));

        if (authUser.role === "PATIENT") {
            // Fetch patient's actual name from database
            const patient = await Patient.findById(authUser.id).select("full_name").lean();

            // Get upcoming appointments for context
            const upcomingAppointments = await Appointment.find({
                patient: authUser.id,
                status: { $in: ["BOOKED", "CONFIRMED"] }
            })
                .populate("doctor", "full_name")
                .populate("slot", "date time")
                .lean();

            context = {
                ...context,
                patientName: (patient as any)?.full_name || "Patient",
                upcomingAppointments: upcomingAppointments.map((apt: any) => ({
                    doctor: apt.doctor?.full_name || "Unknown Doctor",
                    date: apt.slot?.date || "Unknown",
                    time: apt.slot?.time || "Unknown"
                })),
                availableDoctors: doctorsList,
                previousSymptomChecks: symptomHistory
            };
        } else if (authUser.role === "DOCTOR") {
            const doctor = await Doctor.findById(authUser.id).select("full_name").lean();
            context = {
                ...context,
                patientName: (doctor as any)?.full_name || "Doctor",
                availableDoctors: doctorsList
            };
        }

        // Add the new user message to history
        chatHistory.messages.push({
            role: "user",
            content: message.trim(),
            timestamp: new Date()
        });

        // Prepare messages for AI (including history for context)
        const messagesForAI = chatHistory.messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        // Get AI response
        const aiResponse: ChatResponse = await chatWithAssistant(messagesForAI, context);

        // Add assistant response to history
        chatHistory.messages.push({
            role: "assistant",
            content: aiResponse.message,
            timestamp: new Date(),
            quickActions: aiResponse.quickActions
        });

        // Update last activity and save
        chatHistory.lastActivity = new Date();
        await chatHistory.save();

        return NextResponse.json({
            success: true,
            data: {
                message: aiResponse.message,
                quickActions: aiResponse.quickActions
            }
        });
    } catch (error) {
        console.error("[AI_CHAT_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to get response" },
            { status: 500 }
        );
    }
}

// GET - Retrieve chat history
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const chatHistory = await ChatHistory.findOne({
            user: authUser.id,
            userType: authUser.role
        });

        return NextResponse.json({
            success: true,
            data: {
                messages: chatHistory?.messages || [],
                language: chatHistory?.language || "en"
            }
        });
    } catch (error) {
        console.error("[AI_CHAT_GET_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to load chat history" },
            { status: 500 }
        );
    }
}

// DELETE - Clear chat history
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await ChatHistory.deleteOne({
            user: authUser.id,
            userType: authUser.role
        });

        return NextResponse.json({
            success: true,
            message: "Chat history cleared"
        });
    } catch (error) {
        console.error("[AI_CHAT_DELETE_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to clear chat history" },
            { status: 500 }
        );
    }
}
