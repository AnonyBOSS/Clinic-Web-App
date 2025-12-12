// components/RatingModal.tsx
"use client";

import { useState } from "react";
import Card from "./Card";
import Button from "./Button";

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorName: string;
    appointmentId: string;
    onSuccess: () => void;
}

export default function RatingModal({
    isOpen,
    onClose,
    doctorName,
    appointmentId,
    onSuccess
}: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    async function handleSubmit() {
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    appointmentId,
                    rating,
                    review: review.trim() || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to submit rating");
                return;
            }

            onSuccess();
            onClose();
            setRating(0);
            setReview("");
        } catch {
            setError("Failed to submit rating");
        } finally {
            setLoading(false);
        }
    }

    const displayRating = hoverRating || rating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <Card
                variant="glass"
                className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Decorative gradient */}
                <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-t-2xl" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Rate your visit
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            How was your experience with <span className="font-medium text-indigo-600 dark:text-indigo-400">Dr. {doctorName}</span>?
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Star Rating */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-4xl transition-all duration-150 hover:scale-110 active:scale-95"
                            >
                                {displayRating >= star ? (
                                    <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">★</span>
                                ) : (
                                    <span className="text-slate-300 dark:text-slate-600 hover:text-amber-200 dark:hover:text-amber-300/50">★</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Rating Label */}
                    <div className="h-6 text-center">
                        <span className={`text-sm font-medium transition-all ${displayRating > 0
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 dark:text-slate-500"
                            }`}>
                            {displayRating === 0 && "Select a rating"}
                            {displayRating === 1 && "Poor"}
                            {displayRating === 2 && "Fair"}
                            {displayRating === 3 && "Good"}
                            {displayRating === 4 && "Very Good"}
                            {displayRating === 5 && "Excellent! ✨"}
                        </span>
                    </div>
                </div>

                {/* Review Text */}
                <div className="mb-6">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Write a review <span className="text-slate-400">(optional)</span>
                    </label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience with this doctor..."
                        rows={3}
                        maxLength={500}
                        className="w-full rounded-xl border border-slate-200 dark:border-dark-600 bg-slate-50 dark:bg-dark-700 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                    />
                    <div className="flex justify-end mt-1">
                        <span className="text-xs text-slate-400">{review.length}/500</span>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="md"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        size="md"
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        isLoading={loading}
                        className="flex-1"
                    >
                        Submit Rating
                    </Button>
                </div>
            </Card>
        </div>
    );
}
