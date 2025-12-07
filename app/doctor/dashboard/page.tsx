"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthUser = {
  id: string;
  role: "doctor" | "patient";
  full_name: string;
  email: string;
};

type DoctorSchedule = {
  day: string;
  start_time: string;
  end_time: string;
};

type Appointment = {
  _id: string;
  createdAt: string;
  status: string;
  patient_id?: {
    full_name: string;
  };
  clinic_id?: {
    name: string;
  };
  room_id?: {
    room_number: string;
  };
};

export default function DoctorDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"schedule" | "appointments">(
    "schedule"
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to fetch dashboard data for a given date
  const fetchDoctorData = async (date: string, cancelled?: boolean) => {
    try {
      setError(null);
      const res = await fetch(`/api/doctor/dashboard?date=${date}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (cancelled) return;

      if (res.ok && data.success) {
        setSchedule(data.schedule || []);
        setAppointments(data.appointments || []);
      } else {
        console.error("Failed to load doctor data:", data.message || data.error);
        setError(data.message || data.error || "Failed to load doctor data.");
      }
    } catch (err) {
      if (!cancelled) {
        console.error("Error fetching doctor data:", err);
        setError("Failed to load doctor data.");
      }
    }
  };

  // Initial auth + load
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          if (!cancelled) router.push("/doctor/login");
          return;
        }

        const data = await res.json();

        if (!data.success || data.user.role !== "doctor") {
          if (!cancelled) router.push("/doctor/login");
          return;
        }

        if (!cancelled) {
          setUser(data.user);
        }

        const today = new Date().toISOString().split("T")[0];
        if (!cancelled) {
          setSelectedDate(today);
          await fetchDoctorData(today, cancelled);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading doctor dashboard:", err);
          setError("Something went wrong loading your dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleDateChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const date = e.target.value;
    setSelectedDate(date);
    await fetchDoctorData(date);
  };

  if (loading) {
    return (
      <main className="site-container py-10">
        <div className="card">
          <p>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="site-container py-10">
        <div className="card">
          <h2 className="mb-2">Something went wrong</h2>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <button
            className="btn btn-secondary"
            onClick={() => router.refresh()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    // Already redirected by effect; nothing to render
    return null;
  }

  const firstName = user.full_name.split(" ")[0];

  return (
    <main className="site-container py-10">
      {/* Header */}
      <section className="mb-6">
        <h1 className="mb-1">Welcome back, Dr. {firstName}</h1>
        <p className="text-sm text-slate-500">
          Review your weekly schedule and today&apos;s appointments.
        </p>
      </section>

      {/* Tabs */}
      <section className="card mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "schedule"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Weekly schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "appointments"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Appointments for {selectedDate || "selected day"}
          </button>
        </div>
      </section>

      {/* Schedule tab */}
      {activeTab === "schedule" && (
        <section className="card">
          <h2 className="text-lg font-semibold mb-4">Your weekly schedule</h2>
          {schedule.length === 0 ? (
            <p className="text-sm text-slate-500">No schedule set yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {schedule.map((day, idx) => (
                <div
                  key={idx}
                  className="soft-border rounded-lg bg-white p-4 flex flex-col gap-1"
                >
                  <div className="font-medium text-slate-900">{day.day}</div>
                  <div className="text-sm text-slate-600">
                    {day.start_time} – {day.end_time}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-slate-400">
            Schedule management coming soon.
          </p>
        </section>
      )}

      {/* Appointments tab */}
      {activeTab === "appointments" && (
        <section className="card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Appointments</h2>
              <p className="text-xs text-slate-500">
                Showing bookings for the selected date.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="date"
                className="text-xs font-medium text-slate-600"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-3 py-2 text-sm border rounded-md border-slate-200"
              />
            </div>
          </div>

          {appointments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No appointments scheduled for this date.
            </p>
          ) : (
            <div className="table-wrapper">
              <table className="table-root">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Clinic</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Created at</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt._id}>
                      <td>{appt.patient_id?.full_name ?? "—"}</td>
                      <td>{appt.clinic_id?.name ?? "—"}</td>
                      <td>{appt.room_id?.room_number ?? "—"}</td>
                      <td className="capitalize">{appt.status}</td>
                      <td>
                        {new Date(appt.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
