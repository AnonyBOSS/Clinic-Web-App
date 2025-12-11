// app/api/appointments/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Appointment } from "@/models/Appointment";
import { Slot } from "@/models/Slot";
// Import models for population
import "@/models/Doctor";
import "@/models/Clinic";
import "@/models/Room";

type RouteParams = {
    params: {
        id: string;
    };
};

function todayDateLocal(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();

        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only patients can reschedule their own appointments
        if (authUser.role !== "PATIENT") {
            return NextResponse.json(
                { success: false, error: "Only patients can reschedule appointments" },
                { status: 403 }
            );
        }

        const appointmentId = params.id;

        const body = await req.json().catch(() => null);
        const newSlotId = body?.newSlotId;

        if (!newSlotId) {
            return NextResponse.json(
                { success: false, error: "New slot ID is required" },
                { status: 400 }
            );
        }

        // Find the appointment with slot populated
        const appointment = await Appointment.findById(appointmentId)
            .populate("slot", "date time doctor")
            .exec();

        if (!appointment) {
            return NextResponse.json(
                { success: false, error: "Appointment not found" },
                { status: 404 }
            );
        }

        // Check that this appointment belongs to the patient
        if (String(appointment.patient) !== authUser.id) {
            return NextResponse.json(
                { success: false, error: "You can only reschedule your own appointments" },
                { status: 403 }
            );
        }

        // Check appointment is not cancelled or completed
        if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
            return NextResponse.json(
                { success: false, error: "Cannot reschedule a cancelled or completed appointment" },
                { status: 400 }
            );
        }

        // Get the old slot to check its date
        const oldSlot = appointment.slot as any;
        if (!oldSlot) {
            return NextResponse.json(
                { success: false, error: "Appointment has no associated slot" },
                { status: 400 }
            );
        }

        const today = todayDateLocal();

        // Check that appointment is not for today
        if (oldSlot.date === today) {
            return NextResponse.json(
                { success: false, error: "Cannot reschedule appointments scheduled for today" },
                { status: 400 }
            );
        }

        // Find the new slot
        const newSlot = await Slot.findById(newSlotId).exec();

        if (!newSlot) {
            return NextResponse.json(
                { success: false, error: "New slot not found" },
                { status: 404 }
            );
        }

        // Check new slot is available
        if (newSlot.status !== "AVAILABLE") {
            return NextResponse.json(
                { success: false, error: "Selected slot is not available" },
                { status: 400 }
            );
        }

        // Check new slot belongs to same doctor
        if (String(newSlot.doctor) !== String(appointment.doctor)) {
            return NextResponse.json(
                { success: false, error: "New slot must be with the same doctor" },
                { status: 400 }
            );
        }

        // Check new slot is not for today
        if (newSlot.date === today) {
            return NextResponse.json(
                { success: false, error: "Cannot reschedule to a slot for today" },
                { status: 400 }
            );
        }

        // Check new slot is in the future
        if (newSlot.date < today) {
            return NextResponse.json(
                { success: false, error: "Cannot reschedule to a past slot" },
                { status: 400 }
            );
        }

        // All validations passed - perform the reschedule

        // 1. Release the old slot
        await Slot.findByIdAndUpdate(oldSlot._id, { status: "AVAILABLE" }).exec();

        // 2. Book the new slot
        await Slot.findByIdAndUpdate(newSlotId, { status: "BOOKED" }).exec();

        // 3. Update appointment with new slot, room, and clinic from new slot
        appointment.slot = newSlot._id;
        appointment.room = newSlot.room;
        appointment.clinic = newSlot.clinic;
        await appointment.save();

        return NextResponse.json(
            {
                success: true,
                message: "Appointment rescheduled successfully",
                data: {
                    id: appointment._id.toString(),
                    newDate: newSlot.date,
                    newTime: newSlot.time
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[RESCHEDULE_APPOINTMENT_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
