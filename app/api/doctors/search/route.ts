import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Doctor } from '@/models/Doctor';
// Import referenced models for populate()
import '@/models/Clinic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization');
    const city = searchParams.get('city');
    const clinic_id = searchParams.get('clinic_id');

    let query: any = {};

    if (specialization) {
      query.specializations = { $in: [specialization] };
    }

    if (clinic_id) {
      query.clinic_affiliations = clinic_id;
    }

    const doctors = await Doctor.find(query)
      .populate('clinic_affiliations')
      .lean();

    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    console.error('Error searching doctors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
