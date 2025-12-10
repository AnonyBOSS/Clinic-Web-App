// app/(auth)/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";

type Role = "PATIENT" | "DOCTOR";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PATIENT");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          role,
          full_name: fullName,
          phone,
          email,
          password,
          qualifications: role === "DOCTOR" ? qualifications : undefined,
          specializations:
            role === "DOCTOR" && specialization
              ? [specialization]
              : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        // logged in via cookie + token, go to dashboard
        router.push("/dashboard");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Create an account"
      description="Sign up as a patient or a doctor."
    >
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Role
            </label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </Select>
          </div>

          {/* Full name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Full name
            </label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmed Hossam"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Phone
            </label>
            <Input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20..."
            />
          </div>

          {/* Doctor-only fields */}
          {role === "DOCTOR" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Specialization
                </label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Cardiology, Pediatrics..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Qualifications
                </label>
                <Input
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="M.D., MSc, etc."
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            Create account
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
