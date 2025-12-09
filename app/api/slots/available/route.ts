// app/api/slots/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";

// ensure models are registered for populate()
import "@/models/Room";
import "@/models/Clinic";
import "@/models/Doctor";

import { Slot } from "@/models/Slot";

function todayStrUTC(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const clinicId = searchParams.get("clinicId");
    const date = searchParams.get("date"); // single date
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!doctorId) {
      return NextResponse.json(
        {
          success: false,
          error: "doctorId is required."
        },
        { status: 400 }
      );
    }

    const filter: any = {
      doctor: doctorId,
      status: "AVAILABLE"
    };

    if (clinicId) {
      filter.clinic = clinicId;
    }

    if (date) {
      // exact date (old behavior)
      filter.date = date;
    } else if (fromDate && toDate) {
      filter.date = { $gte: fromDate, $lte: toDate };
    } else {
      // doctor-only: all future slots
      const today = todayStrUTC();
      filter.date = { $gte: today };
    }

    const slots = await Slot.find(filter)
      .sort({ date: 1, time: 1 })
      .populate("clinic", "name address")
      .populate("room", "room_number status")
      .exec();

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
