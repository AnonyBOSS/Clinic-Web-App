// app/api/appointments/update-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Appointment } from "@/models/Appointment";
import { Slot, ISlot } from "@/models/Slot";

function todayDateLocal(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function nowTimeLocal(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

// POST: Update expired appointments to COMPLETED
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Not authenticated." },
                { status: 401 }
            );
        }

        const today = todayDateLocal();
        const nowTime = nowTimeLocal();

        // Find all slots that have passed (date < today, OR date == today AND time < now)
        const expiredSlots = await Slot.find({
            status: "BOOKED",
            $or: [
                { date: { $lt: today } },
                { date: today, time: { $lte: nowTime } }
            ]
        }).select("_id").lean();

        const expiredSlotIds = expiredSlots.map((s: { _id: unknown }) => s._id);

        if (expiredSlotIds.length === 0) {
            return NextResponse.json(
                { success: true, data: { updatedCount: 0 } },
                { status: 200 }
            );
        }

        // Update appointments that reference these expired slots and are still BOOKED or CONFIRMED
        const updateResult = await Appointment.updateMany(
            {
                slot: { $in: expiredSlotIds },
                status: { $in: ["BOOKED", "CONFIRMED"] }
            },
            { status: "COMPLETED" }
        );

        return NextResponse.json(
            {
                success: true,
                data: {
                    updatedCount: updateResult.modifiedCount
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[APPOINTMENTS_UPDATE_STATUS_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
