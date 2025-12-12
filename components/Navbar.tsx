// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

type Role = "PATIENT" | "DOCTOR";

type CurrentUser =
  | {
    id: string;
    full_name: string;
    email: string;
    role: Role;
  }
  | null;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store"
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

  useEffect(() => {
    setLoading(true);
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch {
      // ignore
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        router.push("/");
        router.refresh();
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-dark-800 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl">
      <div className="site-container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            CF
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white">Clinify</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            Dashboard
          </Link>
          {user?.role !== "DOCTOR" && (
            <>
              <Link
                href="/book"
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                Book
              </Link>
              <Link
                href="/symptom-checker"
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                AI Check
              </Link>
            </>
          )}
          {user?.role === "DOCTOR" && (
            <>
              <Link
                href="/doctor/schedule"
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                Schedule
              </Link>
              <Link
                href="/doctor/analytics"
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                Analytics
              </Link>
            </>
          )}
          {user && (
            <Link
              href="/messages"
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            >
              Messages
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          <ThemeToggle />

          {loading ? (
            <div className="w-20 h-9 bg-slate-100 dark:bg-dark-800 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline">{user.full_name}</span>
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="gradient">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950 py-4">
          <nav className="site-container flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user?.role !== "DOCTOR" && (
              <Link
                href="/book"
                className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Book Appointment
              </Link>
            )}
            {user?.role === "DOCTOR" && (
              <Link
                href="/doctor/schedule"
                className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage Schedule
              </Link>
            )}
            {user && (
              <Link
                href="/profile"
                className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
