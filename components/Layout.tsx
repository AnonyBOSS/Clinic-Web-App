"use client";

import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "./ToastContext";
import ToastView from "./ToastView";
import Button from "./Button";

interface LayoutProps {
  children: ReactNode;
}

type UserRole = "patient" | "doctor";

interface AuthUser {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Load current user from /api/auth/me
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await res.json();

        if (!cancelled) {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Error loading current user:", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setMounted(true);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Cleanup legacy localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
      } catch {
        // ignore
      }
    }

    setUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null);

  // Focus management for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      setTimeout(() => firstMobileLinkRef.current?.focus(), 50);
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  const handleMobileKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setMobileMenuOpen(false);
    }
  };

  // Simple focus trap while mobile menu is open
  const handleMobileMenuKey = (e: KeyboardEvent) => {
    if (!mobileMenuOpen) return;
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      document.querySelectorAll("#mobile-menu a, #mobile-menu button")
    ) as HTMLElement[];
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  };

  const firstName = user?.full_name
    ? user.full_name.split(" ")[0]
    : undefined;

  const dashboardPath =
    user?.role === "patient"
      ? "/patient/dashboard"
      : user?.role === "doctor"
      ? "/doctor/dashboard"
      : null;

  const isDashboardActive =
    dashboardPath !== null && pathname?.startsWith(dashboardPath);

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-white">
        {/* NAVBAR */}
        <header className="site-header sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
          <div className="site-container h-16 flex items-center justify-between relative">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  🏥
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold text-xl text-slate-900">
                    ClinicHub
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Smarter clinic appointments
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop nav */}
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-4 xl:gap-6"
            >
              <Link
                href="/"
                className={`nav-link ${
                  isActive("/") ? "text-indigo-600" : "text-slate-700"
                }`}
              >
                Home
              </Link>
              <Link
                href="/clinics"
                className={`nav-link ${
                  isActive("/clinics") ? "text-indigo-600" : "text-slate-700"
                }`}
              >
                Clinics
              </Link>
              <Link
                href="/doctors"
                className={`nav-link ${
                  isActive("/doctors") ? "text-indigo-600" : "text-slate-700"
                }`}
              >
                Doctors
              </Link>
              {dashboardPath && (
                <Link
                  href={dashboardPath}
                  className={`nav-link ${
                    isDashboardActive ? "text-indigo-600" : "text-slate-700"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Right side user actions */}
            <div className="flex items-center gap-3">
              {mounted && user ? (
                <>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right text-xs">
                      <div className="font-semibold text-slate-900 text-sm">
                        {firstName}
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </div>
                    {dashboardPath && (
                      <Link href={dashboardPath}>
                        <Button variant="outline" size="sm">
                          Open dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </>
              ) : mounted ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Patient login
                    </Button>
                  </Link>
                  <Link href="/doctor/login">
                    <Button variant="secondary" size="sm">
                      Doctor login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Sign up
                    </Button>
                  </Link>
                </div>
              ) : null}

              {/* Mobile menu toggle */}
              <button
                type="button"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                ref={toggleButtonRef}
                onClick={() => setMobileMenuOpen((s) => !s)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              onKeyDown={(e) => {
                handleMobileKeyDown(e);
                handleMobileMenuKey(e);
              }}
              className="lg:hidden absolute inset-x-0 top-16 bg-white border-b shadow-lg"
            >
              <nav className="site-container py-4 flex flex-col gap-2">
                <Link
                  href="/"
                  ref={firstMobileLinkRef}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/clinics"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                >
                  Clinics
                </Link>
                <Link
                  href="/doctors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                >
                  Doctors
                </Link>
                {dashboardPath && (
                  <Link
                    href={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Dashboard
                  </Link>
                )}

                <div className="border-t border-slate-200 pt-3 mt-3">
                  {mounted && user ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1 text-xs text-slate-500 mb-1">
                        <span className="font-medium text-slate-700">
                          Signed in as {firstName}
                        </span>
                        <span className="capitalize">{user.role}</span>
                      </div>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  ) : mounted ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full">
                          Patient login
                        </Button>
                      </Link>
                      <Link
                        href="/doctor/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="secondary" className="w-full">
                          Doctor login
                        </Button>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button variant="primary" className="w-full">
                          Sign up
                        </Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1">{children}</main>

        {/* FOOTER */}
        <footer className="site-footer border-t mt-8">
          <div className="site-container py-10 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[2fr,1fr,1fr,1fr]">
              {/* Brand + tagline */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">
                    🏥
                  </div>
                  <div>
                    <div className="font-bold text-white">ClinicHub</div>
                    <div className="text-xs text-slate-300">
                      Trusted bookings for modern healthcare teams.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 max-w-xs">
                  A unified platform for patients, doctors, and clinics to
                  manage appointments, schedules, and daily operations in a
                  simple, reliable way.
                </p>
                <p className="mt-4 text-[11px] text-slate-500">
                  © {new Date().getFullYear()} ClinicHub. All rights reserved.
                </p>
              </div>

              {/* Patients */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                  For patients
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>
                    <Link href="/clinics" className="hover:text-white">
                      Find clinics
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctors" className="hover:text-white">
                      Browse doctors
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-white">
                      Patient login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-white">
                      Create an account
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Doctors */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                  For doctors
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>
                    <Link href="/doctor/login" className="hover:text-white">
                      Doctor login
                    </Link>
                  </li>
                  <li>
                    <Link href="/doctor/dashboard" className="hover:text-white">
                      Doctor dashboard
                    </Link>
                  </li>
                  <li>
                    <span className="opacity-80">
                      Schedule &amp; slots (coming soon)
                    </span>
                  </li>
                </ul>
              </div>

              {/* Support / Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-3">
                  Support
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>
                    <Link href="/" className="hover:text-white">
                      Help center
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="hover:text-white">
                      Contact support
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="hover:text-white">
                      Privacy &amp; terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>

        <ToastView />
      </div>
    </ToastProvider>
  );
}
