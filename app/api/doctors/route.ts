// app/api/doctors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Doctor } from "@/models/Doctor";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const specialization = searchParams.get("specialization");
    const clinicId = searchParams.get("clinicId");

    const filter: any = {};
    if (specialization) {
      filter.specializations = { $regex: specialization, $options: "i" };
    }
    if (clinicId) {
      filter.clinic_affiliations = clinicId;
    }

    const doctors = await Doctor.find(filter)
      .select("full_name email phone qualifications specializations clinic_affiliations consultation_fee")
      .populate("clinic_affiliations", "name address.city")
      .exec();

    return NextResponse.json(
      { success: true, data: doctors },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DOCTORS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
