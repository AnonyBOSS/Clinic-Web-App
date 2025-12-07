import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Patient from '@/models/Patient';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient || !(await patient.comparePassword(password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: patient._id.toString(),
      email: patient.email,
      role: 'patient',
    });

    const response = NextResponse.json(
      {
        // keep this so your current frontend keeps working
        token,
        patient: {
          id: patient._id.toString(),
          full_name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
        },
      },
      { status: 200 }
    );

    // NEW: set HttpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('[PATIENT_LOGIN_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
