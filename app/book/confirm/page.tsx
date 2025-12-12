// app/book/confirm/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { useTranslation } from "@/lib/i18n";

type Clinic = {
  _id: string;
  name: string;
  address?: {
    city?: string;
    governorate?: string;
  };
};

type Doctor = {
  _id: string;
  full_name: string;
  specializations?: string[];
  consultation_fee?: number;
};

type SlotItem = {
  _id: string;
  date: string;
  time: string;
  room: {
    _id: string;
    room_number: string;
  };
  clinic?: {
    _id: string;
    name: string;
  };
};

export default function ConfirmBookingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [slot, setSlot] = useState<SlotItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<"CASH" | "CARD">("CASH");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const doctorId = params.get("doctorId");
    const clinicId = params.get("clinicId");
    const roomId = params.get("roomId");
    const slotId = params.get("slotId");
    const date = params.get("date");

    if (!doctorId || !clinicId || !roomId || !slotId || !date) {
      setError(t.errors.somethingWentWrong);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [doctorsRes, clinicsRes, slotsRes] = await Promise.all([
          fetch("/api/doctors", { credentials: "include" }),
          fetch("/api/clinics", { credentials: "include" }),
          fetch(
            `/api/slots/available?doctorId=${doctorId}&clinicId=${clinicId}&date=${date}`,
            { credentials: "include" }
          )
        ]);

        if (!doctorsRes.ok || !clinicsRes.ok || !slotsRes.ok) {
          setError(t.errors.failedToLoad);
          setLoading(false);
          return;
        }

        const doctorsJson = await doctorsRes.json();
        const clinicsJson = await clinicsRes.json();
        const slotsJson = await slotsRes.json();

        const doctors = doctorsJson.data as Doctor[];
        const clinics = clinicsJson.data as Clinic[];
        const slots = slotsJson.data as SlotItem[];

        const d = doctors.find((dd) => dd._id === doctorId) ?? null;
        const c = clinics.find((cc) => cc._id === clinicId) ?? null;
        const s = slots.find((ss) => ss._id === slotId) ?? null;

        if (!d || !c || !s) {
          setError(t.appointments.noSlotsAvailable);
          setLoading(false);
          return;
        }

        setDoctor(d);
        setClinic(c);
        setSlot(s);
      } catch {
        setError(t.errors.failedToLoad);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params, t]);

  async function handleConfirm() {
    setError(null);

    const doctorId = params.get("doctorId");
    const clinicId = params.get("clinicId");
    const roomId = params.get("roomId");
    const slotId = params.get("slotId");

    if (!doctorId || !clinicId || !roomId || !slotId) {
      setError(t.errors.somethingWentWrong);
      return;
    }

    setBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          doctorId,
          clinicId,
          roomId,
          slotId,
          method,
          notes: notes || undefined
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? t.errors.failedToSave);
        return;
      }

      // Success → go to dashboard
      router.push("/dashboard");
    } catch {
      setError(t.errors.networkError);
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <PageShell
        title={t.appointments.confirmYourBooking}
        description={t.appointments.bookingDetails}
      >
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (error && !slot) {
    return (
      <PageShell
        title={t.appointments.confirmYourBooking}
        description={t.errors.somethingWentWrong}
      >
        <EmptyState
          title={t.errors.failedToLoad}
          description={error}
        />
      </PageShell>
    );
  }

  if (!doctor || !clinic || !slot) {
    return (
      <PageShell
        title={t.appointments.confirmYourBooking}
        description={t.errors.somethingWentWrong}
      >
        <EmptyState
          title={t.appointments.noSlotsAvailable}
          description={t.appointments.tryDifferentFilters}
        />
      </PageShell>
    );
  }

  const fee =
    typeof doctor.consultation_fee === "number"
      ? doctor.consultation_fee
      : 300;

  return (
    <PageShell
      title={t.appointments.confirmYourBooking}
      description={t.appointments.bookingDetails}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: appointment details */}
        <Card className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.appointments.bookingDetails}
          </h2>
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <p>
              <span className="font-medium text-slate-900 dark:text-white">{t.common.doctor}:</span>{" "}
              {doctor.full_name}
              {doctor.specializations && doctor.specializations.length > 0
                ? ` – ${doctor.specializations.join(", ")}`
                : ""}
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">{t.appointments.clinic}:</span>{" "}
              {clinic.name}
              {clinic.address?.city ? ` – ${clinic.address.city}` : ""}
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">{t.appointments.room}:</span>{" "}
              {slot.room.room_number}
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">{t.appointments.date}:</span>{" "}
              {slot.date}
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">{t.appointments.selectTime}:</span>{" "}
              {slot.time}
            </p>
            <p>
              <span className="font-medium text-slate-900 dark:text-white">
                {t.doctors.consultationFee}:
              </span>{" "}
              {fee} EGP
            </p>
          </div>
        </Card>

        {/* Right: payment */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.appointments.payment}
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.appointments.paymentMethod}
            </label>
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value as "CASH" | "CARD")}
            >
              <option value="CASH">{t.appointments.payAtClinic}</option>
              <option value="CARD">{t.appointments.card}</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.appointments.notes}
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.appointments.notes}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="pt-2 border-t border-slate-100 dark:border-dark-700 flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
            <p>
              {t.appointments.fee}: <span className="font-semibold">{fee} EGP</span>{" "}
              ({method.toLowerCase()})
            </p>
          </div>

          <Button
            className="w-full"
            variant="primary"
            isLoading={booking}
            onClick={handleConfirm}
          >
            {t.appointments.confirmBooking}
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
