// app/api/appointments/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Appointment } from "@/models/Appointment";
import "@/models/Slot";
import "@/models/Patient";
import "@/models/Doctor";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (authUser.role !== "DOCTOR") {
            return NextResponse.json(
                { success: false, error: "Only doctors can complete appointments" },
                { status: 403 }
            );
        }

        const appointment = await Appointment.findById(params.id)
            .populate("slot", "date time")
            .lean();

        if (!appointment) {
            return NextResponse.json(
                { success: false, error: "Appointment not found" },
                { status: 404 }
            );
        }

        if (appointment.doctor.toString() !== authUser.id) {
            return NextResponse.json(
                { success: false, error: "You can only complete your own appointments" },
                { status: 403 }
            );
        }

        if (appointment.status !== "BOOKED" && appointment.status !== "CONFIRMED") {
            return NextResponse.json(
                { success: false, error: `Cannot complete an appointment with status: ${appointment.status}` },
                { status: 400 }
            );
        }

        await Appointment.findByIdAndUpdate(params.id, { status: "COMPLETED" });

        return NextResponse.json({
            success: true,
            data: { id: params.id, status: "COMPLETED" },
            message: "Appointment marked as completed"
        });
    } catch (error) {
        console.error("[COMPLETE_APPOINTMENT_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to complete appointment" },
            { status: 500 }
        );
    }
}
