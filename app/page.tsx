// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";

type Role = "PATIENT" | "DOCTOR";

type CurrentUser =
  | {
    id: string;
    full_name: string;
    role: Role;
  }
  | null;

// Icons as SVG components
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const UserGroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

export default function HomePage() {
  const [user, setUser] = useState<CurrentUser>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function load() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store"
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser({
          id: data.data.id,
          full_name: data.data.full_name,
          role: data.data.role as Role
        });
      } catch {
        setUser(null);
      }
    }

    load();
  }, []);

  const isPatient = user?.role === "PATIENT";
  const isDoctor = user?.role === "DOCTOR";

  const heroTitle = user
    ? isPatient
      ? "Ready for your next visit?"
      : "Stay in control of your clinic schedule."
    : "Healthcare booking, reimagined.";

  const heroSubtitle = user
    ? isPatient
      ? "Browse your doctors, pick the best time, and confirm in seconds. No calls, no waiting."
      : "Define your working hours, choose rooms, and let patients book only when you are truly available."
    : "Find a clinic, choose your preferred doctor, and confirm your appointment without phone calls.";

  return (
    <PageShell
      title={user ? `Welcome, ${user.full_name}` : "Book your next clinic visit"}
      description={heroSubtitle}
    >
      <div className="space-y-20 hero-bg">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-primary w-96 h-96 -top-48 -right-48 animate-pulse-soft" />
          <div className="blob blob-secondary w-64 h-64 top-1/3 -left-32 animate-float delay-300" />
          <div className="blob blob-primary w-48 h-48 bottom-1/4 right-1/4 animate-pulse-soft delay-500" />
        </div>

        {/* HERO SECTION */}
        <section className={`relative z-10 grid gap-12 lg:grid-cols-[3fr,2fr] items-center ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          {/* Left: hero content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 rounded-full glass px-4 py-2 ${mounted ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                <SparklesIcon />
              </span>
              <span className="text-xs font-medium text-slate-700">
                Clinify · Smart clinic appointment platform
              </span>
            </div>

            {/* Title */}
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight ${mounted ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
              <span className="text-slate-900">{heroTitle.split(',')[0]}</span>
              {heroTitle.includes(',') && (
                <>
                  <span className="text-gradient">,{heroTitle.split(',')[1]}</span>
                </>
              )}
              {!heroTitle.includes(',') && heroTitle.includes(' ') && (
                <span className="block mt-2 text-gradient">
                  {heroTitle.split(' ').slice(-1)[0]}
                </span>
              )}
            </h1>

            {/* Subtitle */}
            <p className={`text-lg text-slate-600 max-w-xl leading-relaxed ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
              {heroSubtitle}
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-wrap gap-4 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="btn-gradient btn-glow px-8 py-3 text-base font-semibold rounded-xl">
                      Go to dashboard
                    </Button>
                  </Link>
                  {isPatient && (
                    <Link href="/book">
                      <Button size="lg" variant="outline" className="px-8 py-3 text-base font-semibold rounded-xl border-2 hover:bg-indigo-50 hover:border-indigo-300">
                        Book an appointment
                      </Button>
                    </Link>
                  )}
                  {isDoctor && (
                    <Link href="/doctor/schedule">
                      <Button size="lg" variant="outline" className="px-8 py-3 text-base font-semibold rounded-xl border-2 hover:bg-indigo-50 hover:border-indigo-300">
                        Manage schedule
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/book">
                    <Button size="lg" className="btn-gradient btn-glow px-8 py-3 text-base font-semibold rounded-xl">
                      Book an appointment
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="px-8 py-3 text-base font-semibold rounded-xl border-2 hover:bg-indigo-50 hover:border-indigo-300">
                      Create account
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats row */}
            <div className={`flex flex-wrap gap-6 pt-6 ${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
              <div className="stat-card flex items-center gap-3 min-w-[140px]">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600">
                  <ClockIcon />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">24/7</p>
                  <p className="text-xs text-slate-500">Online access</p>
                </div>
              </div>
              <div className="stat-card flex items-center gap-3 min-w-[140px]">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600">
                  <PhoneIcon />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">Zero</p>
                  <p className="text-xs text-slate-500">Phone calls</p>
                </div>
              </div>
              <div className="stat-card flex items-center gap-3 min-w-[140px]">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-violet-600">
                  <ShieldIcon />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">100%</p>
                  <p className="text-xs text-slate-500">Validated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hero image */}
          <div className={`relative ${mounted ? 'animate-slide-in-right delay-200' : 'opacity-0'}`}>
            <div className="relative h-80 lg:h-[420px] w-full overflow-hidden rounded-3xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1100&q=80"
                alt="Modern medical clinic"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 via-transparent to-indigo-600/30" />

              {/* Floating card */}
              <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white animate-bounce-soft">
                    <HeartIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Real clinic environments</p>
                    <p className="text-xs text-slate-600">Built for everyday patient visits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 blur-xl animate-float" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-20 blur-xl animate-float delay-500" />
          </div>
        </section>

        {/* THREE-COLUMN FEATURE CARDS */}
        <section className={`relative z-10 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Designed for <span className="text-gradient">everyone</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Whether you&apos;re a patient looking for care or a doctor managing your practice, Clinify adapts to your needs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Patients Card */}
            <div className="card-glass p-6 space-y-4 group cursor-pointer">
              <div className="feature-icon">
                <UserGroupIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                For patients
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Search clinics, see each doctor&apos;s available slots, and book
                in a few clicks. Get a clear summary of your upcoming appointments
                and receive automatic updates when doctors change schedules.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Easy online booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Appointment reminders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Schedule notifications</span>
                </li>
              </ul>
            </div>

            {/* Doctors Card */}
            <div className="card-glass p-6 space-y-4 group cursor-pointer">
              <div className="feature-icon">
                <CalendarIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                For doctors
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Define working days per clinic and room, prevent overlapping
                schedules, and automatically generate valid slots. Set your own
                consultation fee and let Clinify handle the rest.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Flexible scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Multi-clinic support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Custom pricing</span>
                </li>
              </ul>
            </div>

            {/* Clinics Card */}
            <div className="card-glass p-6 space-y-4 group cursor-pointer">
              <div className="feature-icon">
                <BuildingIcon />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                For clinics
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Centralize booking across multiple branches and rooms. Reduce
                phone traffic, avoid double-booking, and have a single source of
                truth for clinic occupancy.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Centralized management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Room allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon />
                  <span>Occupancy tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS + WHY CLINICS */}
        <section className={`relative z-10 grid gap-8 lg:grid-cols-2 ${mounted ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
          {/* How Clinify Works */}
          <Card className="p-8 space-y-6 bg-gradient-to-br from-indigo-50 via-white to-violet-50 border-indigo-100/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white">
                <SparklesIcon />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                How Clinify works
              </h2>
            </div>
            <ol className="space-y-4">
              {[
                { step: 1, text: "Create a patient or doctor account in seconds." },
                { step: 2, text: "Doctors set their working days, rooms, and consultation fee per clinic." },
                { step: 3, text: "Patients see only valid, future slots and book securely." },
                { step: 4, text: "Any schedule changes automatically cancel affected appointments and surface alerts." }
              ].map((item) => (
                <li key={item.step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">
                    {item.step}
                  </div>
                  <p className="text-sm text-slate-700 pt-1">{item.text}</p>
                </li>
              ))}
            </ol>
          </Card>

          {/* Why Clinics Choose Clinify */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600">
                <ShieldIcon />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Why clinics choose Clinify
              </h2>
            </div>
            <ul className="space-y-4">
              {[
                "Prevents double-booking with strict schedule validations",
                "Blocks rooms under maintenance from being assigned to new slots",
                "Guards against past-time bookings and automatically cleans up expired slots",
                "Gives both patients and doctors a clear view of upcoming visits"
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 mt-0.5 text-emerald-500">
                    <CheckCircleIcon />
                  </div>
                  <p className="text-sm text-slate-600">{item}</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* CTA STRIP */}
        <section className={`relative z-10 ${mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 md:p-12 animate-gradient">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Start managing your clinic visits in one place
                </h2>
                <p className="text-white/80 text-sm md:text-base">
                  Create an account in seconds and see how simple booking can be.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="!bg-white !text-indigo-700 hover:!bg-indigo-50 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Open dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="!bg-white !text-indigo-700 hover:!bg-indigo-50 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Sign up free
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="ghost"
                        className="!border-2 !border-white/30 !bg-white/10 !text-white hover:!bg-white/20 font-semibold px-8 py-3 rounded-xl backdrop-blur-sm"
                      >
                        I already have an account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={`relative z-10 border-t border-slate-200/50 pt-12 pb-6 ${mounted ? 'animate-fade-in delay-600' : 'opacity-0'}`}>
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-bold text-white">
                  CF
                </span>
                <span className="text-lg font-bold text-slate-900">Clinify</span>
              </div>
              <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
                Smart clinic appointment booking for patients and doctors.
                Built for managing real clinic workflows with secure booking,
                clear pricing, and smart schedules.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/book" className="hover:text-indigo-600 transition-colors">Book Appointment</Link></li>
                <li><Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-indigo-600 transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-indigo-600 transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-slate-200/50 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Clinify. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Secure booking</span>
              <span>·</span>
              <span>Clear pricing</span>
              <span>·</span>
              <span>Smart schedules</span>
            </div>
          </div>
        </footer>
      </div>
    </PageShell>
  );
}
