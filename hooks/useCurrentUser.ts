"use client";

import { useEffect, useState } from "react";

export type CurrentUser = {
  id: string;
  role: "patient" | "doctor";
  full_name: string;
  email: string;
  phone?: string;
};

type UseCurrentUserResult = {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
};

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        setLoading(true);
        setError(null);

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
        console.error("Error fetching current user:", err);
        if (!cancelled) {
          setError("Failed to load current user");
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, error };
}
