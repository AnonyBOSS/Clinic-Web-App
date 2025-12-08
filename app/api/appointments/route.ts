// app/api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Slot } from "@/models/Slot";
import { Appointment } from "@/models/Appointment";
import { Payment } from "@/models/Payment";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const filter =
      authUser.role === "DOCTOR"
        ? { doctor: authUser.id }
        : { patient: authUser.id };

    const appointments = await Appointment.find(filter)
      .sort({ "slot.date": 1, "slot.time": 1 })
      .populate("doctor", "full_name specializations")
      .populate("patient", "full_name email")
      .populate("clinic", "name address.city")
      .populate("room", "room_number")
      .populate("slot", "date time")
      .exec();

    return NextResponse.json(
      { success: true, data: appointments },
      { status: 200 }
    );
  } catch (error) {
    console.error("[APPOINTMENTS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

type BookBody = {
  doctorId?: string;
  clinicId?: string;
  roomId?: string;
  slotId?: string;
  notes?: string;
  amount?: number;
  method?: "CASH" | "CARD";
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUserFromRequest(req);
    if (!authUser || authUser.role !== "PATIENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Only authenticated patients can book appointments."
        },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => null)) as BookBody | null;
    const { doctorId, clinicId, roomId, slotId, notes, amount, method } =
      body ?? {};

    if (!doctorId || !clinicId || !roomId || !slotId || !amount || !method) {
      return NextResponse.json(
        {
          success: false,
          error: "doctorId, clinicId, roomId, slotId, amount and method are required."
        },
        { status: 400 }
      );
    }

    // 1) Atomically lock slot (AVAILABLE → BOOKED)
    const slot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        doctor: doctorId,
        clinic: clinicId,
        room: roomId,
        status: "AVAILABLE"
      },
      { status: "BOOKED" },
      { new: true }
    ).exec();

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Slot is no longer available." },
        { status: 409 }
      );
    }

    const paymentDetails = {
      amount,
      method,
      transaction_id: `TX-${Date.now()}`,
      status: "PAID" as const,
      timestamp: new Date()
    };

    // 2) Create appointment (with embedded payment)
    const appointment = await Appointment.create({
      patient: authUser.id,
      doctor: doctorId,
      clinic: clinicId,
      room: roomId,
      slot: slotId,
      status: "BOOKED",
      notes,
      payment: paymentDetails
    });

    // 3) Create separate payment document for reporting
    await Payment.create({
      appointment: appointment._id,
      patient: authUser.id,
      doctor: doctorId,
      amount,
      method,
      transaction_id: paymentDetails.transaction_id,
      status: paymentDetails.status,
      timestamp: paymentDetails.timestamp
    });

    return NextResponse.json(
      { success: true, data: appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("[APPOINTMENTS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
