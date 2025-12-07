"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import Link from "next/link";
import { useToast } from "@/components/ToastContext";

export default function PatientLoginPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role: "patient" }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = {};

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response from patient login API:", text);
        throw new Error("Unexpected response from server");
      }

      if (!res.ok || !data.success) {
        const msg = data.error || data.message || "Login failed.";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }

      // Optional legacy localStorage (no longer used for auth decisions)
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userRole", "patient");
        }
      } catch {
        // ignore
      }

      addToast({ type: "success", message: "Logged in successfully." });
      router.push("/patient/dashboard");
    } catch (err) {
      console.error("Patient login error:", err);
      const msg = "Something went wrong while logging in.";
      setError(msg);
      addToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="site-container py-10">
      <div className="max-w-md mx-auto card">
        <h1 className="mb-2">Patient login</h1>
        <p className="text-sm text-slate-500 mb-6">
          Sign in to manage your appointments and view your visits.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </FormField>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-600 underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
