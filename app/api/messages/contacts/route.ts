// app/api/messages/contacts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Appointment } from "@/models/Appointment";
import { Doctor } from "@/models/Doctor";
import { Patient } from "@/models/Patient";

// GET: Fetch available contacts for messaging
// For patients: doctors from their appointments
// For doctors: patients from their appointments
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

        const contacts: { id: string; name: string; type: "PATIENT" | "DOCTOR" }[] = [];

        if (authUser.role === "PATIENT") {
            // Get unique doctors from patient's appointments
            const appointments = await Appointment.find({ patient: authUser.id })
                .select("doctor")
                .lean();

            const doctorIds = [...new Set(appointments.map(a => String(a.doctor)))];

            for (const doctorId of doctorIds) {
                const doctor = await Doctor.findById(doctorId).select("full_name").lean();
                if (doctor) {
                    contacts.push({
                        id: doctorId,
                        name: (doctor as any).full_name,
                        type: "DOCTOR"
                    });
                }
            }
        } else {
            // Get unique patients from doctor's appointments
            const appointments = await Appointment.find({ doctor: authUser.id })
                .select("patient")
                .lean();

            const patientIds = [...new Set(appointments.map(a => String(a.patient)))];

            for (const patientId of patientIds) {
                const patient = await Patient.findById(patientId).select("full_name").lean();
                if (patient) {
                    contacts.push({
                        id: patientId,
                        name: (patient as any).full_name,
                        type: "PATIENT"
                    });
                }
            }
        }

        return NextResponse.json(
            { success: true, data: contacts },
            { status: 200 }
        );
    } catch (error) {
        console.error("[MESSAGES_CONTACTS_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
