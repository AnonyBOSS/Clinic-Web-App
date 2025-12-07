import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Doctor from '@/models/Doctor';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { full_name, email, password, phone, specializations } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const doctor = await Doctor.create({
      full_name,
      email,
      password,
      phone: phone || '',
      specializations: specializations || [],
    });

    const token = generateToken({
      id: doctor._id.toString(),
      email: doctor.email,
      role: 'doctor',
    });

    return NextResponse.json(
      {
        token,
        doctor: {
          id: doctor._id,
          full_name: doctor.full_name,
          email: doctor.email,
          specializations: doctor.specializations,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
