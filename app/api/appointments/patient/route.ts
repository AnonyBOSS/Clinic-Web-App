import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth-request';
import { connectDB } from '@/lib/db/connection';
import Appointment from '@/models/Appointment';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authUser.role !== 'patient') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();

    // adjust field names if your model uses patient_id / doctor_id etc.
    const appointments = await Appointment.find({
      patient: authUser.id,
    })
      .populate('doctor', 'full_name specializations')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error('[PATIENT_APPOINTMENTS_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
