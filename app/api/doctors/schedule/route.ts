// app/api/doctors/schedule/route.ts
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Doctor } from "@/models/Doctor";
import { Clinic } from "@/models/Clinic";
import { Room } from "@/models/Room";

type ScheduleDayDTO = {
  dayOfWeek: number;
  clinicId: string;
  roomId?: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  slotDurationMinutes: number;
  isActive: boolean;
};

function isValidTimeStr(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthUserFromRequest(req);

    if (!auth || auth.role !== "DOCTOR") {
      return NextResponse.json(
        { success: false, error: "Only doctors can view schedule." },
        { status: 403 }
      );
    }

    const doctor = await Doctor.findById(auth.id)
      .populate("schedule_days.clinic", "name address")
      .populate("schedule_days.room", "room_number status")
      .exec();

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

    // For now: allow doctor to pick from ALL clinics and their rooms
    const clinics = await Clinic.find()
      .select("name address")
      .sort({ name: 1 })
      .exec();

    const rooms = await Room.find()
      .select("room_number status clinic")
      .sort({ room_number: 1 })
      .exec();

    return NextResponse.json(
      {
        success: true,
        data: {
          schedule_days: doctor.schedule_days,
          clinics,
          rooms
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DOCTORS_SCHEDULE_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthUserFromRequest(req);

    if (!auth || auth.role !== "DOCTOR") {
      return NextResponse.json(
        { success: false, error: "Only doctors can update schedule." },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      scheduleDays?: ScheduleDayDTO[];
    } | null;

    const scheduleDays = body?.scheduleDays ?? [];

    // Basic validation
    for (const day of scheduleDays) {
      if (
        day.dayOfWeek < 0 ||
        day.dayOfWeek > 6 ||
        !day.clinicId ||
        !isValidTimeStr(day.startTime) ||
        !isValidTimeStr(day.endTime) ||
        day.slotDurationMinutes <= 0
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid schedule day payload." },
          { status: 400 }
        );
      }
    }

    const doctor = await Doctor.findById(auth.id).exec();
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

    // 🔧 Map DTO -> schema with ObjectId conversion
    doctor.schedule_days = scheduleDays.map((d) => ({
      dayOfWeek: d.dayOfWeek,
      clinic: new mongoose.Types.ObjectId(d.clinicId),
      room: d.roomId ? new mongoose.Types.ObjectId(d.roomId) : undefined,
      startTime: d.startTime,
      endTime: d.endTime,
      slotDurationMinutes: d.slotDurationMinutes,
      isActive: d.isActive
    }));

    await doctor.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DOCTORS_SCHEDULE_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
