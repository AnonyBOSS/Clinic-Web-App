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
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
  };
};

function parseDate(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const full = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
  const d = new Date(full);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateHuman(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function isFutureAppointment(appt: AppointmentItem): boolean {
  const d = parseDate(appt.slot?.date, appt.slot?.time);
  if (!d) return false;
  return d.getTime() > Date.now();
}

function canPatientCancel(appt: AppointmentItem): boolean {
  if (appt.status === "CANCELLED" || appt.status === "COMPLETED") {
    return false;
  }
  return isFutureAppointment(appt);
}

function statusPillClasses(status: AppointmentItem["status"]): string {
  switch (status) {
    case "BOOKED":
      return "bg-sky-50 text-sky-700 border-sky-100";
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "COMPLETED":
      return "bg-slate-50 text-slate-700 border-slate-100";
    case "CANCELLED":
    default:
      return "bg-red-50 text-red-700 border-red-100";
  }
}

function counterpartLabel(userRole: Role) {
  return userRole === "PATIENT" ? "Doctor" : "Patient";
}

export default function DashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  // Banner hide state (per tab)
  const [hideAutoCancelBanner, setHideAutoCancelBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = window.sessionStorage.getItem("autoCancelBannerSeen");
      if (seen === "true") {
        setHideAutoCancelBanner(true);
      }
    }

    async function load() {
      try {
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
        const me = meJson.data as CurrentUser;
        setUser(me);

        const apptRes = await fetch("/api/appointments", {
          credentials: "include"
        });

        if (apptRes.ok) {
          const apptJson = await apptRes.json();
          const list = (apptJson.data as AppointmentItem[]) ?? [];

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
          (a.slot?.date ?? "") > todayStr &&
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

  const autoCancelledUpcoming = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.status === "CANCELLED" &&
          a.notes?.includes("[Auto-cancelled due to schedule update]") &&
          isFutureAppointment(a)
      ),
    [appointments]
  );

  async function handleCancel(appointmentId: string) {
    setCancelLoadingId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to cancel appointment.");
        return;
      }

      const updated = data?.data as {
        id: string;
        status: AppointmentItem["status"];
        notes?: string;
      };

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === updated.id
            ? {
              ...a,
              status: updated.status,
              notes: updated.notes ?? a.notes
            }
            : a
        )
      );
    } catch (err) {
      setError("Network error while cancelling appointment.");
      console.error("Cancel request failed", err);
    } finally {
      setCancelLoadingId(null);
    }
  }

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

  const totalUpcoming = todaysAppointments.length + upcomingAppointments.length;
  const totalPast = pastAppointments.length;

  return (
    <PageShell
      title={`Welcome back, ${user.full_name}`}
      description={`You are signed in as ${roleLabel.toLowerCase()}.`}
    >
      <div className="space-y-4">
        {/* Auto-cancel banner for patients, dismissible per tab */}
        {isPatient &&
          autoCancelledUpcoming.length > 0 &&
          !hideAutoCancelBanner && (
            <Card className="border border-amber-200 dark:border-amber-700/50 bg-amber-50/80 dark:bg-amber-900/30 px-4 py-3 text-xs text-amber-900 dark:text-amber-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mb-1 font-semibold">
                    Some of your appointments were cancelled.
                  </p>
                  <p className="dark:text-amber-200">
                    One or more of your upcoming appointments was automatically
                    cancelled because the doctor changed their schedule. Please
                    book a new suitable time.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                  onClick={() => {
                    setHideAutoCancelBanner(true);
                    if (typeof window !== "undefined") {
                      window.sessionStorage.setItem(
                        "autoCancelBannerSeen",
                        "true"
                      );
                    }
                  }}
                >
                  Dismiss
                </button>
              </div>
            </Card>
          )}

        {error && (
          <Card className="border border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/30 px-4 py-2 text-xs text-red-700 dark:text-red-200">
            {error}
          </Card>
        )}

        {/* Top summary cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Today&apos;s appointments
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {todaysAppointments.length}
            </p>
          </Card>
          <Card className="px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Upcoming appointments
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {totalUpcoming}
            </p>
          </Card>
          <Card className="px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Past & completed
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {totalPast}
            </p>
          </Card>
        </div>

        {/* Main content grid: left = appointments, right = profile */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: Today / Upcoming / Past */}
          <div className="space-y-4 lg:col-span-2">
            {/* Today */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Today&apos;s appointments
                </h2>
                <div className="flex flex-wrap gap-2">
                  {isPatient && (
                    <Link href="/book">
                      <Button size="sm">Book an appointment</Button>
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
              {todaysAppointments.length === 0 ? (
                <EmptyState
                  title="No appointments today"
                  description={
                    isPatient
                      ? "Book a new appointment to get started."
                      : "You have no scheduled visits for today."
                  }
                />
              ) : (
                <div className="space-y-2">
                  {todaysAppointments.map((appt) => {
                    const counterpart =
                      user.role === "PATIENT" ? appt.doctor : appt.patient;
                    const canCancel = isPatient && canPatientCancel(appt);

                    return (
                      <Card
                        key={appt._id}
                        className="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusPillClasses(
                                appt.status
                              )}`}
                            >
                              {appt.status.toLowerCase()}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {appt.slot?.time} ·{" "}
                              {formatDateHuman(appt.slot?.date)}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium">
                              {counterpartLabel(user.role)}:
                            </span>{" "}
                            {counterpart?.full_name ?? "N/A"}
                          </p>
                          {appt.clinic && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium">Clinic:</span>{" "}
                              {appt.clinic.name}
                              {appt.clinic.address?.city
                                ? ` – ${appt.clinic.address.city}`
                                : ""}
                            </p>
                          )}
                          {appt.room && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium">Room:</span>{" "}
                              {appt.room.room_number}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {isPatient && appt.payment && (
                            <div className="text-right text-[11px] text-slate-600 dark:text-slate-400">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {appt.payment.amount} EGP
                              </div>
                              <div className="capitalize">
                                {appt.payment.method.toLowerCase()}
                              </div>
                            </div>
                          )}

                          {canCancel && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(appt._id)}
                              isLoading={cancelLoadingId === appt._id}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Upcoming */}
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Upcoming appointments
              </h2>
              {upcomingAppointments.length === 0 ? (
                <EmptyState
                  title="No upcoming appointments"
                  description={
                    isPatient
                      ? "You don’t have any future bookings yet."
                      : "No upcoming visits scheduled."
                  }
                />
              ) : (
                <div className="space-y-2">
                  {upcomingAppointments.map((appt) => {
                    const counterpart =
                      user.role === "PATIENT" ? appt.doctor : appt.patient;
                    const canCancel = isPatient && canPatientCancel(appt);

                    return (
                      <Card
                        key={appt._id}
                        className="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusPillClasses(
                                appt.status
                              )}`}
                            >
                              {appt.status.toLowerCase()}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {appt.slot?.time} ·{" "}
                              {formatDateHuman(appt.slot?.date)}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium">
                              {counterpartLabel(user.role)}:
                            </span>{" "}
                            {counterpart?.full_name ?? "N/A"}
                          </p>
                          {appt.clinic && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium">Clinic:</span>{" "}
                              {appt.clinic.name}
                              {appt.clinic.address?.city
                                ? ` – ${appt.clinic.address.city}`
                                : ""}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {isPatient && appt.payment && (
                            <div className="text-right text-[11px] text-slate-600 dark:text-slate-400">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {appt.payment.amount} EGP
                              </div>
                              <div className="capitalize">
                                {appt.payment.method.toLowerCase()}
                              </div>
                            </div>
                          )}

                          {canCancel && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(appt._id)}
                              isLoading={cancelLoadingId === appt._id}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Past */}
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Past & completed
              </h2>
              {pastAppointments.length === 0 ? (
                <EmptyState
                  title="No past appointments"
                  description="Once you complete visits, they will appear here."
                />
              ) : (
                <div className="space-y-2">
                  {pastAppointments.map((appt) => {
                    const counterpart =
                      user.role === "PATIENT" ? appt.doctor : appt.patient;

                    return (
                      <Card
                        key={appt._id}
                        className="flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusPillClasses(
                                appt.status
                              )}`}
                            >
                              {appt.status.toLowerCase()}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {appt.slot?.time} ·{" "}
                              {formatDateHuman(appt.slot?.date)}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">
                            <span className="font-medium">
                              {counterpartLabel(user.role)}:
                            </span>{" "}
                            {counterpart?.full_name ?? "N/A"}
                          </p>
                          {appt.clinic && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium">Clinic:</span>{" "}
                              {appt.clinic.name}
                              {appt.clinic.address?.city
                                ? ` – ${appt.clinic.address.city}`
                                : ""}
                            </p>
                          )}
                          {appt.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Notes: {appt.notes}
                            </p>
                          )}
                        </div>

                        {isPatient && appt.payment && (
                          <div className="text-right text-[11px] text-slate-600 dark:text-slate-400">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {appt.payment.amount} EGP
                            </div>
                            <div className="capitalize">
                              {appt.payment.method.toLowerCase()}
                            </div>
                            <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                              {new Date(
                                appt.payment.timestamp
                              ).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: profile summary */}
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Profile summary
            </h2>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">Full name:</span>{" "}
                {user.full_name}
              </p>
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">Email:</span>{" "}
                {user.email}
              </p>
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">Phone:</span>{" "}
                {user.phone}
              </p>
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">Role:</span>{" "}
                {roleLabel}
              </p>

              {!isPatient && (
                <>
                  {user.qualifications && (
                    <p>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Qualifications:
                      </span>{" "}
                      {user.qualifications}
                    </p>
                  )}
                  {user.specializations && user.specializations.length > 0 && (
                    <p>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Specializations:
                      </span>{" "}
                      {user.specializations.join(", ")}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-dark-700 pt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              {isPatient ? (
                <>
                  <p>
                    • You can book, view, and cancel appointments directly from
                    this dashboard.
                  </p>
                  <p>
                    • Keep your phone and email up to date for reminders and
                    clinic contact.
                  </p>
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
      </div>
    </PageShell>
  );
}
