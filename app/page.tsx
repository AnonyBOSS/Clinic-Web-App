import Link from "next/link";
import Button from "@/components/Button";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b bg-white">
        <div className="site-container py-16 lg:py-20 grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-2">
              <span className="text-base">🏥</span>
              <span>Modern clinic booking for patients & doctors</span>
            </div>

            <h1>
              Book and manage{" "}
              <span className="text-indigo-600">clinic appointments</span>{" "}
              without the chaos.
            </h1>

            <p className="max-w-xl">
              ClinicHub connects patients, doctors, and clinics in one simple
              dashboard. Find specialists, book available slots, and keep track
              of your medical visits with a clear, friendly interface.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/clinics">
                <Button variant="primary" size="lg">
                  Find a clinic
                </Button>
              </Link>
              <Link href="/doctors">
                <Button variant="secondary" size="lg">
                  Browse doctors
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-2">
              <div className="chip">
                <span>✅</span>
                <small>Verified clinics & doctors</small>
              </div>
              <div className="chip">
                <span>📅</span>
                <small>Real-time slot availability</small>
              </div>
              <div className="chip">
                <span>🔔</span>
                <small>Appointment reminders</small>
              </div>
            </div>
          </div>

          {/* Dashboard-style hero card */}
          <div className="card hero-graphic bg-linear-to-br from-indigo-50 via-sky-50 to-white flex flex-col gap-4 justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Today&apos;s overview
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    Downtown Medical Center
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  ● 12 upcoming visits
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between soft-border rounded-lg px-3 py-2 bg-white/70">
                  <div>
                    <p className="font-medium text-slate-900">New patients</p>
                    <p className="text-xs text-slate-500">Today</p>
                  </div>
                  <p className="text-base font-semibold text-emerald-600">5</p>
                </div>
                <div className="flex items-center justify-between soft-border rounded-lg px-3 py-2 bg-white/70">
                  <div>
                    <p className="font-medium text-slate-900">
                      Follow-up visits
                    </p>
                    <p className="text-xs text-slate-500">Today</p>
                  </div>
                  <p className="text-base font-semibold text-indigo-600">7</p>
                </div>
                <div className="flex items-center justify-between soft-border rounded-lg px-3 py-2 bg-white/70">
                  <div>
                    <p className="font-medium text-slate-900">Cancellation rate</p>
                    <p className="text-xs text-slate-500">This week</p>
                  </div>
                  <p className="text-base font-semibold text-amber-600">3%</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Log in as a patient to manage your visits, or as a doctor to see
              your daily schedule, rooms, and reports.
            </p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16">
        <div className="site-container">
          <div className="mb-8 max-w-2xl">
            <h2 className="mb-2">Built for real clinics and real patients</h2>
            <p>
              From searching for specialists to tracking payments and room
              slots, ClinicHub is designed to reduce friction for everyone in
              the clinic.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="card">
              <h3 className="mb-2">Smart clinic search</h3>
              <p className="text-sm">
                Browse clinics by specialty, location, or doctor. Each clinic
                page shows available doctors, rooms, and slots so you can book
                confidently.
              </p>
            </div>

            <div className="card">
              <h3 className="mb-2">Doctor-focused dashboards</h3>
              <p className="text-sm">
                Doctors get a dedicated dashboard with weekly schedules, daily
                appointments, and patient details all in one place.
              </p>
            </div>

            <div className="card">
              <h3 className="mb-2">End-to-end appointment flow</h3>
              <p className="text-sm">
                Booking, slot management, and basic payment tracking are wired
                into the system, so your team can stop juggling spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
