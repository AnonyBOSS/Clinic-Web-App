// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "./Button";

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

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store", // 👈 avoid stale cached responses
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
    // Run on first load AND whenever the URL path changes
    setLoading(true);
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    } finally {
      // After logout, cookie is gone; navigate and trigger a refetch via pathname effect
      router.push("/");
      router.refresh();
    }
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="site-container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            CB
          </span>
          <span className="text-sm font-semibold text-slate-900">
            Clinics Booking
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-xs font-medium text-slate-600 hover:text-slate-900 sm:inline"
          >
            Dashboard
          </Link>

          {loading ? null : user ? (
            // ✅ Logged in: show name + Logout
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-600 sm:inline">
                {user.full_name} · {user.role.toLowerCase()}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            // ✅ Logged out: show Login + Sign up
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
