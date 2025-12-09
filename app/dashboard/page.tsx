// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

type Role = "PATIENT" | "DOCTOR";

type CurrentUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  qualifications?: string;
  specializations?: string[];
};

type AppointmentItem = {
  _id: string;
  status: "BOOKED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  payment?: {
    amount: number;
    method: "CASH" | "CARD";
    status: "PAID" | "REFUNDED" | "FAILED";
    timestamp: string;
  };
  doctor?: {
    full_name: string;
    specializations?: string[];
  };
  patient?: {
    full_name: string;
    email: string;
  };
  clinic?: {
    name: string;
    address?: {
      city?: string;
      governorate?: string;
    };
  };
  room?: {
    room_number: string;
  };
  slot?: {
    date: string; // "YYYY-MM-DD"
    time: string; // "HH:MM"
  };
};

function parseDate(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const full = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
  const d = new Date(full);
  return isNaN(d.getTime()) ? null : d;
}

export default function DashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // 1) Current user
        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!meRes.ok) {
          setError("You are not logged in. Please sign in first.");
          setUser(null);
          setLoading(false);
          return;
        }

        const meJson = await meRes.json();
        const me = meJson.data as CurrentUser;
        setUser(me);

        // 2) Their appointments
        const apptRes = await fetch("/api/appointments", {
          credentials: "include",
        });

        if (apptRes.ok) {
          const apptJson = await apptRes.json();
          const list = (apptJson.data as AppointmentItem[]) ?? [];

          // sort by date/time ascending
          const sorted = [...list].sort((a, b) => {
            const da = parseDate(a.slot?.date, a.slot?.time);
            const db = parseDate(b.slot?.date, b.slot?.time);
            if (!da || !db) return 0;
            return da.getTime() - db.getTime();
          });

          setAppointments(sorted);
        } else {
          setAppointments([]);
        }
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const todaysAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.slot?.date === todayStr &&
          a.status !== "CANCELLED" &&
          a.status !== "COMPLETED"
      ),
    [appointments, todayStr]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (a.slot?.date ?? "") >= todayStr &&
          a.status !== "CANCELLED" &&
          a.status !== "COMPLETED"
      ),
    [appointments, todayStr]
  );

  const pastAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => (a.slot?.date ?? "") < todayStr || a.status === "COMPLETED"
      ),
    [appointments, todayStr]
  );

  if (loading) {
    return (
      <PageShell title="Dashboard">
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        title="Dashboard"
        description="You need to sign in to access your appointments."
      >
        {error && <p className="text-sm text-red-600">{error}</p>}
      </PageShell>
    );
  }

  const isPatient = user.role === "PATIENT";
  const roleLabel = isPatient ? "Patient" : "Doctor";

  const nextAppointment = upcomingAppointments[0];

  const counterpartLabel = (appt: AppointmentItem) =>
    isPatient
      ? appt.doctor?.full_name ?? "Doctor"
      : appt.patient?.full_name ?? "Patient";

  const clinicLocation = (appt: AppointmentItem) => {
    if (!appt.clinic) return "Clinic";
    const city = appt.clinic.address?.city;
    return city ? `${appt.clinic.name} · ${city}` : appt.clinic.name;
  };

  const slotLabel = (appt: AppointmentItem) =>
    appt.slot ? `${appt.slot.date} · ${appt.slot.time}` : "";

  return (
    <PageShell
      title={`Welcome back, ${user.full_name}`}
      description={`You are signed in as ${roleLabel.toLowerCase()}.`}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Top card: Today / Next appointment */}
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                {isPatient ? "Your next appointment" : "Today’s schedule"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {isPatient && (
                  <Link href="/book">
                    <Button size="sm">Book new appointment</Button>
                  </Link>
                )}
                {!isPatient && (
                  <Link href="/doctor/schedule">
                    <Button size="sm" variant="outline">
                      Manage schedule
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {isPatient ? (
              nextAppointment ? (
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">
                    {counterpartLabel(nextAppointment)}{" "}
                    <span className="mx-1 text-xs text-slate-400">·</span>
                    <span className="capitalize text-xs text-slate-500">
                      {nextAppointment.status.toLowerCase()}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {clinicLocation(nextAppointment)}
                    {nextAppointment.room?.room_number
                      ? ` · Room ${nextAppointment.room.room_number}`
                      : ""}
                  </p>
                  <p className="text-xs text-slate-500">
                    {slotLabel(nextAppointment)}
                  </p>
                  {nextAppointment.notes && (
                    <p className="mt-1 text-xs text-slate-600">
                      Notes: {nextAppointment.notes}
                    </p>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No upcoming appointments"
                  description="Once you book an appointment, it will appear here."
                />
              )
            ) : todaysAppointments.length === 0 ? (
              <EmptyState
                title="No appointments today"
                description="You have no booked patients for today."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {todaysAppointments.map((appt) => (
                  <li
                    key={appt._id}
                    className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {counterpartLabel(appt)}{" "}
                        <span className="mx-1 text-xs text-slate-400">·</span>
                        <span className="capitalize text-xs text-slate-500">
                          {appt.status.toLowerCase()}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {clinicLocation(appt)}
                        {appt.room?.room_number
                          ? ` · Room ${appt.room.room_number}`
                          : ""}
                      </p>
                      {appt.notes && (
                        <p className="mt-1 text-xs text-slate-600">
                          Notes: {appt.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 sm:text-right">
                      {slotLabel(appt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Upcoming appointments list */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Upcoming appointments
              </h2>
              <span className="text-xs text-slate-500">
                {upcomingAppointments.length} total
              </span>
            </div>

            {upcomingAppointments.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                description={
                  isPatient
                    ? "Use the book button above to schedule a visit."
                    : "Your schedule is currently clear."
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingAppointments.map((appt) => (
                  <li
                    key={appt._id}
                    className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {counterpartLabel(appt)}{" "}
                        <span className="mx-1 text-xs text-slate-400">·</span>
                        <span className="capitalize text-xs text-slate-500">
                          {appt.status.toLowerCase()}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {clinicLocation(appt)}
                        {appt.room?.room_number
                          ? ` · Room ${appt.room.room_number}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 sm:text-right">
                      {slotLabel(appt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Past appointments (patient mostly) */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Past appointments
              </h2>
              <span className="text-xs text-slate-500">
                {pastAppointments.length} total
              </span>
            </div>

            {pastAppointments.length === 0 ? (
              <EmptyState
                title="No past appointments"
                description="Your completed visits will appear here over time."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {pastAppointments.map((appt) => (
                  <li
                    key={appt._id}
                    className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {counterpartLabel(appt)}{" "}
                        <span className="mx-1 text-xs text-slate-400">·</span>
                        <span className="capitalize text-xs text-slate-500">
                          {appt.status.toLowerCase()}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {clinicLocation(appt)}
                        {appt.room?.room_number
                          ? ` · Room ${appt.room.room_number}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 sm:text-right">
                      {slotLabel(appt)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Right column: profile summary */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Profile summary
          </h2>
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Full name:</span>{" "}
              {user.full_name}
            </p>
            <p>
              <span className="font-medium text-slate-800">Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-medium text-slate-800">Phone:</span>{" "}
              {user.phone}
            </p>
            <p>
              <span className="font-medium text-slate-800">Role:</span>{" "}
              {roleLabel}
            </p>

            {!isPatient && (
              <>
                {user.qualifications && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Qualifications:
                    </span>{" "}
                      {user.qualifications}
                  </p>
                )}
                {user.specializations && user.specializations.length > 0 && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Specializations:
                    </span>{" "}
                    {user.specializations.join(", ")}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
            {isPatient ? (
              <>
                <p>
                  • You can book, view and cancel appointments directly from
                  this dashboard.
                </p>
                <p>• Keep your phone and email up to date for reminders.</p>
              </>
            ) : (
              <>
                <p>
                  • Use the schedule page to define working days and generate
                  slots.
                </p>
                <p>
                  • Your dashboard aggregates patient bookings across all
                  clinics.
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
