// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";

type Role = "PATIENT" | "DOCTOR";

type CurrentUser =
  | {
      id: string;
      full_name: string;
      email: string;
      role: Role;
    }
  | null;

export default function HomePage() {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.data as CurrentUser);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  // While we don't know yet
  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  // 🔓 Logged OUT view
  if (!user) {
    return (
      <main>
        <section className="border-b bg-white">
          <div className="site-container grid gap-10 py-16 lg:grid-cols-2 lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <span className="text-base">🏥</span>
                <span>Clinic management & booking made simple</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Manage appointments without phone calls or chaos.
              </h1>

              <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                Patients and doctors share the same clean, modern interface to
                book visits, manage schedules, and keep everything in sync with
                MongoDB.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/register">
                  <Button size="lg">Get started</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign in
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>No need for separate patient & doctor apps.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span>Backed by MongoDB for reliability.</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <p className="text-3xl font-semibold text-slate-900">24/7</p>
                  <p className="text-sm text-slate-500">
                    Self-service booking for patients at any time.
                  </p>
                </Card>
                <Card>
                  <p className="text-3xl font-semibold text-slate-900">Zero</p>
                  <p className="text-sm text-slate-500">
                    Overbooked slots when schedules are generated correctly.
                  </p>
                </Card>
              </div>
              <Card>
                <h2 className="mb-1 text-base font-semibold text-slate-900">
                  For clinics of any size
                </h2>
                <p className="text-sm text-slate-600">
                  Start simple: a single clinic, a few rooms and doctors. Grow
                  into a full schedule and appointment system without changing
                  tools.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // 🔒 Logged IN view
  const isPatient = user.role === "PATIENT";

  return (
    <main>
      <section className="border-b bg-white">
        <div className="site-container py-16 lg:py-20 space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              Welcome back
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Hi {user.full_name.split(" ")[0]}, here&apos;s what you can do
              next.
            </h1>
            <p className="max-w-xl text-sm text-slate-600">
              You&apos;re signed in as a{" "}
              <span className="font-semibold">
                {isPatient ? "patient" : "doctor"}
              </span>
              . Jump straight into your most common actions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {isPatient ? (
              <>
                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Book a new appointment
                  </h2>
                  <p className="text-xs text-slate-600">
                    Choose clinic, doctor, date and time in just a few clicks.
                  </p>
                  <Link href="/book">
                    <Button size="sm" className="mt-2">
                      Book now
                    </Button>
                  </Link>
                </Card>

                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    View your upcoming visits
                  </h2>
                  <p className="text-xs text-slate-600">
                    Check appointment status, time, and clinic location.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="mt-2">
                      Open dashboard
                    </Button>
                  </Link>
                </Card>

                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Update your info
                  </h2>
                  <p className="text-xs text-slate-600">
                    Keep your contact details up to date so clinics can reach
                    you easily.
                  </p>
                  <Link href="/profile">
                    <Button size="sm" variant="outline" className="mt-2">
                      Go to profile
                    </Button>
                  </Link>
                </Card>
              </>
            ) : (
              <>
                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Today&apos;s schedule
                  </h2>
                  <p className="text-xs text-slate-600">
                    See who&apos;s coming in today, at which clinic and room.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" className="mt-2">
                      View schedule
                    </Button>
                  </Link>
                </Card>

                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Manage weekly availability
                  </h2>
                  <p className="text-xs text-slate-600">
                    Define your working days, clinics, rooms, and slot
                    durations.
                  </p>
                  <Link href="/doctor/schedule">
                    <Button size="sm" variant="outline" className="mt-2">
                      Configure schedule
                    </Button>
                  </Link>
                </Card>

                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Upcoming patients
                  </h2>
                  <p className="text-xs text-slate-600">
                    Review booked appointments and plan your day in advance.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="mt-2">
                      Open dashboard
                    </Button>
                  </Link>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
