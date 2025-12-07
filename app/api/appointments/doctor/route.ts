// app/api/appointments/doctor/route.ts
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

    if (authUser.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();

    const appointments = await Appointment.find({
      doctor: authUser.id,
    })
      .populate('patient', 'full_name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error('[DOCTOR_APPOINTMENTS_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
