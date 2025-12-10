// app/api/slots/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
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
    const doctorId = searchParams.get("doctorId") || undefined;
    const clinicId = searchParams.get("clinicId") || undefined;
    const date = searchParams.get("date") || undefined;

    if (!doctorId && !clinicId && !date) {
      return NextResponse.json(
        {
          success: false,
          error: "Provide at least doctorId, clinicId, or date."
        },
        { status: 400 }
      );
    }

    const today = todayDateLocal();
    const nowTime = nowTimeLocal();

    const filter: any = {
      status: "AVAILABLE"
    };

    if (doctorId) filter.doctor = doctorId;
    if (clinicId) filter.clinic = clinicId;

    if (date) {
      filter.date = date;
    } else {
      filter.date = { $gte: today };
    }

    const rawSlots = await Slot.find(filter)
      .populate("room", "room_number status clinic")
      .populate("clinic", "name address.city address.governorate")
      .populate("doctor", "full_name specializations consultation_fee")
      .exec();

    const cleaned: any[] = [];
    const toDelete: string[] = [];

    for (const s of rawSlots as any[]) {
      const slotDate = s.date as string;
      const slotTime = s.time as string;

      // drop maintenance rooms
      if (s.room && s.room.status === "MAINTENANCE") {
        toDelete.push(String(s._id));
        continue;
      }

      // drop past slots
      if (slotDate < today) {
        toDelete.push(String(s._id));
        continue;
      }
      if (slotDate === today && slotTime <= nowTime) {
        toDelete.push(String(s._id));
        continue;
      }

      cleaned.push(s);
    }

    if (toDelete.length > 0) {
      await Slot.deleteMany({ _id: { $in: toDelete } }).exec();
    }

    return NextResponse.json(
      { success: true, data: cleaned },
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
