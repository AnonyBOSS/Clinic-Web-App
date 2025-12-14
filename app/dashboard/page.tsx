// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import RatingModal from "@/components/RatingModal";
import { useTranslation } from "@/lib/i18n";

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
    _id: string;
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

function canPatientReschedule(appt: AppointmentItem, todayStr: string): boolean {
  if (appt.status === "CANCELLED" || appt.status === "COMPLETED") {
    return false;
  }
  // Cannot reschedule if appointment is today
  if (appt.slot?.date === todayStr) {
    return false;
  }
  return isFutureAppointment(appt);
}

type AvailableSlot = {
  _id: string;
  date: string;
  time: string;
  clinic?: {
    name: string;
    address?: { city?: string };
  };
  room?: {
    room_number: string;
  };
};

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
  const { t } = useTranslation();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);
  const [completeLoadingId, setCompleteLoadingId] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<AppointmentItem | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  // Rating state
  const [ratingModalAppt, setRatingModalAppt] = useState<AppointmentItem | null>(null);
  const [ratedAppointments, setRatedAppointments] = useState<Set<string>>(new Set());

  useEffect(() => {

    async function updateExpiredAppointments() {
      try {
        await fetch("/api/appointments/update-status", {
          method: "POST",
          credentials: "include"
        });
      } catch {
        // Ignore - non-critical operation
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

        // Update expired appointments before fetching the list
        await updateExpiredAppointments();

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

          // Fetch existing ratings to mark already-rated appointments
          if (me.role === "PATIENT") {
            try {
              const ratingsRes = await fetch("/api/ratings?myRatings=true", {
                credentials: "include"
              });
              if (ratingsRes.ok) {
                const ratingsJson = await ratingsRes.json();
                const ratings = ratingsJson.data || [];
                const ratedIds = new Set<string>(
                  ratings.map((r: any) => r.appointment?._id || r.appointment).filter(Boolean)
                );
                setRatedAppointments(ratedIds);
              }
            } catch {
              // Ignore ratings fetch error
            }
          }
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

  // Auto-update expired appointments every minute
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(async () => {
      try {
        const updateRes = await fetch("/api/appointments/update-status", {
          method: "POST",
          credentials: "include"
        });

        if (updateRes.ok) {
          const data = await updateRes.json();
          // If any appointments were updated, refresh the list
          if (data.data?.updatedCount > 0) {
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
            }
          }
        }
      } catch {
        // Ignore - non-critical periodic check
      }
    }, 60000); // Every minute

    return () => clearInterval(intervalId);
  }, [user]);

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

  async function handleComplete(appointmentId: string) {
    setCompleteLoadingId(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to complete appointment.");
        return;
      }

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId
            ? { ...a, status: "COMPLETED" as const }
            : a
        )
      );
    } catch (err) {
      setError("Network error while completing appointment.");
      console.error("Complete request failed", err);
    } finally {
      setCompleteLoadingId(null);
    }
  }

  async function openRescheduleModal(appt: AppointmentItem) {
    if (!appt.doctor?._id) {
      setError("Cannot reschedule: Doctor information missing.");
      return;
    }

    setRescheduleModalAppt(appt);
    setSelectedNewSlotId(null);
    setLoadingSlots(true);
    setError(null);

    try {
      const res = await fetch(`/api/slots/available?doctorId=${appt.doctor._id}`, {
        credentials: "include"
      });

      if (!res.ok) {
        setError("Failed to load available slots.");
        setLoadingSlots(false);
        return;
      }

      const data = await res.json();
      const slots = (data.data as AvailableSlot[]) ?? [];

      // Filter out today's slots
      const filtered = slots.filter(s => s.date !== todayStr);
      setAvailableSlots(filtered);
    } catch {
      setError("Network error while loading slots.");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleReschedule() {
    if (!rescheduleModalAppt || !selectedNewSlotId) return;

    setRescheduling(true);
    setError(null);

    try {
      const res = await fetch(`/api/appointments/${rescheduleModalAppt._id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newSlotId: selectedNewSlotId })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to reschedule appointment.");
        setRescheduling(false);
        return;
      }

      // Update the appointment in local state
      const newSlot = availableSlots.find(s => s._id === selectedNewSlotId);
      if (newSlot) {
        setAppointments((prev) =>
          prev.map((a) =>
            a._id === rescheduleModalAppt._id
              ? {
                ...a,
                slot: { date: newSlot.date, time: newSlot.time },
                clinic: newSlot.clinic,
                room: newSlot.room
              }
              : a
          )
        );
      }

      // Close modal
      setRescheduleModalAppt(null);
      setAvailableSlots([]);
      setSelectedNewSlotId(null);
    } catch {
      setError("Network error while rescheduling.");
    } finally {
      setRescheduling(false);
    }
  }

  if (loading) {
    return (
      <PageShell title={t.nav.dashboard}>
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        title={t.nav.dashboard}
        description={t.errors.unauthorized}
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
      title={`${t.common.welcomeBack}, ${user.full_name}`}
      description={roleLabel}
    >
      <div className="space-y-4">
        {error && (
          <Card className="border border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/30 px-4 py-2 text-xs text-red-700 dark:text-red-200">
            {error}
          </Card>
        )}

        {/* Top summary cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.dashboard.todayAppointments}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {todaysAppointments.length}
            </p>
          </Card>
          <Card className="px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.dashboard.upcomingAppointments}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {totalUpcoming}
            </p>
          </Card>
          <Card className="px-4 py-3">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {t.dashboard.pastAppointments}
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
                  {t.dashboard.todayAppointments}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {isPatient && (
                    <Link href="/book">
                      <Button size="sm">{t.appointments.book}</Button>
                    </Link>
                  )}
                  {!isPatient && (
                    <Link href="/doctor/schedule">
                      <Button size="sm" variant="outline">
                        {t.nav.schedule}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              {todaysAppointments.length === 0 ? (
                <EmptyState
                  title={t.dashboard.noAppointmentsToday}
                  description={
                    isPatient
                      ? t.dashboard.bookNewAppointment
                      : t.dashboard.noScheduledVisits
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
                            {counterpart?.full_name ?? t.common.notAvailable}
                          </p>
                          {appt.clinic && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium">{t.appointments.clinic}:</span>{" "}
                              {appt.clinic.name}
                              {appt.clinic.address?.city
                                ? ` – ${appt.clinic.address.city}`
                                : ""}
                            </p>
                          )}
                          {appt.room && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium">{t.appointments.room}:</span>{" "}
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
                              {t.common.cancel}
                            </Button>
                          )}

                          {/* Complete button for doctors */}
                          {!isPatient && (appt.status === "BOOKED" || appt.status === "CONFIRMED") && (
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => handleComplete(appt._id)}
                              isLoading={completeLoadingId === appt._id}
                            >
                              ✓ Complete
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
                {t.dashboard.upcomingAppointments}
              </h2>
              {upcomingAppointments.length === 0 ? (
                <EmptyState
                  title={t.dashboard.noUpcoming}
                  description={
                    isPatient
                      ? t.dashboard.noFutureBookings
                      : t.dashboard.noUpcomingVisits
                  }
                />
              ) : (
                <div className="space-y-2">
                  {upcomingAppointments.map((appt) => {
                    const counterpart =
                      user.role === "PATIENT" ? appt.doctor : appt.patient;
                    const canCancel = isPatient && canPatientCancel(appt);
                    const canReschedule = isPatient && canPatientReschedule(appt, todayStr);

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
                            {counterpart?.full_name ?? t.common.notAvailable}
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

                          {canReschedule && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openRescheduleModal(appt)}
                            >
                              {t.appointments.reschedule}
                            </Button>
                          )}

                          {canCancel && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(appt._id)}
                              isLoading={cancelLoadingId === appt._id}
                            >
                              {t.common.cancel}
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
                {t.dashboard.pastAppointments}
              </h2>
              {pastAppointments.length === 0 ? (
                <EmptyState
                  title={t.dashboard.noAppointments}
                  description={t.dashboard.bookNewAppointment}
                />
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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
                            {counterpart?.full_name ?? t.common.notAvailable}
                          </p>
                          {appt.clinic && (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-medium">{t.appointments.clinic}:</span>{" "}
                              {appt.clinic.name}
                              {appt.clinic.address?.city
                                ? ` – ${appt.clinic.address.city}`
                                : ""}
                            </p>
                          )}
                          {appt.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {t.appointments.notes}: {appt.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
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

                          {/* Rate button for completed appointments */}
                          {isPatient && appt.status === "COMPLETED" && appt.doctor && !ratedAppointments.has(appt._id) && (
                            <Button
                              size="sm"
                              variant="gradient"
                              onClick={() => setRatingModalAppt(appt)}
                              className="shadow-md"
                            >
                              ⭐ {t.ratings.rate}
                            </Button>
                          )}
                          {ratedAppointments.has(appt._id) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {t.ratings.rated}
                            </span>
                          )}
                        </div>
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
              {t.dashboard.profileSummary}
            </h2>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">{t.dashboard.fullNameLabel}</span>{" "}
                {user.full_name}
              </p>
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">{t.dashboard.emailLabel}</span>{" "}
                {user.email}
              </p>
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">{t.dashboard.phoneLabel}</span>{" "}
                {user.phone}
              </p>
              <p>
                <span className="font-medium text-slate-800 dark:text-slate-200">{t.dashboard.roleLabel}</span>{" "}
                {roleLabel}
              </p>

              {!isPatient && (
                <>
                  {user.qualifications && (
                    <p>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {t.dashboard.qualificationsLabel}
                      </span>{" "}
                      {user.qualifications}
                    </p>
                  )}
                  {user.specializations && user.specializations.length > 0 && (
                    <p>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {t.dashboard.specializationsLabel}
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
                    • {t.dashboard.patientTip1}
                  </p>
                  <p>
                    • {t.dashboard.patientTip2}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    • {t.dashboard.doctorTip1}
                  </p>
                  <p>
                    • {t.dashboard.doctorTip2}
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-lg w-full mx-4 p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t.appointments.reschedule}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Select a new time slot with Dr. {rescheduleModalAppt.doctor?.full_name}.
              Current appointment: {rescheduleModalAppt.slot?.date} at {rescheduleModalAppt.slot?.time}
            </p>

            {loadingSlots ? (
              <div className="py-4">
                <LoadingSpinner />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
                No available slots found for this doctor. Please try again later.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <label
                    key={slot._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedNewSlotId === slot._id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-slate-200 dark:border-dark-600 hover:bg-slate-50 dark:hover:bg-dark-700"
                      }`}
                  >
                    <input
                      type="radio"
                      name="newSlot"
                      value={slot._id}
                      checked={selectedNewSlotId === slot._id}
                      onChange={() => setSelectedNewSlotId(slot._id)}
                      className="accent-primary-500"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {formatDateHuman(slot.date)} at {slot.time}
                      </div>
                      {slot.clinic && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {slot.clinic.name}
                          {slot.clinic.address?.city ? ` – ${slot.clinic.address.city}` : ""}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRescheduleModalAppt(null);
                  setAvailableSlots([]);
                  setSelectedNewSlotId(null);
                  setError(null);
                }}
                disabled={rescheduling}
              >
                {t.common.cancel}
              </Button>
              <Button
                size="sm"
                onClick={handleReschedule}
                disabled={!selectedNewSlotId || rescheduling}
                isLoading={rescheduling}
              >
                {t.common.confirm}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={!!ratingModalAppt}
        onClose={() => setRatingModalAppt(null)}
        doctorName={ratingModalAppt?.doctor?.full_name || ""}
        appointmentId={ratingModalAppt?._id || ""}
        onSuccess={() => {
          if (ratingModalAppt) {
            setRatedAppointments(prev => new Set([...prev, ratingModalAppt._id]));
          }
        }}
      />
    </PageShell>
  );
}
