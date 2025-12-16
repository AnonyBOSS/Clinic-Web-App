// app/api/ratings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { DoctorRating } from "@/models/DoctorRating";
import { Appointment } from "@/models/Appointment";

// POST - Submit a rating for a completed appointment
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
        const { appointmentId, rating, review, isAnonymous = false } = body || {};

        if (!appointmentId) {
            return NextResponse.json(
                { success: false, error: "Appointment ID is required" },
                { status: 400 }
            );
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Verify appointment exists and belongs to patient
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return NextResponse.json(
                { success: false, error: "Appointment not found" },
                { status: 404 }
            );
        }

        if (String(appointment.patient) !== authUser.id) {
            return NextResponse.json(
                { success: false, error: "You can only rate your own appointments" },
                { status: 403 }
            );
        }

        if (appointment.status !== "COMPLETED") {
            return NextResponse.json(
                { success: false, error: "Can only rate completed appointments" },
                { status: 400 }
            );
        }

        // Check if already rated
        const existingRating = await DoctorRating.findOne({ appointment: appointmentId });
        if (existingRating) {
            return NextResponse.json(
                { success: false, error: "You have already rated this appointment" },
                { status: 400 }
            );
        }

        // Create the rating
        const doctorRating = await DoctorRating.create({
            patient: authUser.id,
            doctor: appointment.doctor,
            appointment: appointmentId,
            rating: Math.round(rating),
            review: review?.trim() || undefined,
            isAnonymous
        });

        return NextResponse.json({
            success: true,
            message: "Rating submitted successfully",
            data: { ratingId: doctorRating._id }
        });
    } catch (error) {
        console.error("[RATING_CREATE_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit rating" },
            { status: 500 }
        );
    }
}

// GET - Get ratings for a doctor (public) or patient's given ratings
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);
        const { searchParams } = new URL(req.url);
        const doctorId = searchParams.get("doctorId");
        const myRatings = searchParams.get("myRatings") === "true";

        if (myRatings) {
            // Get patient's own ratings
            if (!authUser || authUser.role !== "PATIENT") {
                return NextResponse.json(
                    { success: false, error: "Unauthorized" },
                    { status: 401 }
                );
            }

            const ratings = await DoctorRating.find({ patient: authUser.id })
                .sort({ createdAt: -1 })
                .populate("doctor", "full_name specializations")
                .populate("appointment", "createdAt")
                .lean();

            return NextResponse.json({ success: true, data: ratings });
        }

        if (doctorId) {
            // Get doctor's ratings (public)
            const ratings = await DoctorRating.find({ doctor: doctorId })
                .sort({ createdAt: -1 })
                .select("rating review isAnonymous createdAt patient")
                .populate({
                    path: "patient",
                    select: "full_name",
                    match: { _id: { $exists: true } }
                })
                .lean();

            // Calculate average
            const avgRating = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;

            // Hide patient names for anonymous reviews
            const publicRatings = ratings.map((r: any) => ({
                ...r,
                patientName: r.isAnonymous ? "Anonymous" : r.patient?.full_name || "Patient"
            }));

            return NextResponse.json({
                success: true,
                data: {
                    ratings: publicRatings,
                    averageRating: Math.round(avgRating * 10) / 10,
                    totalRatings: ratings.length
                }
            });
        }

        return NextResponse.json(
            { success: false, error: "doctorId or myRatings parameter required" },
            { status: 400 }
        );
    } catch (error) {
        console.error("[RATING_GET_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH - Update an existing rating
export async function PATCH(req: NextRequest) {
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
        const { ratingId, rating, review } = body || {};

        if (!ratingId) {
            return NextResponse.json(
                { success: false, error: "Rating ID is required" },
                { status: 400 }
            );
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Find the rating and verify ownership
        const existingRating = await DoctorRating.findById(ratingId);
        if (!existingRating) {
            return NextResponse.json(
                { success: false, error: "Rating not found" },
                { status: 404 }
            );
        }

        if (String(existingRating.patient) !== authUser.id) {
            return NextResponse.json(
                { success: false, error: "You can only edit your own ratings" },
                { status: 403 }
            );
        }

        // Update the rating
        existingRating.rating = Math.round(rating);
        existingRating.review = review?.trim() || undefined;
        await existingRating.save();

        return NextResponse.json({
            success: true,
            message: "Rating updated successfully",
            data: existingRating
        });
    } catch (error) {
        console.error("[RATING_UPDATE_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to update rating" },
            { status: 500 }
        );
    }
}

// DELETE - Delete an existing rating
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser || authUser.role !== "PATIENT") {
            return NextResponse.json(
                { success: false, error: "Unauthorized - patients only" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const ratingId = searchParams.get("ratingId");

        if (!ratingId) {
            return NextResponse.json(
                { success: false, error: "Rating ID is required" },
                { status: 400 }
            );
        }

        // Find the rating and verify ownership
        const existingRating = await DoctorRating.findById(ratingId);
        if (!existingRating) {
            return NextResponse.json(
                { success: false, error: "Rating not found" },
                { status: 404 }
            );
        }

        if (String(existingRating.patient) !== authUser.id) {
            return NextResponse.json(
                { success: false, error: "You can only delete your own ratings" },
                { status: 403 }
            );
        }

        // Delete the rating
        await DoctorRating.findByIdAndDelete(ratingId);

        return NextResponse.json({
            success: true,
            message: "Rating deleted successfully"
        });
    } catch (error) {
        console.error("[RATING_DELETE_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete rating" },
            { status: 500 }
        );
    }
}
