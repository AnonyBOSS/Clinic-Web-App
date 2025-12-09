// app/api/doctors/slots/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Doctor } from "@/models/Doctor";
import { Slot } from "@/models/Slot";
import { Room } from "@/models/Room";

function parseDateStr(value: string): Date | null {
  const d = new Date(value + "T00:00:00.000Z");
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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

    const body = (await req.json().catch(() => null)) as {
      fromDate?: string;
      toDate?: string;
    } | null;

    const fromDateStr = body?.fromDate;
    const toDateStr = body?.toDate;

    if (!fromDateStr || !toDateStr) {
      return NextResponse.json(
        { success: false, error: "fromDate and toDate are required." },
        { status: 400 }
      );
    }

    const from = parseDateStr(fromDateStr);
    const to = parseDateStr(toDateStr);
    if (!from || !to || from > to) {
      return NextResponse.json(
        { success: false, error: "Invalid date range." },
        { status: 400 }
      );
    }

    const doctor = await Doctor.findById(auth.id).exec();
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "Doctor not found." },
        { status: 404 }
      );
    }

    const activeSchedule = doctor.schedule_days.filter(
      (d) => d.isActive && d.clinic
    );
    if (activeSchedule.length === 0) {
      return NextResponse.json(
        { success: false, error: "No active schedule days configured." },
        { status: 400 }
      );
    }

    // Preload rooms by clinic for fallback when no specific room is set
    const clinicIds = Array.from(
      new Set(activeSchedule.map((d) => String(d.clinic)))
    );
    const rooms = await Room.find({ clinic: { $in: clinicIds } })
      .select("_id clinic status")
      .exec();

    const roomsByClinic: Record<string, string | null> = {};
    for (const cid of clinicIds) {
      const firstAvailable = rooms.find(
        (r) =>
          String(r.clinic) === cid &&
          (r.status === "AVAILABLE" || !r.status)
      );
      roomsByClinic[cid] = firstAvailable ? String(firstAvailable._id) : null;
    }

    let createdCount = 0;

    for (
      let d = new Date(from.getTime());
      d <= to;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const dayOfWeek = d.getUTCDay();
      const dateStr = formatDate(d);

      const daySchedules = activeSchedule.filter(
        (s) => s.dayOfWeek === dayOfWeek
      );
      if (daySchedules.length === 0) continue;

      for (const s of daySchedules) {
        const startMin = timeToMinutes(s.startTime);
        const endMin = timeToMinutes(s.endTime);
        const step = s.slotDurationMinutes;
        if (!step || endMin <= startMin) continue;

        const clinicId = String(s.clinic);
        const roomId =
          s.room?.toString() ?? roomsByClinic[clinicId] ?? null;

        if (!roomId) continue;

        for (let m = startMin; m + step <= endMin; m += step) {
          const timeStr = minutesToTime(m);

          try {
            await Slot.create({
              doctor: doctor._id,
              clinic: clinicId,
              room: roomId,
              date: dateStr,
              time: timeStr,
              status: "AVAILABLE"
            });
            createdCount++;
          } catch (err: any) {
            if (err?.code === 11000) continue; // ignore duplicates
            console.error("[SLOT_GENERATE_ERROR]", err);
          }
        }
      }
    }

    return NextResponse.json(
      { success: true, data: { createdCount } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DOCTORS_SLOTS_GENERATE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
