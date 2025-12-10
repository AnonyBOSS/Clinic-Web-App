// app/doctor/schedule/page.tsx
"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";

type Clinic = {
  _id: string;
  name: string;
  address?: { city?: string; governorate?: string };
};

type Room = {
  _id: string;
  room_number: string;
  status: "AVAILABLE" | "MAINTENANCE";
  clinic: string;
};

type ScheduleRow = {
  dayOfWeek: number;
  clinicId: string;
  roomId?: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DoctorSchedulePage() {
  const [consultationFee, setConsultationFee] = useState("300");
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/doctors/schedule", {
          credentials: "include"
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Failed to load schedule.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setClinics(data.data.clinics as Clinic[]);
        setRooms(data.data.rooms as Room[]);
        setRows(
          (data.data.schedule_days as any[]).map((s) => ({
            dayOfWeek: s.dayOfWeek,
            clinicId: s.clinic?._id ?? s.clinic,
            roomId: s.room?._id ?? s.room,
            startTime: s.startTime,
            endTime: s.endTime,
            slotDurationMinutes: s.slotDurationMinutes,
            isActive: s.isActive
          }))
        );
        setConsultationFee(String(data.data.consultationFee ?? 300));
      } catch {
        setError("Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function updateRow(index: number, patch: Partial<ScheduleRow>) {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        dayOfWeek: 0,
        clinicId: clinics[0]?._id ?? "",
        roomId: undefined,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30,
        isActive: true
      }
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const feeNumber = Number(consultationFee);
    if (Number.isNaN(feeNumber) || feeNumber < 0) {
      setError("Consultation fee must be a non-negative number.");
      setSaving(false);
      return;
    }

    // Validate each schedule row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Validate start time is before end time
      if (row.startTime >= row.endTime) {
        setError(`Row ${i + 1}: Start time must be before end time.`);
        setSaving(false);
        return;
      }

      // Validate slot duration (must be between 5 and 240 minutes)
      if (row.slotDurationMinutes < 5 || row.slotDurationMinutes > 240) {
        setError(`Row ${i + 1}: Slot duration must be between 5 and 240 minutes.`);
        setSaving(false);
        return;
      }

      // Check for overlapping schedules on the same day and clinic
      for (let j = i + 1; j < rows.length; j++) {
        const otherRow = rows[j];
        if (
          row.dayOfWeek === otherRow.dayOfWeek &&
          row.clinicId === otherRow.clinicId &&
          row.isActive && otherRow.isActive
        ) {
          // Check if times overlap
          if (
            (row.startTime < otherRow.endTime && row.endTime > otherRow.startTime)
          ) {
            setError(`Rows ${i + 1} and ${j + 1} have overlapping times on the same day and clinic.`);
            setSaving(false);
            return;
          }
        }
      }
    }

    try {
      const res = await fetch("/api/doctors/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          scheduleDays: rows,
          consultationFee: feeNumber
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Failed to save schedule.");
        return;
      }

      setSuccess("Schedule and consultation fee saved. Click 'Generate Slots' to create bookable time slots.");
    } catch {
      setError("Network error while saving schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateSlots() {
    setError(null);
    setSuccess(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/doctors/slots/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({})
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Failed to generate slots.");
        return;
      }

      const count = data?.data?.createdCount ?? 0;
      setSuccess(`Successfully generated ${count} time slots for the next 2 weeks.`);
    } catch {
      setError("Network error while generating slots.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <PageShell
        title="Doctor schedule"
        description="Define your working days, rooms, and consultation fee."
      >
        <LoadingSpinner />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Doctor schedule"
      description="Define your working days, rooms, and consultation fee."
    >
      <div className="space-y-4">
        {error && (
          <Card className="border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </Card>
        )}
        {success && (
          <Card className="border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            {success}
          </Card>
        )}

        {/* Consultation fee */}
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Consultation fee
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            This fee will be used for all appointments booked with you. Patients
            will see it on the booking and confirmation pages.
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              className="max-w-[160px]"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
            />
            <span className="text-xs text-slate-600 dark:text-slate-300">EGP</span>
          </div>
        </Card>

        {/* Schedule rows */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Weekly schedule
            </h2>
            <Button size="sm" variant="outline" onClick={addRow}>
              Add row
            </Button>
          </div>

          {rows.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No schedule rows yet. Add one to start defining your working
              hours.
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map((row, i) => {
                const clinicRooms = rooms.filter(
                  (r) => r.clinic === row.clinicId
                );
                return (
                  <div
                    key={i}
                    className="grid gap-2 rounded-xl border border-slate-200/80 dark:border-dark-600 bg-slate-50/60 dark:bg-dark-800/60 p-3 md:grid-cols-6 md:items-end"
                  >
                    {/* Day */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Day
                      </label>
                      <Select
                        value={row.dayOfWeek}
                        onChange={(e) =>
                          updateRow(i, { dayOfWeek: Number(e.target.value) })
                        }
                      >
                        {days.map((d, idx) => (
                          <option key={idx} value={idx}>
                            {d}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Clinic */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Clinic
                      </label>
                      <Select
                        value={row.clinicId}
                        onChange={(e) =>
                          updateRow(i, {
                            clinicId: e.target.value,
                            roomId: undefined
                          })
                        }
                      >
                        <option value="">Select clinic</option>
                        {clinics.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                            {c.address?.city ? ` – ${c.address.city}` : ""}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Room */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Room
                      </label>
                      <Select
                        value={row.roomId ?? ""}
                        onChange={(e) =>
                          updateRow(i, {
                            roomId: e.target.value || undefined
                          })
                        }
                      >
                        <option value="">Any room</option>
                        {clinicRooms.map((r) => (
                          <option key={r._id} value={r._id}>
                            Room {r.room_number}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Time range */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        From
                      </label>
                      <Input
                        type="time"
                        value={row.startTime}
                        onChange={(e) =>
                          updateRow(i, { startTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        To
                      </label>
                      <Input
                        type="time"
                        value={row.endTime}
                        onChange={(e) =>
                          updateRow(i, { endTime: e.target.value })
                        }
                      />
                    </div>

                    {/* Duration & controls */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Slot (min)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={5}
                          value={row.slotDurationMinutes}
                          onChange={(e) =>
                            updateRow(i, {
                              slotDurationMinutes: Number(e.target.value)
                            })
                          }
                        />
                        <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={row.isActive}
                            onChange={(e) =>
                              updateRow(i, { isActive: e.target.checked })
                            }
                          />
                          Active
                        </label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeRow(i)}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-dark-700 flex justify-end gap-3">
            <Button size="sm" isLoading={saving} onClick={handleSave}>
              Save schedule
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLoading={generating}
              onClick={handleGenerateSlots}
              disabled={rows.length === 0}
            >
              Generate Slots (2 weeks)
            </Button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            <strong>Note:</strong> After saving your schedule, click &quot;Generate Slots&quot; to create bookable time slots for patients.
            Slots are generated for the next 2 weeks based on your active schedule days.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
