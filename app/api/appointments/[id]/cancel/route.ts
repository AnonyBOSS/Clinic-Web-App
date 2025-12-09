// app/api/appointments/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Appointment } from "@/models/Appointment";
import { Slot } from "@/models/Slot";
import { Payment } from "@/models/Payment";

type RouteParams = {
  params: { id: string };
};

function parseDateTime(date?: string, time?: string): Date | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const auth = getAuthUserFromRequest(req);

    if (!auth || auth.role !== "PATIENT") {
      return NextResponse.json(
        { success: false, error: "Only patients can cancel appointments." },
        { status: 403 }
      );
    }

    const apptId = params.id;

    const appt = await Appointment.findOne({
      _id: apptId,
      patient: auth.id
    })
      .populate("slot", "date time")
      .exec();

    if (!appt) {
      return NextResponse.json(
        { success: false, error: "Appointment not found." },
        { status: 404 }
      );
    }

    if (!["BOOKED", "CONFIRMED"].includes(appt.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only booked or confirmed appointments can be cancelled."
        },
        { status: 400 }
      );
    }

    const slot: any = appt.slot;
    const slotDateTime = parseDateTime(slot?.date, slot?.time);
    if (!slotDateTime || slotDateTime <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only cancel future appointments."
        },
        { status: 400 }
      );
    }

    // Mark appointment as cancelled
    appt.status = "CANCELLED";
    appt.notes = `${
      appt.notes ? appt.notes + " " : ""
    }[Cancelled by patient]`;
    await appt.save();

    // Free the slot again, if it exists
    if (appt.slot) {
      await Slot.findByIdAndUpdate(appt.slot, { status: "AVAILABLE" }).exec();
    }

    // Mark related payments as refunded (if any)
    await Payment.updateMany(
      { appointment: appt._id, status: "PAID" },
      { status: "REFUNDED" }
    ).exec();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: appt._id.toString(),
          status: appt.status,
          notes: appt.notes
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[APPOINTMENT_CANCEL_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
