// app/book/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  consultation_fee?: number;
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
  clinic?: {
    _id: string;
    name: string;
    address?: {
      city?: string;
      governorate?: string;
    };
  };
  doctor?: {
    _id: string;
    full_name: string;
    specializations?: string[];
    consultation_fee?: number;
  };
};

export default function BookPage() {
  const router = useRouter();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);

  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState("");

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Check authentication + load clinics + doctors
  useEffect(() => {
    async function load() {
      try {
        // Check if user is authenticated
        const authRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!authRes.ok) {
          setIsAuthenticated(false);
          router.push("/login?redirect=/book");
          return;
        }

        const authData = await authRes.json();
        if (authData.data?.role !== "PATIENT") {
          setError("Only patients can book appointments.");
          setLoadingInitial(false);
          return;
        }

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
  }, [router]);

  async function fetchSlots(args?: {
    doctorId?: string;
    clinicId?: string;
    date?: string;
  }) {
    const doctorId = args?.doctorId ?? selectedDoctorId;
    const clinicId = args?.clinicId ?? selectedClinicId;
    const dateVal = args?.date ?? date;

    // Removed early return - now fetches all slots when no filters are set

    setError(null);
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlotId(null);
    setSelectedRoomId(null);

    try {
      const params = new URLSearchParams();
      if (doctorId) params.set("doctorId", doctorId);
      if (clinicId) params.set("clinicId", clinicId);
      if (dateVal) params.set("date", dateVal);

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

  // Auto-load slots when filters change
  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctorId, selectedClinicId, date]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    fetchSlots();
  }

  function handleSlotSelect(slot: SlotItem) {
    setSelectedSlotId(slot._id);
    setSelectedRoomId(slot.room._id);

    // Autofill clinic/doctor/date if not set
    if (!selectedClinicId && slot.clinic?._id) {
      setSelectedClinicId(slot.clinic._id);
    }
    if (!selectedDoctorId && slot.doctor?._id) {
      setSelectedDoctorId(slot.doctor._id);
    }
    if (!date && slot.date) {
      setDate(slot.date);
    }
  }

  function goToConfirm() {
    if (!selectedSlotId || !selectedRoomId) {
      setError("Please select a time slot first.");
      return;
    }

    const params = new URLSearchParams({
      doctorId: selectedDoctorId,
      clinicId: selectedClinicId,
      roomId: selectedRoomId,
      slotId: selectedSlotId
    });

    const slot = slots.find((s) => s._id === selectedSlotId);
    if (slot) {
      params.set("date", slot.date);
      params.set("time", slot.time);
    }

    router.push(`/book/confirm?${params.toString()}`);
  }

  const selectedDoctor =
    doctors.find((d) => d._id === selectedDoctorId) ??
    slots.find((s) => s._id === selectedSlotId)?.doctor;

  const selectedClinic =
    clinics.find((c) => c._id === selectedClinicId) ??
    slots.find((s) => s._id === selectedSlotId)?.clinic;

  if (loadingInitial) {
    return (
      <PageShell
        title="Book an appointment"
        description="Choose clinic, doctor, and date to find available slots."
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
        {/* Left: selection form & slots */}
        <Card className="lg:col-span-2 space-y-4">
          <form className="space-y-4" onSubmit={handleSearchSubmit}>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Clinic */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Clinic
                </label>
                <Select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                >
                  <option value="">Any clinic</option>
                  {clinics.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} – {c.address.city}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Doctor */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Doctor
                </label>
                <Select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  <option value="">Any doctor</option>
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
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Date (optional)
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button type="submit" isLoading={loadingSlots}>
                Refresh slots
              </Button>
              {(selectedClinicId || selectedDoctorId || date) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClinicId("");
                    setSelectedDoctorId("");
                    setDate("");
                    setSelectedSlotId(null);
                    setSelectedRoomId(null);
                    fetchSlots({});
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear filters
                </button>
              )}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          </form>

          {/* Slots list */}
          <div className="mt-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
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
                  const clinicLabel = slot.clinic
                    ? `${slot.clinic.name}${slot.clinic.address?.city
                      ? " – " + slot.clinic.address.city
                      : ""
                    }`
                    : "Clinic";
                  const doctorLabel = slot.doctor
                    ? slot.doctor.full_name
                    : undefined;

                  return (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className={`flex flex-col rounded-xl border px-3 py-2 text-left text-xs transition ${selected
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100"
                        : "border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400"
                        }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-medium">
                          {slot.date} · {slot.time}
                        </span>
                        {slot.doctor?.consultation_fee !== undefined && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            EGP {slot.doctor.consultation_fee}
                          </span>
                        )}
                      </div>
                      <span className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {clinicLabel}
                      </span>
                      <span className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        Room {slot.room.room_number}
                        {doctorLabel ? ` · ${doctorLabel}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Right: summary & continue */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Appointment summary
          </h2>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>
              <span className="font-medium text-slate-800 dark:text-slate-200">Clinic:</span>{" "}
              {selectedClinic ? selectedClinic.name : "Any clinic"}
            </p>
            <p>
              <span className="font-medium text-slate-800 dark:text-slate-200">Doctor:</span>{" "}
              {selectedDoctor ? selectedDoctor.full_name : "Any doctor"}
            </p>
            <p>
              <span className="font-medium text-slate-800 dark:text-slate-200">Date filter:</span>{" "}
              {date || "Any upcoming date"}
            </p>
            <p>
              <span className="font-medium text-slate-800 dark:text-slate-200">Selected time:</span>{" "}
              {selectedSlotId
                ? slots.find((s) => s._id === selectedSlotId)?.time ??
                "Selected"
                : "Not selected"}
            </p>
            <p>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Consultation fee:
              </span>{" "}
              {selectedDoctor?.consultation_fee
                ? `${selectedDoctor.consultation_fee} EGP`
                : "Set by doctor"}
            </p>
          </div>

          <Button
            className="w-full"
            variant="primary"
            disabled={!selectedSlotId}
            onClick={goToConfirm}
          >
            Continue to payment
          </Button>
        </Card>
      </div>
    </PageShell>
  );
}
