import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Appointment from '@/models/Appointment';
import Slot from '@/models/Slot';
import Payment from '@/models/Payment';
import { getAuthUserFromRequest } from '@/lib/auth-request';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authUser.role !== 'patient') {
      return NextResponse.json(
        { success: false, error: 'Only patients can book appointments' },
        { status: 403 }
      );
    }

    const {
      // patient_id,  // ❌ no longer trusted from client
      doctor_id,
      clinic_id,
      slot_id,
      room_id,
      payment_amount,
      payment_method,
    } = await req.json();

    if (!doctor_id || !clinic_id || !slot_id || !room_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Atomically update slot to prevent race conditions
    const updatedSlot = await Slot.findOneAndUpdate(
      { _id: slot_id, status: 'available' },
      { status: 'booked' },
      { new: true }
    );

    if (!updatedSlot) {
      return NextResponse.json(
        { success: false, error: 'Slot is no longer available' },
        { status: 400 }
      );
    }

    // Create appointment with embedded payment
    const appointment = await Appointment.create({
      patient_id: authUser.id, // ✅ from token, not client body
      doctor_id,
      clinic_id,
      room_id,
      slot_id,
      status: 'booked',
      payment: {
        amount: payment_amount || 0,
        method: payment_method || 'cash',
        status: 'pending',
        timestamp: new Date(),
      },
    });

    // Also create a separate payment record
    await Payment.create({
      appointment_id: appointment._id,
      patient_id: authUser.id, // ✅ from token
      doctor_id,
      amount: payment_amount || 0,
      method: payment_method || 'cash',
      status: 'pending',
      timestamp: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully',
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authUser = getAuthUserFromRequest(req);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authUser.role !== 'patient') {
      return NextResponse.json(
        { success: false, error: 'Only patients can view their appointments' },
        { status: 403 }
      );
    }

    // We ignore any patient_id query param now and always use the one from the token
    const appointments = await Appointment.find({ patient_id: authUser.id })
      .populate('doctor_id', 'full_name specializations')
      .populate('clinic_id', 'name address')
      .populate('room_id', 'room_number type')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, appointments },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
