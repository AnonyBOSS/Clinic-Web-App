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
    detailedAnalysis?: string;
    possibleConditions?: string[];
    followUpQuestions?: string[];
    selfCareAdvice?: string[];
    warningSignsToWatch?: string[];
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
    LOW: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    EMERGENCY: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
};

const urgencyIcons: Record<UrgencyLevel, string> = {
    LOW: "✓",
    MEDIUM: "⚠️",
    HIGH: "⚡",
    EMERGENCY: "🚨"
};

const urgencyLabels: Record<UrgencyLevel, { en: string; ar: string }> = {
    LOW: { en: "Low Priority", ar: "أولوية منخفضة" },
    MEDIUM: { en: "Moderate Priority", ar: "أولوية متوسطة" },
    HIGH: { en: "High Priority", ar: "أولوية عالية" },
    EMERGENCY: { en: "Emergency", ar: "طوارئ" }
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
    const [activeTab, setActiveTab] = useState<"analysis" | "doctors">("analysis");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (symptoms.trim().length < 10) {
            setError(t.ai.describeMoreDetail);
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
            setError(err.message || t.errors.somethingWentWrong);
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

                        {/* Tabs */}
                        <div className="flex gap-2 bg-white dark:bg-dark-800 rounded-lg p-1 border border-slate-200 dark:border-dark-700">
                            <button
                                onClick={() => setActiveTab("analysis")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${activeTab === "analysis"
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700"
                                    }`}
                            >
                                📋 {t.ai.analysisResults}
                            </button>
                            <button
                                onClick={() => setActiveTab("doctors")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${activeTab === "doctors"
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700"
                                    }`}
                            >
                                👨‍⚕️ {t.ai.recommendedDoctors} ({result.recommendedDoctors.length})
                            </button>
                        </div>

                        {activeTab === "analysis" ? (
                            /* Analysis Card */
                            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 p-6 space-y-6">
                                {/* Header with Urgency */}
                                <div className="flex items-start justify-between">
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                        {t.ai.analysisResults}
                                    </h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${urgencyColors[result.analysis.urgencyLevel]}`}>
                                        {urgencyIcons[result.analysis.urgencyLevel]} {urgencyLabels[result.analysis.urgencyLevel][language]}
                                    </span>
                                </div>

                                {/* Summary */}
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                    <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                                        📝 {language === "ar" ? "الملخص" : "Summary"}
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300">
                                        {result.analysis.summary}
                                    </p>
                                </div>

                                {/* Detailed Analysis */}
                                {result.analysis.detailedAnalysis && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            🔍 {language === "ar" ? "التحليل المفصل" : "Detailed Analysis"}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                            {result.analysis.detailedAnalysis}
                                        </p>
                                    </div>
                                )}

                                {/* Suggested Specialties */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        🏥 {t.ai.recommendedSpecialties}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.analysis.suggestedSpecialties.map((spec, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Possible Conditions */}
                                {result.analysis.possibleConditions && result.analysis.possibleConditions.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            💭 {language === "ar" ? "الحالات المحتملة" : "Possible Conditions"}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.analysis.possibleConditions.map((condition, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 text-sm"
                                                >
                                                    {condition}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Self-Care Advice */}
                                {result.analysis.selfCareAdvice && result.analysis.selfCareAdvice.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                                            💚 {language === "ar" ? "نصائح الرعاية الذاتية" : "Self-Care Advice"}
                                        </h3>
                                        <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-400 space-y-1">
                                            {result.analysis.selfCareAdvice.map((advice, i) => (
                                                <li key={i}>{advice}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Warning Signs */}
                                {result.analysis.warningSignsToWatch && result.analysis.warningSignsToWatch.length > 0 && (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                                        <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">
                                            ⚠️ {language === "ar" ? "علامات تحذيرية يجب مراقبتها" : "Warning Signs to Watch"}
                                        </h3>
                                        <ul className="list-disc list-inside text-sm text-orange-700 dark:text-orange-400 space-y-1">
                                            {result.analysis.warningSignsToWatch.map((sign, i) => (
                                                <li key={i}>{sign}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Follow-up Questions */}
                                {result.analysis.followUpQuestions && result.analysis.followUpQuestions.length > 0 && (
                                    <div className="bg-slate-50 dark:bg-dark-700 rounded-xl p-4">
                                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            ❓ {t.ai.questionsForDoctor}
                                        </h3>
                                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                            {result.analysis.followUpQuestions.map((q, i) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-4 border-t border-slate-200 dark:border-dark-600">
                                    ⚠️ {t.ai.notMedicalDiagnosis}
                                </div>
                            </div>
                        ) : (
                            /* Recommended Doctors */
                            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                    {t.ai.recommendedDoctors}
                                </h2>
                                {result.recommendedDoctors.length > 0 ? (
                                    <div className="space-y-4">
                                        {result.recommendedDoctors.map((doc, i) => (
                                            <div
                                                key={doc._id}
                                                className={`flex items-center justify-between p-4 rounded-xl border transition hover:shadow-md ${i === 0
                                                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800"
                                                    : "bg-slate-50 dark:bg-dark-700 border-slate-200 dark:border-dark-600"
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                                            Dr. {doc.full_name}
                                                        </h3>
                                                        {i === 0 && (
                                                            <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                                                ⭐ {t.ai.bestMatch}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {doc.specializations.join(", ")}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            💰 EGP {doc.consultation_fee}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            📅 {doc.availableSlots} {t.doctors.slotsAvailable}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleBookDoctor(doc._id)}
                                                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm hover:shadow"
                                                >
                                                    {t.home.bookNow}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                        <p>{language === "ar" ? "لم يتم العثور على أطباء مطابقين" : "No matching doctors found"}</p>
                                        <Link href="/book" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
                                            {language === "ar" ? "تصفح جميع الأطباء" : "Browse all doctors"}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Check Again Button */}
                        <button
                            onClick={() => {
                                setResult(null);
                                setSymptoms("");
                                setAge("");
                                setGender("");
                                setActiveTab("analysis");
                            }}
                            className="w-full py-3 px-4 rounded-lg border-2 border-slate-300 dark:border-dark-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-dark-700 transition flex items-center justify-center gap-2"
                        >
                            🔄 {t.ai.checkNewSymptoms}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
