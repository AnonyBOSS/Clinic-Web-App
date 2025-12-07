import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth-request';
import { connectDB } from '@/lib/db/connection';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    if (authUser.role === 'patient') {
      const patient = await Patient.findById(authUser.id).lean();

      if (!patient) {
        return NextResponse.json(
          { success: false, message: 'Patient not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: patient._id.toString(),
          role: 'patient',
          full_name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
        },
      });
    }

    if (authUser.role === 'doctor') {
      const doctor = await Doctor.findById(authUser.id).lean();

      if (!doctor) {
        return NextResponse.json(
          { success: false, message: 'Doctor not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: doctor._id.toString(),
          role: 'doctor',
          full_name: doctor.full_name,
          email: doctor.email,
          specializations: doctor.specializations,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Unsupported role' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[AUTH_ME_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
