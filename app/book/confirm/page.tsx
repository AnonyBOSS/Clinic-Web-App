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
      setError("Missing booking details. Please start again.");
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
          setError("Failed to load booking details.");
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
          setError("Selected slot is no longer available.");
          setLoading(false);
          return;
        }

        setDoctor(d);
        setClinic(c);
        setSlot(s);
      } catch {
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params]);

  async function handleConfirm() {
    setError(null);

    const doctorId = params.get("doctorId");
    const clinicId = params.get("clinicId");
    const roomId = params.get("roomId");
    const slotId = params.get("slotId");

    if (!doctorId || !clinicId || !roomId || !slotId) {
      setError("Missing booking details. Please start again.");
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
        setError(data?.error ?? "Failed to confirm appointment.");
        return;
      }

      // Success → go to dashboard
      router.push("/dashboard");
    } catch {
      setError("Network error while confirming appointment.");
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <PageShell
        title="Confirm your appointment"
        description="Review the details and complete payment."
      >
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (error && !slot) {
    return (
      <PageShell
        title="Confirm your appointment"
        description="There was a problem with this booking."
      >
        <EmptyState
          title="Unable to load booking details"
          description={error}
        />
      </PageShell>
    );
  }

  if (!doctor || !clinic || !slot) {
    return (
      <PageShell
        title="Confirm your appointment"
        description="There was a problem with this booking."
      >
        <EmptyState
          title="Selected slot is no longer available"
          description="Please go back and choose another time."
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
      title="Confirm your appointment"
      description="Review the details and complete your booking."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: appointment details */}
        <Card className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Appointment details
          </h2>
          <div className="space-y-2 text-xs text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Doctor:</span>{" "}
              {doctor.full_name}
              {doctor.specializations && doctor.specializations.length > 0
                ? ` – ${doctor.specializations.join(", ")}`
                : ""}
            </p>
            <p>
              <span className="font-medium text-slate-900">Clinic:</span>{" "}
              {clinic.name}
              {clinic.address?.city ? ` – ${clinic.address.city}` : ""}
            </p>
            <p>
              <span className="font-medium text-slate-900">Room:</span>{" "}
              {slot.room.room_number}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date:</span>{" "}
              {slot.date}
            </p>
            <p>
              <span className="font-medium text-slate-900">Time:</span>{" "}
              {slot.time}
            </p>
            <p>
              <span className="font-medium text-slate-900">
                Consultation fee:
              </span>{" "}
              {fee} EGP
            </p>
          </div>
        </Card>

        {/* Right: payment */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Payment & confirmation
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Payment method
            </label>
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value as "CASH" | "CARD")}
            >
              <option value="CASH">Cash at clinic</option>
              <option value="CARD">Card</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Notes for the doctor (optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Short description of your visit reason"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-600">
            <p>
              You will pay <span className="font-semibold">{fee} EGP</span>{" "}
              ({method.toLowerCase()}) for this consultation.
            </p>
            <p>
              By confirming, you agree that missed or late arrivals may require
              rescheduling with the clinic.
            </p>
          </div>

          <Button
            className="w-full"
            variant="primary"
            isLoading={booking}
            onClick={handleConfirm}
          >
            Confirm and pay
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
