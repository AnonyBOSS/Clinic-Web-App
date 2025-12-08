// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";

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
          credentials: "include"
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

  // Logged-out hero
  if (!loading && !user) {
    return (
      <main>
        <section className="border-b bg-white">
          <div className="site-container grid gap-10 py-16 lg:grid-cols-2 lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <span className="text-base">🏥</span>
                <span>Modern clinic booking for everyone</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Book appointments without phone calls or chaos.
              </h1>

              <p className="max-w-xl text-base text-slate-600 sm:text-lg">
                Patients and doctors manage schedules and visits from one clean interface powered by MongoDB.
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
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <p className="text-3xl font-semibold text-slate-900">24/7</p>
                  <p className="text-sm text-slate-500">
                    Self-service booking from any device.
                  </p>
                </Card>
                <Card>
                  <p className="text-3xl font-semibold text-slate-900">100%</p>
                  <p className="text-sm text-slate-500">
                    All appointments synced in MongoDB.
                  </p>
                </Card>
              </div>
              <Card>
                <h2 className="mb-1 text-base font-semibold text-slate-900">
                  Built on MongoDB
                </h2>
                <p className="text-sm text-slate-600">
                  Users, clinics, and appointments live together in a single scalable database.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Logged-in hero (patient or doctor)
  return (
    <main>
      <section className="border-b bg-white">
        <div className="site-container py-16 lg:py-20 space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              Welcome back
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Hi {user?.full_name}, here&apos;s what you can do today.
            </h1>
            <p className="max-w-xl text-sm text-slate-600">
              You&apos;re signed in as a{" "}
              <span className="font-semibold">
                {user?.role === "PATIENT" ? "patient" : "doctor"}
              </span>
              . Jump straight into your most common actions.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {user?.role === "PATIENT" ? (
              <>
                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Book a new appointment
                  </h2>
                  <p className="text-xs text-slate-600">
                    Choose your clinic, doctor, and time in a few clicks.
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
                    See all your future appointments in one place.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="mt-2">
                      Go to dashboard
                    </Button>
                  </Link>
                </Card>

                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Payment history
                  </h2>
                  <p className="text-xs text-slate-600">
                    Review what you&apos;ve paid for previous visits.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="mt-2">
                      Open dashboard
                    </Button>
                  </Link>
                </Card>
              </>
            ) : (
              // DOCTOR shortcuts
              <>
                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Today&apos;s schedule
                  </h2>
                  <p className="text-xs text-slate-600">
                    Check who&apos;s coming in today and when.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" className="mt-2">
                      View schedule
                    </Button>
                  </Link>
                </Card>

                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Upcoming patients
                  </h2>
                  <p className="text-xs text-slate-600">
                    See all upcoming appointments in your calendar.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="mt-2">
                      Open dashboard
                    </Button>
                  </Link>
                </Card>

                <Card className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Payment overview
                  </h2>
                  <p className="text-xs text-slate-600">
                    Track collected fees across your appointments.
                  </p>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" className="mt-2">
                      Go to dashboard
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
