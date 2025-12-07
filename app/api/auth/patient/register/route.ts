import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Patient from '@/models/Patient';
import { generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { full_name, email, password, phone } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingPatient = await Patient.findOne({ email });

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const patient = await Patient.create({
      full_name,
      email,
      password,
      phone: phone || '',
    });

    const token = generateToken({
      id: patient._id.toString(),
      email: patient.email,
      role: 'patient',
    });

    return NextResponse.json(
      {
        token,
        patient: {
          id: patient._id,
          full_name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
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
