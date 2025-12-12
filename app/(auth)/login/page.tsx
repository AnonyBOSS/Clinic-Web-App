"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { useTranslation } from "@/lib/i18n";

type Role = "PATIENT" | "DOCTOR";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { t } = useTranslation();

  const [role, setRole] = useState<Role>("PATIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.errors.somethingWentWrong);
      } else {
        router.push(redirectTo);
      }
    } catch {
      setError(t.errors.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title={t.auth.signIn}
      description={t.nav.dashboard}
    >
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 p-6 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.auth.password}
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
          >
            {t.auth.signIn}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
