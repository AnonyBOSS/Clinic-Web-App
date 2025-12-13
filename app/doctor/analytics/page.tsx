// app/doctor/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useTranslation } from "@/lib/i18n";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

interface AnalyticsData {
    summary: {
        totalAppointments: number;
        completedAppointments: number;
        cancelledAppointments: number;
        upcomingCount: number;
        totalRevenue: number;
        avgRating: number;
        totalRatings: number;
        availableSlots: number;
    };
    dailyStats: Array<{ date: string; appointments: number }>;
    upcomingStats: Array<{ date: string; day: string; appointments: number }>;
    busyHours: Array<{ hour: string; appointments: number }>;
    upcomingAppointments: Array<{
        id: string;
        patient: string;
        date: string;
        time: string;
        status: string;
    }>;
}

const COLORS = ["#6366f1", "#22c55e", "#ef4444", "#f59e0b"];

export default function DoctorAnalyticsPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch("/api/analytics/doctor", { credentials: "include" });
                if (res.status === 401) {
                    router.push("/login");
                    return;
                }
                const json = await res.json();
                if (!res.ok) {
                    setError(json.error || t.errors.somethingWentWrong);
                    return;
                }
                setData(json.data);
            } catch {
                setError(t.errors.somethingWentWrong);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, [router, t.errors.somethingWentWrong]);

    if (loading) {
        return (
            <PageShell title={t.analytics.title}>
                <LoadingSpinner />
            </PageShell>
        );
    }

    if (error || !data) {
        return (
            <PageShell title={t.analytics.title}>
                <Card className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error || t.errors.somethingWentWrong}</p>
                    <Link
                        href="/dashboard"
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                    >
                        ← {t.common.back}
                    </Link>
                </Card>
            </PageShell>
        );
    }

    const pieData = [
        { name: t.appointments.completed, value: data.summary.completedAppointments },
        { name: t.dashboard.upcomingAppointments, value: data.summary.upcomingCount },
        { name: t.appointments.cancelled, value: data.summary.cancelledAppointments }
    ].filter(d => d.value > 0);

    return (
        <PageShell
            title={`📊 ${t.analytics.title}`}
            description={t.analytics.description}
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card variant="glass" className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {t.dashboard.totalAppointments}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                        {data.summary.totalAppointments}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {data.summary.completedAppointments} {t.dashboard.completedAppointments.toLowerCase()}
                    </p>
                </Card>

                <Card variant="glass" className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {t.analytics.totalRevenue}
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                        {data.summary.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        EGP
                    </p>
                </Card>

                <Card variant="glass" className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {t.analytics.avgRating}
                    </p>
                    <p className="text-3xl font-bold text-amber-500 mt-2">
                        {data.summary.avgRating > 0 ? (
                            <>⭐ {data.summary.avgRating}</>
                        ) : (
                            <span className="text-slate-400">{t.common.notAvailable}</span>
                        )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {data.summary.totalRatings} {t.doctors.reviews.toLowerCase()}
                    </p>
                </Card>

                <Card variant="glass" className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-500/20 to-transparent rounded-bl-full" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {t.analytics.availableSlots}
                    </p>
                    <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mt-2">
                        {data.summary.availableSlots}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t.nav.booking}
                    </p>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {t.analytics.appointmentsLast30}
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(v) => v.slice(5)}
                                    stroke="#94a3b8"
                                />
                                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "none",
                                        borderRadius: "12px",
                                        color: "#fff",
                                        boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="appointments"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={false}
                                    strokeLinecap="round"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {t.analytics.upcomingWeek}
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.upcomingStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "none",
                                        borderRadius: "12px",
                                        color: "#fff"
                                    }}
                                />
                                <Bar
                                    dataKey="appointments"
                                    fill="#22c55e"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        {t.analytics.appointmentStatus}
                    </h2>
                    <div className="h-48">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                        labelLine={{ stroke: "#94a3b8" }}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "none",
                                            borderRadius: "12px",
                                            color: "#fff"
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                {t.dashboard.noAppointments}
                            </div>
                        )}
                    </div>
                </Card>

                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {t.analytics.busiestHours}
                    </h2>
                    <div className="h-48">
                        {data.busyHours.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.busyHours} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis
                                        dataKey="hour"
                                        type="category"
                                        tick={{ fontSize: 10 }}
                                        stroke="#94a3b8"
                                        width={40}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "none",
                                            borderRadius: "12px",
                                            color: "#fff"
                                        }}
                                    />
                                    <Bar dataKey="appointments" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                {t.dashboard.noAppointments}
                            </div>
                        )}
                    </div>
                </Card>

                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                        {t.analytics.upcomingAppointments}
                    </h2>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                        {data.upcomingAppointments.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                                {t.dashboard.noAppointments}
                            </p>
                        ) : (
                            data.upcomingAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-700/50 border border-slate-100 dark:border-dark-600"
                                >
                                    <div>
                                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                                            {apt.patient}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {apt.date} - {apt.time}
                                        </p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${apt.status === "CONFIRMED"
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                                        }`}>
                                        {apt.status === "CONFIRMED" ? t.appointments.confirm : t.appointments.booked}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </PageShell>
    );
}
