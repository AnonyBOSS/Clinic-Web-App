// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Patient, type IPatient } from "@/models/Patient";
import { Doctor, type IDoctor } from "@/models/Doctor";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const { id, role } = authUser;

    let user: IPatient | IDoctor | null = null;

    if (role === "PATIENT") {
      user = (await Patient.findById(id).exec()) as IPatient | null;
    } else {
      user = (await Doctor.findById(id).exec()) as IDoctor | null;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // Build profile payload, narrowing by role for doctor-only fields
    let responseUser:
      | {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          role: "PATIENT" | "DOCTOR";
          qualifications?: string;
          specializations?: string[];
        }
      | undefined;

    if (role === "DOCTOR") {
      const doctor = user as IDoctor;
      responseUser = {
        id: (doctor as any)._id.toString(),
        full_name: doctor.full_name,
        email: doctor.email,
        phone: doctor.phone,
        role,
        qualifications: doctor.qualifications,
        specializations: doctor.specializations
      };
    } else {
      const patient = user as IPatient;
      responseUser = {
        id: (patient as any)._id.toString(),
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        role
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: responseUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ME_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
