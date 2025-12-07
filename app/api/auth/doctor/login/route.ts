// app/api/auth/doctor/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Doctor from '@/models/Doctor';
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

    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor || !(await doctor.comparePassword(password))) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: doctor._id.toString(),
      email: doctor.email,
      role: 'doctor',
    });

    const response = NextResponse.json(
      {
        token, // kept for current frontend
        doctor: {
          id: doctor._id.toString(),
          full_name: doctor.full_name,
          email: doctor.email,
          specializations: doctor.specializations,
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
