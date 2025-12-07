"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";

type AuthUser = {
  id: string;
  role: "patient" | "doctor";
  full_name: string;
  email: string;
  phone?: string;
};

type Appointment = {
  _id: string;
  date: string;
  time: string;
  status: string;
  doctor_id?: {
    full_name: string;
    specializations?: string[];
  };
};

export default function PatientDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/appointments/book", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppointments(data.appointments || []);
      } else {
        console.error(
          "Error fetching appointments:",
          data.error || data.message
        );
        setError(data.error || data.message || "Failed to load appointments.");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          if (!cancelled) router.push("/login");
          return;
        }

        const data = await res.json();

        if (!data.success || data.user.role !== "patient") {
          if (!cancelled) router.push("/login");
          return;
        }

        if (!cancelled) {
          setUser(data.user);
          await fetchAppointments();
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
        if (!cancelled) {
          setError("Something went wrong loading your dashboard.");
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [router]);

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
          <Button variant="secondary" onClick={() => router.refresh()}>
            Try again
          </Button>
        </div>
      </main>
    );
  }

  if (!user) {
    // we already redirected in effect – just render nothing
    return null;
  }

  return (
    <main className="site-container py-10">
      {/* Header section */}
      <section className="mb-6">
        <h1 className="mb-1">Welcome back, {user.full_name}</h1>
        <p className="text-sm text-slate-500">
          Manage your appointments and keep track of your visits.
        </p>
      </section>

      {/* Appointments section */}
      <section className="card">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold">Your appointments</h2>
          <Link href="/clinics">
            <Button variant="primary" size="sm">
              Book new appointment
            </Button>
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="text-sm text-slate-500">
            You don’t have any appointments yet.{" "}
            <Link href="/clinics" className="text-indigo-600 underline">
              Find a clinic
            </Link>{" "}
            to book your first visit.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="table-root">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id}>
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>{appt.doctor_id?.full_name ?? "—"}</td>
                    <td className="capitalize">{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
