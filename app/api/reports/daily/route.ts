import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import Appointment from '@/models/Appointment';
import Payment from '@/models/Payment';
import Slot from '@/models/Slot';
import { getAuthUserFromRequest } from '@/lib/auth-request';

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

    // For now, restrict to doctors (or future admins if you add that role)
    if (authUser.role !== 'doctor') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: only doctors can view daily reports' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date parameter is required (YYYY-MM-DD format)',
        },
        { status: 400 }
      );
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get appointments for the day
    const appointments = await Appointment.find({
      createdAt: { $gte: startDate, $lt: endDate },
    }).lean();

    // Get total paid amount
    const payments = await Payment.find({
      timestamp: { $gte: startDate, $lt: endDate },
      status: 'paid',
    }).lean();

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Count cancellations
    const cancellations = appointments.filter(
      (a) => a.status === 'cancelled'
    ).length;

    // Calculate slot utilization
    const slots = await Slot.find({
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    const bookedSlots = slots.filter((s) => s.status === 'booked').length;
    const slotUtilization =
      slots.length > 0 ? (bookedSlots / slots.length) * 100 : 0;

    return NextResponse.json(
      {
        success: true,
        date,
        total_appointments: appointments.length,
        total_paid: totalPaid,
        cancellations,
        slot_utilization: slotUtilization.toFixed(2),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
