// app/symptom-checker/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

interface SymptomAnalysis {
    suggestedSpecialties: string[];
    urgencyLevel: UrgencyLevel;
    summary: string;
    followUpQuestions?: string[];
}

interface RecommendedDoctor {
    _id: string;
    full_name: string;
    specializations: string[];
    consultation_fee: number;
    availableSlots: number;
    matchScore: number;
}

interface AnalysisResult {
    checkId: string;
    analysis: SymptomAnalysis;
    recommendedDoctors: RecommendedDoctor[];
}

const urgencyColors: Record<UrgencyLevel, string> = {
    LOW: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    EMERGENCY: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
};

const urgencyIcons: Record<UrgencyLevel, string> = {
    LOW: "✓",
    MEDIUM: "⚠",
    HIGH: "⚡",
    EMERGENCY: "🚨"
};

export default function SymptomCheckerPage() {
    const router = useRouter();
    const { t, language } = useTranslation();
    const [symptoms, setSymptoms] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [gender, setGender] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (symptoms.trim().length < 10) {
            setError("Please describe your symptoms in more detail (at least 10 characters)");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/ai/symptom-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    symptoms: symptoms.trim(),
                    age: age || undefined,
                    gender: gender || undefined,
                    language: language
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to analyze symptoms");
            }

            setResult(data.data);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function handleBookDoctor(doctorId: string) {
        router.push(`/book?doctorId=${doctorId}`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4"
                    >
                        ← {t.common.back}
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-4xl">🩺</span>
                        {t.ai.symptomChecker}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        {t.ai.describeSymptoms}
                    </p>
                </div>

                {!result ? (
                    /* Input Form */
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Symptoms Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t.ai.describeSymptoms} *
                                </label>
                                <textarea
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    placeholder={t.ai.symptomPlaceholder}
                                    rows={5}
                                    className="w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {t.ai.moreDetail}
                                </p>
                            </div>

                            {/* Optional Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t.ai.age} ({t.common.optional})
                                    </label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")}
                                        placeholder={t.ai.agePlaceholder}
                                        min="1"
                                        max="120"
                                        className="w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t.ai.gender} ({t.common.optional})
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="">{t.ai.preferNotToSay}</option>
                                        <option value="male">{t.ai.male}</option>
                                        <option value="female">{t.ai.female}</option>
                                        <option value="other">{t.ai.other}</option>
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || symptoms.trim().length < 10}
                                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {t.ai.analyzing}
                                    </>
                                ) : (
                                    <>
                                        <span>🔍</span>
                                        {t.ai.analyzeSymptoms}
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                ⚠️ {t.ai.notMedicalDiagnosis}
                            </p>
                        </form>
                    </div>
                ) : (
                    /* Results */
                    <div className="space-y-6">
                        {/* Urgency Banner */}
                        {result.analysis.urgencyLevel === "EMERGENCY" && (
                            <div className="bg-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-4 animate-pulse">
                                <span className="text-3xl">🚨</span>
                                <div>
                                    <p className="font-bold text-lg">{t.ai.urgentAttention}</p>
                                    <p>{t.ai.seekImmediateCare}</p>
                                </div>
                            </div>
                        )}

                        {/* Analysis Card */}
                        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                    {t.ai.analysisResults}
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${urgencyColors[result.analysis.urgencyLevel]}`}>
                                    {urgencyIcons[result.analysis.urgencyLevel]} {result.analysis.urgencyLevel}
                                </span>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                {result.analysis.summary}
                            </p>

                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    {t.ai.recommendedSpecialties}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.suggestedSpecialties.map((spec, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {result.analysis.followUpQuestions && result.analysis.followUpQuestions.length > 0 && (
                                <div className="bg-slate-50 dark:bg-dark-700 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                        {t.ai.questionsForDoctor}
                                    </h3>
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                        {result.analysis.followUpQuestions.map((q, i) => (
                                            <li key={i}>{q}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Recommended Doctors */}
                        {result.recommendedDoctors.length > 0 && (
                            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                    {t.ai.recommendedDoctors}
                                </h2>
                                <div className="space-y-4">
                                    {result.recommendedDoctors.map((doc, i) => (
                                        <div
                                            key={doc._id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-600"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                                        {doc.full_name}
                                                    </h3>
                                                    {i === 0 && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                                            {t.ai.bestMatch}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {doc.specializations.join(", ")}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>💰 EGP {doc.consultation_fee}</span>
                                                    <span>📅 {doc.availableSlots} {t.doctors.slotsAvailable}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleBookDoctor(doc._id)}
                                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
                                            >
                                                {t.home.bookNow}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Check Again Button */}
                        <button
                            onClick={() => {
                                setResult(null);
                                setSymptoms("");
                                setAge("");
                                setGender("");
                            }}
                            className="w-full py-3 px-4 rounded-lg border-2 border-slate-300 dark:border-dark-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-dark-700 transition"
                        >
                            {t.ai.checkNewSymptoms}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
