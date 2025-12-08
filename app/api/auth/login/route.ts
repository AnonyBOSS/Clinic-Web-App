// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Patient, type IPatient } from "@/models/Patient";
import { Doctor, type IDoctor } from "@/models/Doctor";
import { validateEmail } from "@/lib/validators";
import { generateToken, type UserRole } from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
  role?: UserRole;
};

type AuthUserDoc = IPatient | IDoctor;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json().catch(() => null)) as LoginBody | null;

    const email = body?.email ?? "";
    const password = body?.password ?? "";
    const role: UserRole = body?.role ?? "PATIENT";

    if (!validateEmail(email) || !password) {
      return NextResponse.json(
        { success: false, error: "Email, password and role are required." },
        { status: 400 }
      );
    }

    let user: AuthUserDoc | null = null;

    if (role === "PATIENT") {
      // Casting to AuthUserDoc is safe here – Mongoose doc structurally matches IPatient
      user = (await Patient.findOne({ email })
        .select("+password")
        .exec()) as unknown as AuthUserDoc | null;
    } else {
      user = (await Doctor.findOne({ email })
        .select("+password")
        .exec()) as unknown as AuthUserDoc | null;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: (user as any)._id.toString(),
      email: user.email,
      role
    });

    // Build response user safely by narrowing on role
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

    const res = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: responseUser
        }
      },
      { status: 200 }
    );

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60
    });

    return res;
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
