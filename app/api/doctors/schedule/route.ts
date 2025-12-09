// app/api/doctors/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Doctor } from "@/models/Doctor";
import { Clinic } from "@/models/Clinic";
import { Room } from "@/models/Room";
import { Appointment } from "@/models/Appointment";
import { Slot } from "@/models/Slot";

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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

      const startMins = timeToMinutes(day.startTime);
      const endMins = timeToMinutes(day.endTime);
      if (startMins >= endMins) {
        return NextResponse.json(
          {
            success: false,
            error: "Start time must be before end time for each schedule row."
          },
          { status: 400 }
        );
      }

      if (day.slotDurationMinutes > endMins - startMins) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Slot duration cannot be greater than the total working interval."
          },
          { status: 400 }
        );
      }
    }

    // Overlap validation per (dayOfWeek, clinicId, roomId)
    const groups = new Map<string, ScheduleDayDTO[]>();
    for (const d of scheduleDays) {
      const key = `${d.dayOfWeek}_${d.clinicId}_${d.roomId || "none"}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }

    for (const [, arr] of groups) {
      const sorted = arr.slice().sort((a, b) => {
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const prevEnd = timeToMinutes(prev.endTime);
        const currStart = timeToMinutes(curr.startTime);
        if (currStart < prevEnd) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Overlapping schedule entries detected for the same day, clinic, and room."
            },
            { status: 400 }
          );
        }
      }
    }

    const doctor = await Doctor.findById(auth.id).exec();
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

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

    // Auto-cancel future appointments that no longer match
    try {
      const activeSchedule = doctor.schedule_days.filter((s) => s.isActive);
      if (activeSchedule.length > 0) {
        const now = new Date();
        const todayStr = formatDateUTC(now);

        const appts = await Appointment.find({
          doctor: doctor._id,
          status: { $in: ["BOOKED", "CONFIRMED"] }
        })
          .populate("slot", "date time")
          .populate("clinic")
          .populate("room")
          .exec();

        for (const appt of appts as any[]) {
          const slot = appt.slot as any;
          if (!slot?.date || !slot?.time) continue;

          const slotDateTime = new Date(`${slot.date}T${slot.time}:00Z`);
          if (isNaN(slotDateTime.getTime()) || slotDateTime <= now) {
            continue; // don't touch past appointments
          }

          const slotDayOfWeek = slotDateTime.getUTCDay();
          const slotMinutes = timeToMinutes(slot.time);

          const stillValidForAppt = activeSchedule.some((s: any) => {
            if (!s.isActive) return false;
            if (s.dayOfWeek !== slotDayOfWeek) return false;
            if (String(s.clinic) !== String(appt.clinic)) return false;
            if (s.room && String(s.room) !== String(appt.room)) return false;

            const start = timeToMinutes(s.startTime);
            const end = timeToMinutes(s.endTime);
            return slotMinutes >= start && slotMinutes < end;
          });

          if (!stillValidForAppt) {
            appt.status = "CANCELLED";
            appt.notes = `${
              appt.notes ? appt.notes + " " : ""
            }[Auto-cancelled due to schedule update]`;
            await appt.save();
          }
        }

        // Also remove future AVAILABLE slots that no longer match schedule
        const futureSlots = await Slot.find({
          doctor: doctor._id,
          date: { $gte: todayStr },
          status: "AVAILABLE"
        }).exec();

        for (const slot of futureSlots as any[]) {
          if (!slot.date || !slot.time) continue;
          const slotDateTime = new Date(`${slot.date}T${slot.time}:00Z`);
          if (isNaN(slotDateTime.getTime()) || slotDateTime <= now) continue;

          const slotDayOfWeek = slotDateTime.getUTCDay();
          const slotMinutes = timeToMinutes(slot.time);

          const stillValidForSlot = activeSchedule.some((s: any) => {
            if (!s.isActive) return false;
            if (s.dayOfWeek !== slotDayOfWeek) return false;
            if (String(s.clinic) !== String(slot.clinic)) return false;
            if (s.room && String(s.room) !== String(slot.room)) return false;

            const start = timeToMinutes(s.startTime);
            const end = timeToMinutes(s.endTime);
            return slotMinutes >= start && slotMinutes < end;
          });

          if (!stillValidForSlot) {
            await Slot.deleteOne({ _id: slot._id });
          }
        }
      }
    } catch (err) {
      console.error("[DOCTOR_SCHEDULE_APPT_CANCEL_ERROR]", err);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DOCTORS_SCHEDULE_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
