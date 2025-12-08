// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Patient, type IPatient } from "@/models/Patient";
import { Doctor, type IDoctor } from "@/models/Doctor";
import { generateToken, type UserRole } from "@/lib/auth";
import {
  validateEmail,
  validatePassword,
  nonEmptyString,
} from "@/lib/validators";

type RegisterBody = {
  role?: UserRole;
  name?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  password?: string;
  qualifications?: string;
  specializations?: string[];
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json().catch(() => null)) as RegisterBody | null;

    const role: UserRole = body?.role ?? "PATIENT";
    const full_name = body?.full_name ?? body?.name ?? "";
    const phone = body?.phone ?? "";
    const email = body?.email ?? "";
    const password = body?.password ?? "";
    const qualifications = body?.qualifications;
    const specializations = body?.specializations ?? [];

    if (!nonEmptyString(full_name)) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 }
      );
    }

    if (!nonEmptyString(phone)) {
      return NextResponse.json(
        { success: false, error: "Phone is required." },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email." },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    // Enforce unique email across patients & doctors
    const existingPatient = await Patient.findOne({ email }).exec();
    const existingDoctor = await Doctor.findOne({ email }).exec();
    if (existingPatient || existingDoctor) {
      return NextResponse.json(
        { success: false, error: "Email already in use." },
        { status: 409 }
      );
    }

    let token: string;
    let responseUser:
      | {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          role: UserRole;
          qualifications?: string;
          specializations?: string[];
        }
      | undefined;

    // 👇 Branch by role so TS knows what type we have
    if (role === "PATIENT") {
      const patient = (await Patient.create({
        full_name,
        email,
        phone,
        password,
      })) as IPatient & { _id: any };

      token = generateToken({
        id: patient._id.toString(),
        email: patient.email,
        role,
      });

      responseUser = {
        id: patient._id.toString(),
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        role,
      };
    } else {
      const doctor = (await Doctor.create({
        full_name,
        email,
        phone,
        password,
        qualifications,
        specializations,
      })) as IDoctor & { _id: any };

      token = generateToken({
        id: doctor._id.toString(),
        email: doctor.email,
        role,
      });

      responseUser = {
        id: doctor._id.toString(),
        full_name: doctor.full_name,
        email: doctor.email,
        phone: doctor.phone,
        role,
        qualifications: doctor.qualifications,
        specializations: doctor.specializations,
      };
    }

    const res = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: responseUser,
        },
      },
      { status: 201 }
    );

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
