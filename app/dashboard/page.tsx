// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";

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
          credentials: "include"
        });
        if (!meRes.ok) {
          setError("You are not logged in. Please sign in first.");
          setUser(null);
          setLoading(false);
          return;
        }
        const meJson = await meRes.json();
        setUser(meJson.data as CurrentUser);

        // 2) Appointments (for this patient/doctor)
        const apptRes = await fetch("/api/appointments", {
          credentials: "include"
        });

        if (apptRes.ok) {
          const apptJson = await apptRes.json();
          setAppointments(apptJson.data as AppointmentItem[]);
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
      appointments.filter((a) => a.slot?.date === todayStr),
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

  const roleLabel = user.role === "PATIENT" ? "Patient" : "Doctor";

  return (
    <PageShell
      title={`Welcome back, ${user.full_name}`}
      description={`You are signed in as ${roleLabel}.`}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: schedule & upcoming */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today schedule (doctor) or next appointment (patient) */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                {user.role === "DOCTOR"
                  ? "Today's schedule"
                  : "Your next appointment"}
              </h2>
              {user.role === "PATIENT" && (
                <Link href="/book">
                  <Button size="sm">Book new appointment</Button>
                </Link>
              )}
            </div>

            {user.role === "DOCTOR" ? (
              todaysAppointments.length === 0 ? (
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
                          {appt.patient?.full_name ?? "Patient"}{" "}
                          <span className="mx-1 text-xs text-slate-400">
                            ·
                          </span>
                          <span className="capitalize text-xs text-slate-500">
                            {appt.status.toLowerCase()}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {appt.clinic?.name ?? "Clinic"}
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
                        {appt.slot?.time} on {appt.slot?.date}
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              // PATIENT view: just show the nearest upcoming appointment, if any
              <>
                {appointments.length === 0 ? (
                  <EmptyState
                    title="No upcoming appointments"
                    description="Once you book an appointment, it will appear here."
                  />
                ) : (
                  <div className="space-y-1 text-sm text-slate-700">
                    {(() => {
                      const next = appointments[0];
                      return (
                        <>
                          <p className="font-medium">
                            {next.doctor?.full_name ?? "Doctor"}{" "}
                            <span className="mx-1 text-xs text-slate-400">
                              ·
                            </span>
                            <span className="capitalize text-xs text-slate-500">
                              {next.status.toLowerCase()}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500">
                            {next.clinic?.name ?? "Clinic"}
                            {next.room?.room_number
                              ? ` · Room ${next.room.room_number}`
                              : ""}
                          </p>
                          <p className="text-xs text-slate-500">
                            {next.slot?.date} · {next.slot?.time}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </Card>

          {/* All upcoming appointments list */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                All upcoming appointments
              </h2>
              <span className="text-xs text-slate-500">
                {appointments.length} total
              </span>
            </div>

            {appointments.length === 0 ? (
              <EmptyState
                title="No upcoming appointments"
                description={
                  user.role === "PATIENT"
                    ? "Use the Book button above to schedule a visit."
                    : "Your schedule is clear for now."
                }
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {appointments.map((appt) => {
                  const counterpartName =
                    user.role === "PATIENT"
                      ? appt.doctor?.full_name ?? "Doctor"
                      : appt.patient?.full_name ?? "Patient";

                  const clinicLocation = appt.clinic?.address?.city
                    ? `${appt.clinic?.name} · ${appt.clinic?.address?.city}`
                    : appt.clinic?.name ?? "Clinic";

                  const slotLabel = appt.slot
                    ? `${appt.slot.date} · ${appt.slot.time}`
                    : "";

                  return (
                    <li
                      key={appt._id}
                      className="flex flex-col gap-2 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {counterpartName}{" "}
                          <span className="mx-1 text-xs text-slate-400">
                            ·
                          </span>
                          <span className="capitalize text-xs text-slate-500">
                            {appt.status.toLowerCase()}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {clinicLocation}
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
                        {slotLabel}
                      </div>
                    </li>
                  );
                })}
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
              <span className="font-medium text-slate-800">
                Full name:
              </span>{" "}
              {user.full_name}
            </p>
            <p>
              <span className="font-medium text-slate-800">
                Email:
              </span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-medium text-slate-800">
                Phone:
              </span>{" "}
              {user.phone}
            </p>
            <p>
              <span className="font-medium text-slate-800">Role:</span>{" "}
              {roleLabel}
            </p>

            {user.role === "DOCTOR" && (
              <>
                {user.qualifications && (
                  <p>
                    <span className="font-medium text-slate-800">
                      Qualifications:
                    </span>{" "}
                    {user.qualifications}
                  </p>
                )}
                {user.specializations &&
                  user.specializations.length > 0 && (
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
        </Card>
      </div>
    </PageShell>
  );
}
