// app/book/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";

type Clinic = {
  _id: string;
  name: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    governorate: string;
  };
};

type Doctor = {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  qualifications?: string;
  specializations?: string[];
  clinic_affiliations?: Clinic[];
};

type SlotItem = {
  _id: string;
  date: string;
  time: string;
  status: "AVAILABLE" | "BOOKED";
  room: {
    _id: string;
    room_number: string;
    status: "AVAILABLE" | "MAINTENANCE";
  };
};

export default function BookPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);

  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState("");

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [amount, setAmount] = useState("300"); // default fee
  const [method, setMethod] = useState<"CASH" | "CARD">("CASH");
  const [notes, setNotes] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1) Load clinics and doctors once
  useEffect(() => {
    async function load() {
      try {
        const [clinicsRes, doctorsRes] = await Promise.all([
          fetch("/api/clinics", { credentials: "include" }),
          fetch("/api/doctors", { credentials: "include" })
        ]);

        if (clinicsRes.ok) {
          const clinicsJson = await clinicsRes.json();
          setClinics(clinicsJson.data as Clinic[]);
        }

        if (doctorsRes.ok) {
          const doctorsJson = await doctorsRes.json();
          setDoctors(doctorsJson.data as Doctor[]);
        }
      } catch {
        setError("Failed to load clinics/doctors.");
      } finally {
        setLoadingInitial(false);
      }
    }

    load();
  }, []);

  // 2) Load slots when doctor, clinic and date selected
  async function loadSlots(e?: FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);
    setSlots([]);
    setSelectedSlotId(null);
    setSelectedRoomId(null);

    if (!selectedClinicId || !selectedDoctorId || !date) {
      setError("Please select clinic, doctor and date first.");
      return;
    }

    setLoadingSlots(true);
    try {
      const params = new URLSearchParams({
        doctorId: selectedDoctorId,
        clinicId: selectedClinicId,
        date
      });

      const res = await fetch(`/api/slots/available?${params.toString()}`, {
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to load slots.");
        return;
      }

      const data = await res.json();
      setSlots(data.data as SlotItem[]);
    } catch {
      setError("Failed to load slots.");
    } finally {
      setLoadingSlots(false);
    }
  }

  // 3) Book appointment for selected slot
  async function handleBook() {
    setError(null);
    setSuccess(null);

    if (!selectedSlotId || !selectedRoomId) {
      setError("Please select a time slot first.");
      return;
    }

    const amountNumber = Number(amount);
    if (!amountNumber || amountNumber <= 0) {
      setError("Please enter a valid consultation fee.");
      return;
    }

    setBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          clinicId: selectedClinicId,
          roomId: selectedRoomId,
          slotId: selectedSlotId,
          notes: notes || undefined,
          amount: amountNumber,
          method
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to book appointment.");
      } else {
        setSuccess("Appointment booked successfully!");
      }
    } catch {
      setError("Network error while booking.");
    } finally {
      setBooking(false);
    }
  }

  if (loadingInitial) {
    return (
      <PageShell
        title="Book an appointment"
        description="Choose clinic, doctor, and time to schedule your visit."
      >
        <LoadingSpinner />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Book an appointment"
      description="Choose a clinic, doctor, and time slot to schedule your visit."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: selection form */}
        <Card className="lg:col-span-2 space-y-4">
          <form className="space-y-4" onSubmit={loadSlots}>
            {/* Clinic */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Clinic
              </label>
              <Select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
              >
                <option value="">Select a clinic</option>
                {clinics.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} – {c.address.city}
                  </option>
                ))}
              </Select>
            </div>

            {/* Doctor */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Doctor
              </label>
              <Select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                <option value="">Select a doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.full_name}
                    {d.specializations && d.specializations.length > 0
                      ? ` – ${d.specializations.join(", ")}`
                      : ""}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Fee & payment method */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Consultation fee (EGP)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Payment method
                </label>
                <Select
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as "CASH" | "CARD")
                  }
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                </Select>
              </div>
            </div>

            {/* Notes */}
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

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                isLoading={loadingSlots}
              >
                Search available slots
              </Button>
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              {success && (
                <p className="text-xs text-emerald-600">{success}</p>
              )}
            </div>
          </form>

          {/* Slots list */}
          <div className="mt-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Available slots
            </h2>
            {loadingSlots ? (
              <LoadingSpinner />
            ) : slots.length === 0 ? (
              <EmptyState
                title="No available slots"
                description="Try another date, doctor, or clinic."
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                {slots.map((slot) => {
                  const selected = selectedSlotId === slot._id;
                  return (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(slot._id);
                        setSelectedRoomId(slot.room._id);
                      }}
                      className={`flex flex-col rounded-xl border px-3 py-2 text-left text-xs transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-400"
                      }`}
                    >
                      <span className="font-medium">
                        {slot.time}
                      </span>
                      <span className="mt-1 text-[10px] text-slate-500">
                        Room {slot.room.room_number}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Right: small summary */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Appointment summary
          </h2>
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              <span className="font-medium text-slate-800">
                Clinic:
              </span>{" "}
              {selectedClinicId
                ? clinics.find((c) => c._id === selectedClinicId)?.name ??
                  "Selected clinic"
                : "Not selected"}
            </p>
            <p>
              <span className="font-medium text-slate-800">
                Doctor:
              </span>{" "}
              {selectedDoctorId
                ? doctors.find((d) => d._id === selectedDoctorId)
                    ?.full_name ?? "Selected doctor"
                : "Not selected"}
            </p>
            <p>
              <span className="font-medium text-slate-800">
                Date:
              </span>{" "}
              {date || "Not selected"}
            </p>
            <p>
              <span className="font-medium text-slate-800">
                Fee:
              </span>{" "}
              {amount || "0"} EGP ({method.toLowerCase()})
            </p>
            <p>
              <span className="font-medium text-slate-800">
                Selected time:
              </span>{" "}
              {selectedSlotId
                ? slots.find((s) => s._id === selectedSlotId)?.time ??
                  "Selected"
                : "Not selected"}
            </p>
          </div>

          <Button
            className="w-full"
            variant="primary"
            disabled={!selectedSlotId || booking}
            isLoading={booking}
            onClick={handleBook}
          >
            Confirm booking
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
