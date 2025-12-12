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
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
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

  // Ratings state (for patients)
  type RatingItem = {
    _id: string;
    rating: number;
    review?: string;
    createdAt: string;
    doctor?: { _id: string; full_name: string; specializations?: string[] };
  };
  const [myRatings, setMyRatings] = useState<RatingItem[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editReviewValue, setEditReviewValue] = useState("");

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

  // Fetch patient's ratings
  async function fetchMyRatings() {
    if (!user || user.role !== "PATIENT") return;
    setLoadingRatings(true);
    try {
      const res = await fetch("/api/ratings?myRatings=true", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMyRatings(data.data || []);
      }
    } catch {
      console.error("Failed to fetch ratings");
    } finally {
      setLoadingRatings(false);
    }
  }

  // Fetch ratings when user loads
  useEffect(() => {
    if (user?.role === "PATIENT") {
      fetchMyRatings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleUpdateRating(ratingId: string) {
    try {
      const res = await fetch("/api/ratings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ratingId,
          rating: editRatingValue,
          review: editReviewValue
        })
      });
      if (res.ok) {
        setEditingRatingId(null);
        fetchMyRatings();
      }
    } catch {
      console.error("Failed to update rating");
    }
  }

  async function handleDeleteRating(ratingId: string) {
    if (!confirm("Are you sure you want to delete this rating?")) return;
    try {
      const res = await fetch(`/api/ratings?ratingId=${ratingId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setMyRatings(prev => prev.filter(r => r._id !== ratingId));
      }
    } catch {
      console.error("Failed to delete rating");
    }
  }

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
      <PageShell title={t.profile.title}>
        <LoadingSpinner />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell
        title={t.profile.title}
        description={t.errors.unauthorized}
      >
        <EmptyState
          title={t.errors.unauthorized}
          description={t.nav.login}
        />
      </PageShell>
    );
  }

  const isDoctor = user.role === "DOCTOR";

  return (
    <PageShell
      title={t.profile.title}
      description={t.profile.personalInfo}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.profile.personalInfo}
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
                  {t.auth.phone}
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.auth.email}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.dashboard.emailChangeWarning}
                </p>
              </div>
            </div>

            {isDoctor && (
              <>
                <h2 className="pt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.profile.professionalDetails}
                </h2>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t.doctors.qualifications}
                  </label>
                  <Input
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t.doctors.specialization}
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
              {t.profile.changePassword}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.profile.currentPassword}
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t.profile.leaveEmpty}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.profile.newPassword}
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.profile.leaveEmpty}
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
                {t.common.save}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.profile.accountOverview}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {t.profile.accountTiedTo}{" "}
            <span className="font-medium">
              {isDoctor ? t.common.doctor : t.common.patient}
            </span>{" "}
            {t.profile.changesReflected}
          </p>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <li>• {t.profile.keepCorrect}</li>
            <li>• {t.profile.doctorsKeepAccurate}</li>
            <li>• {t.profile.useStrongPassword}</li>
          </ul>

          {/* Delete Account Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-dark-700">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
              {t.profile.dangerZone}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              {t.profile.deleteWarning}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => setShowDeleteModal(true)}
            >
              {t.profile.deleteAccount}
            </Button>
          </div>
        </Card>
      </div>

      {/* My Ratings Section - Only for Patients */}
      {!isDoctor && (
        <Card className="mt-6" variant="glass">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.ratings.myRatings}
            </h2>
            {myRatings.length > 0 && (
              <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                {myRatings.length} {t.ratings.ratingsCount}
              </span>
            )}
          </div>
          {loadingRatings ? (
            <LoadingSpinner />
          ) : myRatings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You haven&apos;t rated any doctors yet.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Complete an appointment to leave a review!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRatings.map((rating) => (
                <div
                  key={rating._id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800/50 hover:shadow-sm transition-shadow"
                >
                  {editingRatingId === rating._id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRatingValue(star)}
                            className="text-3xl transition-transform hover:scale-110"
                          >
                            {editRatingValue >= star ? (
                              <span className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]">★</span>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600">★</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <Input
                        value={editReviewValue}
                        onChange={(e) => setEditReviewValue(e.target.value)}
                        placeholder={t.ratings.reviewPlaceholder}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRatingId(null)}
                        >
                          {t.common.cancel}
                        </Button>
                        <Button size="sm" onClick={() => handleUpdateRating(rating._id)}>
                          {t.common.save}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-medium text-sm">
                            {rating.doctor?.full_name?.charAt(0) || "D"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                              Dr. {rating.doctor?.full_name || "Unknown"}
                            </p>
                            {rating.doctor?.specializations && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {rating.doctor.specializations.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-amber-400">
                            {"★".repeat(rating.rating)}
                            <span className="text-slate-300 dark:text-slate-600">
                              {"★".repeat(5 - rating.rating)}
                            </span>
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.review && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-dark-700/50 rounded-lg px-3 py-2 italic">
                            &quot;{rating.review}&quot;
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setEditingRatingId(rating._id);
                            setEditRatingValue(rating.rating);
                            setEditReviewValue(rating.review || "");
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => handleDeleteRating(rating._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

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
                {t.profile.typeToConfirm}:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={t.profile.typeToConfirm}
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
                {t.common.cancel}
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                isLoading={deleting}
              >
                {t.profile.deleteAccount}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
