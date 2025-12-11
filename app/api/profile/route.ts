// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Patient } from "@/models/Patient";
import { Doctor } from "@/models/Doctor";
import { Appointment } from "@/models/Appointment";
import { Slot } from "@/models/Slot";
import { Notification } from "@/models/Notification";
import { Message } from "@/models/Message";
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

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const { role, id } = authUser;
    const isPatient = role === "PATIENT";

    // Find the user to ensure they exist
    const user = isPatient
      ? await Patient.findById(id).exec()
      : await Doctor.findById(id).exec();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    // 1. Delete appointments and release their slots
    const appointments = await Appointment.find(
      isPatient ? { patient: id } : { doctor: id }
    ).exec();

    for (const appt of appointments) {
      // Release the slot back to AVAILABLE if not already
      if (appt.slot) {
        await Slot.findByIdAndUpdate(appt.slot, { status: "AVAILABLE" }).exec();
      }
    }

    await Appointment.deleteMany(
      isPatient ? { patient: id } : { doctor: id }
    ).exec();

    // 2. If doctor, delete all their generated slots
    if (!isPatient) {
      await Slot.deleteMany({ doctor: id }).exec();
    }

    // 3. Delete all notifications for this user
    await Notification.deleteMany({ user: id }).exec();

    // 4. Delete all messages sent or received by this user
    await Message.deleteMany({
      $or: [{ sender: id }, { receiver: id }]
    }).exec();

    // 5. Delete the user record
    if (isPatient) {
      await Patient.findByIdAndDelete(id).exec();
    } else {
      await Doctor.findByIdAndDelete(id).exec();
    }

    // 6. Clear auth cookie
    const response = NextResponse.json(
      { success: true, message: "Account deleted successfully." },
      { status: 200 }
    );

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error("[PROFILE_DELETE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
