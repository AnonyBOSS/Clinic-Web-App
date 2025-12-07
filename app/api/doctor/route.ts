import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Doctor from '@/models/Doctor';
import Appointment from '@/models/Appointment';
import { getAuthUserFromRequest } from '@/lib/auth-request';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(req);

    // Must be logged in
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Must be a doctor
    if (authUser.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const doctor = await Doctor.findById(authUser.id)
      .populate('clinic_affiliations')
      .lean();

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    let appointments: any[] = [];

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      appointments = await Appointment.find({
        doctor_id: authUser.id,
        createdAt: { $gte: startDate, $lt: endDate },
      })
        .populate('patient_id', 'full_name')
        .populate('clinic_id', 'name')
        .populate('room_id', 'room_number')
        .lean();
    }

    return NextResponse.json(
      {
        success: true,
        doctor,
        schedule: doctor.schedule_days || [],
        appointments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DOCTOR_DASHBOARD_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
