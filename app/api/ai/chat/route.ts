// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { chatWithAssistant } from "@/lib/ai/groq";
import { Appointment } from "@/models/Appointment";
import { Patient } from "@/models/Patient";
import { Doctor } from "@/models/Doctor";
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
        const { messages } = body || {};

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { success: false, error: "Messages are required" },
                { status: 400 }
            );
        }

        // Get context about the user
        let context: any = {};

        // Get list of all doctors from database
        const allDoctors = await Doctor.find({})
            .select("full_name specializations consultation_fee")
            .lean();

        const doctorsList = allDoctors.map((d: any) => ({
            name: d.full_name,
            specializations: d.specializations?.join(", ") || "General",
            fee: d.consultation_fee || 300
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
                patientName: (patient as any)?.full_name || "Patient",
                upcomingAppointments: upcomingAppointments.map((apt: any) => ({
                    doctor: apt.doctor?.full_name || "Unknown Doctor",
                    date: apt.slot?.date || "Unknown",
                    time: apt.slot?.time || "Unknown"
                })),
                availableDoctors: doctorsList
            };
        } else if (authUser.role === "DOCTOR") {
            const doctor = await Doctor.findById(authUser.id).select("full_name").lean();
            context = {
                patientName: (doctor as any)?.full_name || "Doctor",
                availableDoctors: doctorsList
            };
        }

        // Get AI response
        const response = await chatWithAssistant(messages, context);

        return NextResponse.json({
            success: true,
            data: {
                message: response
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
