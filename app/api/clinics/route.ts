import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Clinic from '@/models/Clinic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const clinics = await Clinic.find({}).lean();
    return NextResponse.json(clinics, { status: 200 });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    const clinic = await Clinic.create(data);
    return NextResponse.json(clinic, { status: 201 });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
