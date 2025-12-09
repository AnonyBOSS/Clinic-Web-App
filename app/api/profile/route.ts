// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Patient } from "@/models/Patient";
import { Doctor } from "@/models/Doctor";
import { validateEmail, validatePassword, nonEmptyString } from "@/lib/validators";

type ProfileBody = {
  full_name?: string;
  phone?: string;
  email?: string;

  // doctor-only
  qualifications?: string;
  specializations?: string[];

  // optional password change
  currentPassword?: string;
  newPassword?: string;
};

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as ProfileBody | null;
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { role, id } = authUser;
    const isPatient = role === "PATIENT";

    // 🔧 Explicitly branch instead of using a union Model
    const user: any = isPatient
      ? await Patient.findById(id).select("+password").exec()
      : await Doctor.findById(id).select("+password").exec();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const updates: any = {};

    // --- Basic fields ---
    if (body.full_name !== undefined) {
      if (!nonEmptyString(body.full_name)) {
        return NextResponse.json(
          { success: false, error: "Full name cannot be empty." },
          { status: 400 }
        );
      }
      updates.full_name = body.full_name.trim();
    }

    if (body.phone !== undefined) {
      if (!nonEmptyString(body.phone)) {
        return NextResponse.json(
          { success: false, error: "Phone cannot be empty." },
          { status: 400 }
        );
      }
      updates.phone = body.phone.trim();
    }

    if (body.email !== undefined) {
      if (!validateEmail(body.email)) {
        return NextResponse.json(
          { success: false, error: "Invalid email address." },
          { status: 400 }
        );
      }

      const email = body.email.toLowerCase().trim();

      // ensure unique across both collections
      const existingPatient = await Patient.findOne({
        email,
        _id: { $ne: id }
      }).exec();
      const existingDoctor = await Doctor.findOne({
        email,
        _id: { $ne: id }
      }).exec();

      if (existingPatient || existingDoctor) {
        return NextResponse.json(
          {
            success: false,
            error: "Email already in use by another account."
          },
          { status: 409 }
        );
      }

      updates.email = email;
    }

    // --- Doctor-only fields ---
    if (!isPatient) {
      if (body.qualifications !== undefined) {
        updates.qualifications = body.qualifications;
      }

      if (body.specializations !== undefined) {
        const arr = Array.isArray(body.specializations)
          ? body.specializations.map((s) => s.trim()).filter(Boolean)
          : [];
        updates.specializations = arr;
      }
    }

    // --- Optional password change ---
    if (body.currentPassword || body.newPassword) {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Both currentPassword and newPassword are required to change password."
          },
          { status: 400 }
        );
      }

      if (!validatePassword(newPassword)) {
        return NextResponse.json(
          {
            success: false,
            error: "New password must be at least 6 characters."
          },
          { status: 400 }
        );
      }

      const valid = await user.comparePassword(currentPassword);
      if (!valid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      user.password = newPassword; // pre-save hook will hash
    }

    // Apply scalar updates & save
    Object.assign(user, updates);
    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role,
          qualifications: !isPatient ? user.qualifications : undefined,
          specializations: !isPatient ? user.specializations : undefined
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PROFILE_PUT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
