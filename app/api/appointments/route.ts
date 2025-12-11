// app/api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Slot } from "@/models/Slot";
import { Appointment } from "@/models/Appointment";
import { Payment } from "@/models/Payment";
import { Doctor } from "@/models/Doctor";
import { Room } from "@/models/Room";
// Import referenced models for populate()
import "@/models/Clinic";
import "@/models/Patient";

function todayDateLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate() + 0).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nowTimeLocal(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

type BookBody = {
  doctorId?: string;
  clinicId?: string;
  roomId?: string;
  slotId?: string;
  notes?: string;
  method?: "CASH" | "CARD";
};

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
      .populate("doctor", "full_name specializations consultation_fee")
      .populate("patient", "full_name email")
      .populate("clinic", "name address.city address.governorate")
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
    const { doctorId, clinicId, roomId, slotId, notes, method } = body ?? {};

    if (!doctorId || !clinicId || !roomId || !slotId || !method) {
      return NextResponse.json(
        {
          success: false,
          error: "doctorId, clinicId, roomId, slotId and method are required."
        },
        { status: 400 }
      );
    }

    if (method !== "CASH" && method !== "CARD") {
      return NextResponse.json(
        { success: false, error: "Invalid payment method." },
        { status: 400 }
      );
    }

    const today = todayDateLocal();
    const nowTime = nowTimeLocal();

    const room = await Room.findById(roomId).select("status").exec();
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found." },
        { status: 404 }
      );
    }
    if (room.status === "MAINTENANCE") {
      return NextResponse.json(
        { success: false, error: "Selected room is under maintenance." },
        { status: 400 }
      );
    }

    const slot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        doctor: doctorId,
        clinic: clinicId,
        room: roomId,
        status: "AVAILABLE",
        $or: [
          { date: { $gt: today } },
          { date: today, time: { $gt: nowTime } }
        ]
      },
      { status: "BOOKED" },
      { new: true }
    ).exec();

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Slot is no longer available or in the past." },
        { status: 409 }
      );
    }

    const doctor = await Doctor.findById(doctorId)
      .select("consultation_fee full_name")
      .exec();

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

    const amount =
      typeof doctor.consultation_fee === "number"
        ? doctor.consultation_fee
        : 300;

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Doctor has no valid consultation fee configured."
        },
        { status: 400 }
      );
    }

    const paymentDetails = {
      amount,
      method,
      transaction_id: `TX-${Date.now()}`,
      status: "PAID" as const,
      timestamp: new Date()
    };

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
