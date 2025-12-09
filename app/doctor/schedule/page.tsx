// app/doctor/schedule/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Input from "@/components/Input";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

type Role = "PATIENT" | "DOCTOR";

type CurrentUser = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
};

type Clinic = {
  _id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    governorate?: string;
  };
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

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function DoctorSchedulePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 1) Confirm user is doctor
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include"
        });
        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          const me = data.data as CurrentUser;
          if (me.role !== "DOCTOR") {
            setUser(null);
          } else {
            setUser(me);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  // 2) Load schedule + clinics + rooms
  useEffect(() => {
    if (!user) {
      setLoadingSchedule(false);
      return;
    }

    async function loadSchedule() {
      setLoadingSchedule(true);
      setError(null);
      setSuccess(null);

      try {
        const res = await fetch("/api/doctors/schedule", {
          credentials: "include"
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to load schedule.");
          setScheduleRows([]);
          setClinics([]);
          setRooms([]);
          return;
        }

        const { schedule_days, clinics, rooms } = data.data as {
          schedule_days: any[];
          clinics: Clinic[];
          rooms: Room[];
        };

        setClinics(clinics);
        setRooms(rooms);

        const rows: ScheduleRow[] = [];
        for (let d = 0; d < 7; d++) {
          const existing = schedule_days.find((s) => s.dayOfWeek === d);
          if (existing) {
            rows.push({
              dayOfWeek: d,
              clinicId: existing.clinic?._id ?? existing.clinic ?? "",
              roomId: existing.room?._id ?? existing.room ?? "",
              startTime: existing.startTime,
              endTime: existing.endTime,
              slotDurationMinutes: existing.slotDurationMinutes,
              isActive: existing.isActive
            });
          } else {
            rows.push({
              dayOfWeek: d,
              clinicId: "",
              roomId: "",
              startTime: "09:00",
              endTime: "17:00",
              slotDurationMinutes: 30,
              isActive: false
            });
          }
        }

        setScheduleRows(rows);
      } catch {
        setError("Failed to load schedule.");
      } finally {
        setLoadingSchedule(false);
      }
    }

    loadSchedule();
  }, [user]);

  function updateRow(index: number, partial: Partial<ScheduleRow>) {
    setScheduleRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...partial } : row))
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload = {
        scheduleDays: scheduleRows
          .filter((r) => r.isActive && r.clinicId)
          .map((r) => ({
            dayOfWeek: r.dayOfWeek,
            clinicId: r.clinicId,
            roomId: r.roomId || undefined,
            startTime: r.startTime,
            endTime: r.endTime,
            slotDurationMinutes: r.slotDurationMinutes,
            isActive: r.isActive
          }))
      };

      const res = await fetch("/api/doctors/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save schedule.");
      } else {
        setSuccess("Schedule saved successfully.");
      }
    } catch {
      setError("Network error while saving schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateSlots() {
    if (!fromDate || !toDate) {
      setError("Please choose from and to dates.");
      return;
    }

    setError(null);
    setSuccess(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/doctors/slots/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fromDate, toDate })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate slots.");
      } else {
        setSuccess(
          `Slots generated: ${data.data?.createdCount ?? 0} new slots created.`
        );
      }
    } catch {
      setError("Network error while generating slots.");
    } finally {
      setGenerating(false);
    }
  }

  if (loadingUser) {
    return (
      <PageShell title="Doctor schedule">
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        title="Doctor schedule"
        description="Only doctors can configure a weekly schedule."
      >
        <EmptyState
          title="Not authorized"
          description="Sign in as a doctor to access this page."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Weekly schedule"
      description="Define your weekly availability, clinics, rooms, and slot durations."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schedule table */}
        <Card className="lg:col-span-2 space-y-4">
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Weekly recurring schedule
              </h2>
              <Button type="submit" size="sm" isLoading={saving}>
                Save schedule
              </Button>
            </div>

            {loadingSchedule ? (
              <LoadingSpinner />
            ) : clinics.length === 0 ? (
              <EmptyState
                title="No clinics configured"
                description="Ask an admin to create clinics first."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="border-b bg-slate-50">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold text-slate-700">
                        Day
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-slate-700">
                        Active
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-slate-700">
                        Clinic
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-slate-700">
                        Room
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-slate-700">
                        From
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-slate-700">
                        To
                      </th>
                      <th className="px-2 py-2 text-left font-semibold text-slate-700">
                        Slot (min)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleRows.map((row, index) => {
                      const clinicRooms = rooms.filter(
                        (r) => r.clinic === row.clinicId
                      );
                      return (
                        <tr
                          key={row.dayOfWeek}
                          className="border-b last:border-0"
                        >
                          <td className="px-2 py-2">
                            {DAY_LABELS[row.dayOfWeek]}
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={row.isActive}
                              onChange={(e) =>
                                updateRow(index, {
                                  isActive: e.target.checked
                                })
                              }
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Select
                              value={row.clinicId}
                              onChange={(e) =>
                                updateRow(index, {
                                  clinicId: e.target.value,
                                  roomId: ""
                                })
                              }
                              disabled={!row.isActive}
                            >
                              <option value="">Select</option>
                              {clinics.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.name}
                                  {c.address?.city
                                    ? ` – ${c.address.city}`
                                    : ""}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="px-2 py-2">
                            <Select
                              value={row.roomId ?? ""}
                              onChange={(e) =>
                                updateRow(index, {
                                  roomId: e.target.value
                                })
                              }
                              disabled={!row.isActive || !row.clinicId}
                            >
                              <option value="">Any room</option>
                              {clinicRooms.map((r) => (
                                <option key={r._id} value={r._id}>
                                  {r.room_number} ({r.status.toLowerCase()})
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="time"
                              value={row.startTime}
                              onChange={(e) =>
                                updateRow(index, {
                                  startTime: e.target.value
                                })
                              }
                              disabled={!row.isActive}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="time"
                              value={row.endTime}
                              onChange={(e) =>
                                updateRow(index, {
                                  endTime: e.target.value
                                })
                              }
                              disabled={!row.isActive}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              min={5}
                              value={String(row.slotDurationMinutes)}
                              onChange={(e) =>
                                updateRow(index, {
                                  slotDurationMinutes: Number(
                                    e.target.value
                                  )
                                })
                              }
                              disabled={!row.isActive}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-xs text-emerald-600">{success}</p>
            )}
          </form>
        </Card>

        {/* Generate slots card */}
        <Card className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Generate time slots
          </h2>
          <p className="text-xs text-slate-600">
            Use your weekly schedule to create actual bookable slots
            between the selected dates.
          </p>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                From date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                To date
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full"
            isLoading={generating}
            onClick={handleGenerateSlots}
          >
            Generate slots
          </Button>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-600">{success}</p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
