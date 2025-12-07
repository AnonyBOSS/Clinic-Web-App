import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Payment from '@/models/Payment';
import Appointment from '@/models/Appointment';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      appointment_id,
      amount,
      method,
      transaction_id,
    } = await req.json();

    if (!appointment_id || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findById(appointment_id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = await Payment.create({
      appointment_id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      amount,
      method,
      transaction_id,
      status: 'paid',
      timestamp: new Date(),
    });

    // Update appointment's embedded payment
    appointment.payment = {
      amount,
      method,
      transaction_id: transaction_id || '',
      status: 'paid',
      timestamp: new Date(),
    };

    await appointment.save();

    return NextResponse.json(
      {
        message: 'Payment processed successfully',
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const appointment_id = searchParams.get('appointment_id');

    let query: any = {};

    if (appointment_id) {
      query.appointment_id = appointment_id;
    }

    const payments = await Payment.find(query).lean();

    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
