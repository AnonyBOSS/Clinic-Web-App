// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Payment } from "@/models/Payment";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authUser = getAuthUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filter: any = {};
    if (authUser.role === "DOCTOR") {
      filter.doctor = authUser.id;
    } else {
      filter.patient = authUser.id;
    }

    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const payments = await Payment.find(filter)
      .sort({ timestamp: -1 })
      .exec();

    return NextResponse.json(
      { success: true, data: payments },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PAYMENTS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
