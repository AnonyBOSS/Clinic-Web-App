// app/profile/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

type Role = "PATIENT" | "DOCTOR";

type CurrentUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  qualifications?: string;
  specializations?: string[];
};

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [qualifications, setQualifications] = useState("");
  const [specializationsStr, setSpecializationsStr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include"
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        const u = data.data as CurrentUser;
        setUser(u);

        setFullName(u.full_name ?? "");
        setPhone(u.phone ?? "");
        setEmail(u.email ?? "");
        setQualifications(u.qualifications ?? "");
        setSpecializationsStr((u.specializations ?? []).join(", "));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload: any = {
        full_name: fullName,
        phone,
        email
      };

      if (user.role === "DOCTOR") {
        payload.qualifications = qualifications;
        payload.specializations = specializationsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (currentPassword || newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update profile.");
      } else {
        setSuccess("Profile updated successfully.");

        const updated = data.data as CurrentUser;
        setUser(updated);
        setFullName(updated.full_name ?? "");
        setPhone(updated.phone ?? "");
        setEmail(updated.email ?? "");
        setQualifications(updated.qualifications ?? "");
        setSpecializationsStr((updated.specializations ?? []).join(", "));
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setError("Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to delete account.");
        setDeleting(false);
        return;
      }

      // Success - redirect to home
      router.push("/");
    } catch {
      setError("Network error while deleting account.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <PageShell title="Profile">
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        title="Profile"
        description="You need to be signed in to edit your profile."
      >
        <EmptyState
          title="Not signed in"
          description="Log in to manage your profile details."
        />
      </PageShell>
    );
  }

  const isDoctor = user.role === "DOCTOR";

  return (
    <PageShell
      title="Profile settings"
      description="Update your personal information and account settings."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Basic information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Full name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Phone
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Changing your email will impact how you sign in next time.
                </p>
              </div>
            </div>

            {isDoctor && (
              <>
                <h2 className="pt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Professional details
                </h2>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Qualifications
                  </label>
                  <Input
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Specializations
                  </label>
                  <Input
                    value={specializationsStr}
                    onChange={(e) => setSpecializationsStr(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Separate multiple specializations with commas, e.g.
                    &nbsp;
                    <span className="italic">
                      Cardiology, Internal Medicine
                    </span>
                    .
                  </p>
                </div>
              </>
            )}

            <h2 className="pt-4 text-sm font-semibold text-slate-900 dark:text-white">
              Change password
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Current password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  New password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-xs text-emerald-600">{success}</p>
            )}

            <div className="pt-2">
              <Button type="submit" isLoading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Account overview
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            This profile is tied to your{" "}
            <span className="font-medium">
              {isDoctor ? "doctor" : "patient"}
            </span>{" "}
            account. These changes will be reflected across bookings,
            appointments, and dashboards.
          </p>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li>• Keep your phone and email correct for clinic contact.</li>
            <li>• Doctors should keep their specializations accurate.</li>
            <li>• Use a strong password and don&apos;t share it.</li>
          </ul>

          {/* Delete Account Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-dark-700">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
              Danger Zone
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Permanently delete your account and all associated data including
              appointments, messages, and notifications.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Delete Account?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This action cannot be undone. This will permanently delete your
              account and remove all data including:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-4">
              <li>• All your appointments (past and future)</li>
              <li>• All your messages and conversations</li>
              <li>• All your notifications</li>
              {isDoctor && <li>• All your generated time slots</li>}
            </ul>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Type <span className="font-bold">DELETE</span> to confirm:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                  setError(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                isLoading={deleting}
              >
                Delete Forever
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
