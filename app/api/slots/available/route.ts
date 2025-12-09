// app/api/slots/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";

// ensure models exist for populate()
import "@/models/Room";
import "@/models/Clinic";
import "@/models/Doctor";

import { Slot } from "@/models/Slot";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const clinicId = searchParams.get("clinicId");
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!doctorId || !clinicId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: "doctorId, clinicId and date are required query params."
        },
        { status: 400 }
      );
    }

    const slots = await Slot.find({
      doctor: doctorId,
      clinic: clinicId,
      date,
      status: "AVAILABLE"
    })
      .sort({ time: 1 })
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
