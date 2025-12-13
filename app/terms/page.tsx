// app/terms/page.tsx
"use client";

import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import { useTranslation } from "@/lib/i18n";

export default function TermsPage() {
    const { t } = useTranslation();

    return (
        <PageShell
            title={t.terms.title}
            description={t.terms.description}
        >
            <Card className="max-w-4xl mx-auto prose prose-slate dark:prose-invert prose-sm">
                <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section1Title}</h2>
                        <p>
                            {t.terms.section1Text}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section2Title}</h2>
                        <p>
                            {t.terms.section2Text}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section3Title}</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.terms.section3Item1}</li>
                            <li>{t.terms.section3Item2}</li>
                            <li>{t.terms.section3Item3}</li>
                            <li>{t.terms.section3Item4}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section4Title}</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.terms.section4Item1}</li>
                            <li>{t.terms.section4Item2}</li>
                            <li>{t.terms.section4Item3}</li>
                            <li>{t.terms.section4Item4}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section5Title}</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.terms.section5Item1}</li>
                            <li>{t.terms.section5Item2}</li>
                            <li>{t.terms.section5Item3}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section6Title}</h2>
                        <p>{t.terms.section6Intro}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.terms.section6Item1}</li>
                            <li>{t.terms.section6Item2}</li>
                            <li>{t.terms.section6Item3}</li>
                            <li>{t.terms.section6Item4}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section7Title}</h2>
                        <p>
                            {t.terms.section7Text}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.terms.section8Title}</h2>
                        <p>
                            {t.terms.section8Text}
                        </p>
                    </section>

                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-dark-700">
                        {t.dateTime.lastUpdated}: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </Card>
        </PageShell>
    );
}
