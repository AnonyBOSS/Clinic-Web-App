import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Doctor from '@/models/Doctor';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import Clinic from '@/models/Clinic';
import Room from '@/models/Room';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const doctor = await Doctor.findById(id)
      .populate('clinic_affiliations')
      .lean();

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    let appointments: any[] = [];

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      appointments = await Appointment.find({
        doctor_id: id,
        createdAt: { $gte: startDate, $lt: endDate },
      })
        .populate('patient_id', 'full_name')
        .populate('clinic_id', 'name')
        .populate('room_id', 'room_number')
        .lean();
    }

    return NextResponse.json(
      {
        doctor,
        schedule: doctor.schedule_days || [],
        appointments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await req.json();
    const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    console.error('Error updating doctor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
