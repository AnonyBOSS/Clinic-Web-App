// app/help/page.tsx
"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

type FAQItem = {
    question: string;
    answer: string;
};

function FAQAccordion({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 dark:border-dark-700 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
            >
                <span className="text-sm font-medium text-slate-900 dark:text-white pr-4">
                    {item.question}
                </span>
                <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 bg-white dark:bg-dark-800 border-t border-slate-100 dark:border-dark-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300 pt-3 leading-relaxed">
                        {item.answer}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function HelpPage() {
    const { t } = useTranslation();

    const faqs: FAQItem[] = [
        { question: t.help.faq1q, answer: t.help.faq1a },
        { question: t.help.faq2q, answer: t.help.faq2a },
        { question: t.help.faq3q, answer: t.help.faq3a },
        { question: t.help.faq4q, answer: t.help.faq4a },
        { question: t.help.faq5q, answer: t.help.faq5a },
        { question: t.help.faq6q, answer: t.help.faq6a },
        { question: t.help.faq7q, answer: t.help.faq7a },
        { question: t.help.faq8q, answer: t.help.faq8a },
    ];

    return (
        <PageShell
            title={t.help.title}
            description={t.help.description}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Quick Links */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="text-center hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group">
                        <Link href="/book" className="block">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t.help.bookAppointment}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.help.scheduleNextVisit}</p>
                        </Link>
                    </Card>
                    <Card className="text-center hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group">
                        <Link href="/dashboard" className="block">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t.nav.dashboard}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.help.viewAppointments}</p>
                        </Link>
                    </Card>
                    <Card className="text-center hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group">
                        <Link href="/contact" className="block">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                                <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t.help.contactSupport}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t.help.getInTouch}</p>
                        </Link>
                    </Card>
                </div>

                {/* FAQ Section */}
                <Card className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.help.faq}</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <FAQAccordion key={index} item={faq} />
                        ))}
                    </div>
                </Card>

                {/* Still need help */}
                <Card className="text-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-dark-800 dark:to-violet-950/30 border-indigo-100 dark:border-indigo-900/50">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t.help.stillNeedHelp}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        {t.help.cantFind}
                    </p>
                    <Link href="/contact">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {t.help.contactSupport}
                        </button>
                    </Link>
                </Card>
            </div>
        </PageShell>
    );
}
