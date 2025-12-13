// app/api/ai/recommend-doctors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Doctor } from "@/models/Doctor";
import { DoctorRating } from "@/models/DoctorRating";
import { Appointment } from "@/models/Appointment";
import { Slot } from "@/models/Slot";

interface DoctorWithScore {
    _id: string;
    full_name: string;
    specializations: string[];
    consultation_fee: number;
    averageRating: number;
    totalRatings: number;
    availableSlots: number;
    matchScore: number;
    reasons: string[];
}

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
        const { specialties, symptoms, limit = 10 } = body || {};

        // Get patient's booking history for personalization
        const patientHistory = await Appointment.find({
            patient: authUser.id,
            status: { $in: ["COMPLETED", "BOOKED", "CONFIRMED"] }
        })
            .select("doctor")
            .lean();

        const previousDoctorIds = [...new Set(patientHistory.map((a: any) => a.doctor.toString()))];

        // Build query for doctors
        const doctorQuery: any = {};
        if (specialties && Array.isArray(specialties) && specialties.length > 0) {
            doctorQuery.specializations = {
                $in: specialties.map((s: string) => new RegExp(s, "i"))
            };
        }

        const doctors = await Doctor.find(doctorQuery)
            .select("_id full_name specializations consultation_fee")
            .lean();

        // Get ratings for all doctors
        const doctorIds = doctors.map((d: any) => d._id);
        const ratings = await DoctorRating.aggregate([
            { $match: { doctor: { $in: doctorIds } } },
            {
                $group: {
                    _id: "$doctor",
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);
        const ratingsMap = new Map(ratings.map(r => [r._id.toString(), r]));

        // Get available slots for next 7 days
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const todayStr = today.toISOString().split("T")[0];
        const nextWeekStr = nextWeek.toISOString().split("T")[0];

        const slotCounts = await Slot.aggregate([
            {
                $match: {
                    doctor: { $in: doctorIds },
                    status: "AVAILABLE",
                    date: { $gte: todayStr, $lte: nextWeekStr }
                }
            },
            {
                $group: {
                    _id: "$doctor",
                    count: { $sum: 1 }
                }
            }
        ]);
        const slotsMap = new Map(slotCounts.map(s => [s._id.toString(), s.count]));

        // Calculate scores and reasons for each doctor
        const doctorsWithScores: DoctorWithScore[] = doctors.map((doc: any) => {
            const docId = doc._id.toString();
            const ratingInfo = ratingsMap.get(docId) || { averageRating: 0, totalRatings: 0 };
            const availableSlots = slotsMap.get(docId) || 0;
            const isPreviousDoctor = previousDoctorIds.includes(docId);

            // Calculate match score
            let matchScore = 0;
            const reasons: string[] = [];

            // Specialty match
            if (specialties && specialties.length > 0) {
                const matchedSpecs = doc.specializations.filter((s: string) =>
                    specialties.some((spec: string) =>
                        s.toLowerCase().includes(spec.toLowerCase()) ||
                        spec.toLowerCase().includes(s.toLowerCase())
                    )
                );
                if (matchedSpecs.length > 0) {
                    matchScore += 30;
                    reasons.push(`Specializes in ${matchedSpecs.join(", ")}`);
                }
            }

            // Rating bonus
            if (ratingInfo.averageRating >= 4.5 && ratingInfo.totalRatings >= 3) {
                matchScore += 25;
                reasons.push(`Highly rated (${ratingInfo.averageRating.toFixed(1)}★ from ${ratingInfo.totalRatings} reviews)`);
            } else if (ratingInfo.averageRating >= 4.0 && ratingInfo.totalRatings >= 2) {
                matchScore += 15;
                reasons.push(`Well rated (${ratingInfo.averageRating.toFixed(1)}★)`);
            }

            // Availability bonus
            if (availableSlots >= 10) {
                matchScore += 20;
                reasons.push("Many appointments available");
            } else if (availableSlots >= 5) {
                matchScore += 10;
                reasons.push("Appointments available this week");
            }

            // Previous visit bonus (patients often prefer doctors they've seen)
            if (isPreviousDoctor) {
                matchScore += 15;
                reasons.push("You've visited before");
            }

            return {
                _id: docId,
                full_name: doc.full_name,
                specializations: doc.specializations,
                consultation_fee: doc.consultation_fee,
                averageRating: ratingInfo.averageRating || 0,
                totalRatings: ratingInfo.totalRatings || 0,
                availableSlots,
                matchScore,
                reasons
            };
        });

        // Sort by match score descending
        doctorsWithScores.sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json({
            success: true,
            data: doctorsWithScores.slice(0, limit)
        });
    } catch (error) {
        console.error("[RECOMMEND_DOCTORS_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to get recommendations" },
            { status: 500 }
        );
    }
}
