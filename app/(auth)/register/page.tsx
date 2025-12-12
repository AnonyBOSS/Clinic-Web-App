// app/(auth)/register/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { useTranslation } from "@/lib/i18n";

type Role = "PATIENT" | "DOCTOR";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
        setError(data.error ?? t.errors.somethingWentWrong);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(t.errors.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title={t.auth.signUp}
      description={`${t.auth.asPatient} ${t.common.or} ${t.auth.asDoctor}`}
    >
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.auth.asPatient} / {t.auth.asDoctor}
            </label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="PATIENT">{t.auth.asPatient}</option>
              <option value="DOCTOR">{t.auth.asDoctor}</option>
            </Select>
          </div>

          {/* Full name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.auth.fullName}
            </label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.auth.namePlaceholder}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.auth.phone}
            </label>
            <Input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.auth.phonePlaceholder}
            />
          </div>

          {/* Doctor-only fields */}
          {role === "DOCTOR" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.doctors.specialization}
                </label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder={t.auth.specializationPlaceholder}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.doctors.qualifications}
                </label>
                <Input
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder={t.auth.qualificationsPlaceholder}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.auth.email}
            </label>
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.auth.password}
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
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
            {t.auth.signUp}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
