import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Appointment } from "@/models/Appointment";
import { Slot } from "@/models/Slot";
import { getAuthUserFromRequest } from "@/lib/auth-request";

type RouteParams = {
  params: {
    id: string;
  };
};

// DELETE /api/appointments/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointmentId = params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    const isPatient =
      (authUser.role as string) === "patient" &&
      appointment.patient?.toString() === authUser.id;

    const isDoctor =
      (authUser.role as string) === "doctor" &&
      appointment.doctor?.toString() === authUser.id;

    if (!isPatient && !isDoctor) {
      return NextResponse.json(
        { success: false, error: "You are not allowed to cancel this appointment" },
        { status: 403 }
      );
    }

    // Set appointment as cancelled
    appointment.status = "CANCELLED";
    await appointment.save();

    // Free the slot if exists
    if (appointment.slot) {
      await Slot.findByIdAndUpdate(appointment.slot, {
        status: "AVAILABLE",
      });
    }

    return NextResponse.json(
      { success: true, message: "Appointment cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: explicitly block unsupported methods (GET/PUT/PATCH if you like)
// export async function GET() {
//   return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
// }
