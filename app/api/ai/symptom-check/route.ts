// app/api/ai/symptom-check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { analyzeSymptoms } from "@/lib/ai/groq";
import { SymptomCheck } from "@/models/SymptomCheck";
import { Doctor } from "@/models/Doctor";
import { Slot } from "@/models/Slot";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser || authUser.role !== "PATIENT") {
            return NextResponse.json(
                { success: false, error: "Unauthorized - patients only" },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => null);
        const { symptoms, age, gender, language = "en" } = body || {};

        if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 10) {
            return NextResponse.json(
                { success: false, error: "Please describe your symptoms in at least 10 characters" },
                { status: 400 }
            );
        }

        // Analyze symptoms with AI (pass language for localized responses)
        const aiAnalysis = await analyzeSymptoms(symptoms, age, gender, language);

        // Find matching doctors based on suggested specialties
        const matchingDoctors = await Doctor.find({
            specializations: {
                $in: aiAnalysis.suggestedSpecialties.map(s => new RegExp(s, "i"))
            }
        })
            .select("_id full_name specializations consultation_fee")
            .limit(10)
            .lean();

        // Get available slots count for each doctor (next 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const todayStr = today.toISOString().split("T")[0];
        const nextWeekStr = nextWeek.toISOString().split("T")[0];

        const doctorsWithAvailability = await Promise.all(
            matchingDoctors.map(async (doc: any) => {
                const availableSlots = await Slot.countDocuments({
                    doctor: doc._id,
                    status: "AVAILABLE",
                    date: { $gte: todayStr, $lte: nextWeekStr }
                });

                return {
                    ...doc,
                    availableSlots,
                    matchScore: calculateMatchScore(doc.specializations, aiAnalysis.suggestedSpecialties)
                };
            })
        );

        // Sort by match score and availability
        doctorsWithAvailability.sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return b.availableSlots - a.availableSlots;
        });

        // Save the symptom check to database
        const symptomCheck = await SymptomCheck.create({
            patient: authUser.id,
            symptoms: symptoms.trim(),
            additionalInfo: { age, gender },
            aiAnalysis: {
                ...aiAnalysis,
                recommendedDoctorIds: doctorsWithAvailability.slice(0, 5).map(d => d._id)
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                checkId: symptomCheck._id,
                analysis: aiAnalysis,
                recommendedDoctors: doctorsWithAvailability.slice(0, 5)
            }
        });
    } catch (error) {
        console.error("[SYMPTOM_CHECK_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to analyze symptoms" },
            { status: 500 }
        );
    }
}

function calculateMatchScore(doctorSpecs: string[], suggestedSpecs: string[]): number {
    let score = 0;
    const normalizedDoctorSpecs = doctorSpecs.map(s => s.toLowerCase());

    suggestedSpecs.forEach((spec, index) => {
        const priority = suggestedSpecs.length - index; // Higher priority for first suggestions
        if (normalizedDoctorSpecs.some(ds => ds.includes(spec.toLowerCase()) || spec.toLowerCase().includes(ds))) {
            score += priority * 10;
        }
    });

    return score;
}

// GET - Retrieve patient's symptom check history
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser || authUser.role !== "PATIENT") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const checks = await SymptomCheck.find({ patient: authUser.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("aiAnalysis.recommendedDoctorIds", "full_name specializations")
            .lean();

        return NextResponse.json({ success: true, data: checks });
    } catch (error) {
        console.error("[SYMPTOM_CHECK_GET_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
