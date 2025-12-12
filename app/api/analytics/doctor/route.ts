// app/api/analytics/doctor/route.ts
// Analytics endpoint for doctors - provides appointment stats and predictions
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Appointment } from "@/models/Appointment";
import { Slot } from "@/models/Slot";
import { DoctorRating } from "@/models/DoctorRating";
import "@/models/Patient";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser || authUser.role !== "DOCTOR") {
            return NextResponse.json(
                { success: false, error: "Unauthorized - doctors only" },
                { status: 401 }
            );
        }

        const doctorId = authUser.id;
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Get date ranges
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);
        const last30DaysStr = last30Days.toISOString().split("T")[0];

        const next7Days = new Date(today);
        next7Days.setDate(today.getDate() + 7);
        const next7DaysStr = next7Days.toISOString().split("T")[0];

        // Fetch all appointments for this doctor
        const allAppointments = await Appointment.find({ doctor: doctorId })
            .populate("slot", "date time")
            .populate("patient", "full_name")
            .lean();

        // Calculate stats
        const totalAppointments = allAppointments.length;
        const completedAppointments = allAppointments.filter((a: any) => a.status === "COMPLETED").length;
        const cancelledAppointments = allAppointments.filter((a: any) => a.status === "CANCELLED").length;
        const upcomingAppointments = allAppointments.filter((a: any) =>
            a.status === "BOOKED" || a.status === "CONFIRMED"
        );

        // Revenue calculation
        const totalRevenue = allAppointments
            .filter((a: any) => a.status === "COMPLETED" && a.payment?.status === "PAID")
            .reduce((sum: number, a: any) => sum + (a.payment?.amount || 0), 0);

        // Calculate appointments per day for the last 30 days
        const appointmentsByDay: Record<string, number> = {};
        allAppointments.forEach((apt: any) => {
            const date = apt.slot?.date;
            if (date && date >= last30DaysStr) {
                appointmentsByDay[date] = (appointmentsByDay[date] || 0) + 1;
            }
        });

        // Convert to array for chart
        const dailyStats = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            dailyStats.push({
                date: dateStr,
                appointments: appointmentsByDay[dateStr] || 0
            });
        }

        // Upcoming appointments for next 7 days
        const upcomingByDay: Record<string, number> = {};
        upcomingAppointments.forEach((apt: any) => {
            const date = apt.slot?.date;
            if (date && date >= todayStr && date <= next7DaysStr) {
                upcomingByDay[date] = (upcomingByDay[date] || 0) + 1;
            }
        });

        const upcomingStats = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().split("T")[0];
            const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
            upcomingStats.push({
                date: dateStr,
                day: dayName,
                appointments: upcomingByDay[dateStr] || 0
            });
        }

        // Get ratings
        const ratings = await DoctorRating.find({ doctor: doctorId }).lean();
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;

        // Busy hours analysis
        const hourCounts: Record<string, number> = {};
        allAppointments.forEach((apt: any) => {
            const time = apt.slot?.time;
            if (time) {
                const hour = time.split(":")[0];
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            }
        });

        const busyHours = Object.entries(hourCounts)
            .map(([hour, count]) => ({ hour: `${hour}:00`, appointments: count }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

        // Available slots count
        const availableSlots = await Slot.countDocuments({
            doctor: doctorId,
            status: "AVAILABLE",
            date: { $gte: todayStr }
        });

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalAppointments,
                    completedAppointments,
                    cancelledAppointments,
                    upcomingCount: upcomingAppointments.length,
                    totalRevenue,
                    avgRating: Math.round(avgRating * 10) / 10,
                    totalRatings: ratings.length,
                    availableSlots
                },
                dailyStats,
                upcomingStats,
                busyHours,
                upcomingAppointments: upcomingAppointments.slice(0, 10).map((apt: any) => ({
                    id: apt._id,
                    patient: apt.patient?.full_name || "Unknown",
                    date: apt.slot?.date,
                    time: apt.slot?.time,
                    status: apt.status
                }))
            }
        });
    } catch (error) {
        console.error("[ANALYTICS_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Failed to load analytics" },
            { status: 500 }
        );
    }
}
