// app/api/slots/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";

import "@/models/Room";
import "@/models/Clinic";
import "@/models/Doctor";
import { Slot } from "@/models/Slot";

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

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const clinicId = searchParams.get("clinicId");
    const date = searchParams.get("date");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // allow doctorId OR clinicId (or both)
    if (!doctorId && !clinicId) {
      return NextResponse.json(
        { success: false, error: "doctorId or clinicId is required." },
        { status: 400 }
      );
    }

    const filter: any = {
      status: "AVAILABLE"
    };

    if (doctorId) filter.doctor = doctorId;
    if (clinicId) filter.clinic = clinicId;

    const today = todayDateLocal();
    const nowTime = nowTimeLocal();

    if (date) {
      filter.date = date;
    } else if (fromDate && toDate) {
      filter.date = { $gte: fromDate, $lte: toDate };
    } else {
      // only future dates by default
      filter.date = { $gte: today };
    }

    // 🧹 Lazy-clean stale AVAILABLE slots for this doctor/clinic
    const staleFilter: any = {
      status: "AVAILABLE"
    };
    if (doctorId) staleFilter.doctor = doctorId;
    if (clinicId) staleFilter.clinic = clinicId;
    staleFilter.$or = [
      { date: { $lt: today } },
      { date: today, time: { $lte: nowTime } }
    ];
    await Slot.deleteMany(staleFilter);

    // Now fetch remaining available slots
    const rawSlots = await Slot.find(filter)
      .sort({ date: 1, time: 1 })
      .populate("clinic", "name address")
      .populate("room", "room_number status")
      .populate("doctor", "full_name specializations")
      .exec();

    // Extra safety filter on API side
    const slots = rawSlots.filter((s: any) => {
      if (!s.date || !s.time) return false;

      if (s.date < today) return false;
      if (s.date === today && s.time <= nowTime) return false;

      if (s.room && s.room.status === "MAINTENANCE") return false;

      return true;
    });

    return NextResponse.json(
      { success: true, data: slots },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SLOTS_AVAILABLE_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
