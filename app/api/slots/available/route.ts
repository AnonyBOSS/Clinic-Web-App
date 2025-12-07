import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Slot from '@/models/Slot';
import Room from '@/models/Room';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const doctor_id = searchParams.get('doctor_id');
    const clinic_id = searchParams.get('clinic_id');
    const date = searchParams.get('date');

    let query: any = { status: 'available' };

    if (doctor_id) query.doctor_id = doctor_id;
    if (clinic_id) query.clinic_id = clinic_id;

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const slots = await Slot.find(query)
      .populate('room_id')
      .lean();

    return NextResponse.json(slots, { status: 200 });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { doctor_id, clinic_id, room_id, date, time } = await req.json();

    if (!doctor_id || !clinic_id || !room_id || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const slot = await Slot.create({
      doctor_id,
      clinic_id,
      room_id,
      date: new Date(date),
      time,
      status: 'available',
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
