// app/api/doctors/slots/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Doctor } from "@/models/Doctor";
import { Slot } from "@/models/Slot";

type GenerateBody = {
  fromDate?: string; // "YYYY-MM-DD"
  toDate?: string;   // "YYYY-MM-DD"
};

function toDateOnly(str: string): Date | null {
  const d = new Date(str + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = getAuthUserFromRequest(req);

    if (!auth || auth.role !== "DOCTOR") {
      return NextResponse.json(
        { success: false, error: "Only doctors can generate slots." },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => null)) as GenerateBody | null;

    const today = new Date();
    const todayStr = formatDate(today);

    let fromStr = body?.fromDate || todayStr;
    let toStr = body?.toDate || formatDate(
      new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    );

    const from = toDateOnly(fromStr);
    const to = toDateOnly(toStr);

    if (!from || !to || from > to) {
      return NextResponse.json(
        { success: false, error: "Invalid fromDate/toDate range." },
        { status: 400 }
      );
    }

    // Do not allow generating slots entirely in the past
    if (from < toDateOnly(todayStr)!) {
      fromStr = todayStr;
    }

    const doctor = await Doctor.findById(auth.id).exec();
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

    const scheduleDays = doctor.schedule_days.filter((s: any) => s.isActive);
    if (scheduleDays.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active schedule days configured." },
        { status: 400 }
      );
    }

    const fromDate = toDateOnly(fromStr)!;
    const toDate = toDateOnly(toStr)!;

    // Delete existing AVAILABLE slots for this doctor in the date range
    // This ensures schedule changes (like slot duration) take effect
    await Slot.deleteMany({
      doctor: doctor._id,
      status: "AVAILABLE",
      date: { $gte: fromStr, $lte: toStr }
    }).exec();

    let createdCount = 0;
    let current = new Date(fromDate.getTime());

    while (current <= toDate) {
      const dateStr = formatDate(current);
      const dayOfWeek = current.getUTCDay();

      for (const s of scheduleDays as any[]) {
        if (s.dayOfWeek !== dayOfWeek) continue;

        const start = timeToMinutes(s.startTime);
        const end = timeToMinutes(s.endTime);
        let t = start;

        while (t + s.slotDurationMinutes <= end) {
          const hour = Math.floor(t / 60);
          const minute = t % 60;
          const hh = String(hour).padStart(2, "0");
          const mm = String(minute).padStart(2, "0");
          const timeStr = `${hh}:${mm}`;

          await Slot.findOneAndUpdate(
            {
              doctor: doctor._id,
              clinic: s.clinic,
              room: s.room,
              date: dateStr,
              time: timeStr
            },
            {
              $setOnInsert: {
                status: "AVAILABLE"
              }
            },
            { upsert: true, new: true }
          );

          createdCount++;
          t += s.slotDurationMinutes;
        }
      }

      current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Slots generated successfully.",
        data: { createdCount }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[DOCTOR_SLOTS_GENERATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
