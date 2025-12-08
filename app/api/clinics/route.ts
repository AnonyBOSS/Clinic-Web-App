// app/api/clinics/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Clinic } from "@/models/Clinic";

export async function GET() {
  try {
    await connectDB();
    const clinics = await Clinic.find().sort({ name: 1 }).exec();

    console.log("[CLINICS_GET]", clinics.length, "clinics found");

    return NextResponse.json(
      { success: true, data: clinics },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CLINICS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
