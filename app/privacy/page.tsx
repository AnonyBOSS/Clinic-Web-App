// app/privacy/page.tsx
"use client";

import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import { useTranslation } from "@/lib/i18n";

export default function PrivacyPage() {
    const { t } = useTranslation();

    return (
        <PageShell
            title={t.privacy.title}
            description={t.privacy.description}
        >
            <Card className="max-w-4xl mx-auto prose prose-slate dark:prose-invert prose-sm">
                <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.privacy.section1Title}</h2>
                        <p>{t.privacy.section1Intro}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.privacy.section1Item1}</li>
                            <li>{t.privacy.section1Item2}</li>
                            <li>{t.privacy.section1Item3}</li>
                            <li>{t.privacy.section1Item4}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.privacy.section2Title}</h2>
                        <p>{t.privacy.section2Intro}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.privacy.section2Item1}</li>
                            <li>{t.privacy.section2Item2}</li>
                            <li>{t.privacy.section2Item3}</li>
                            <li>{t.privacy.section2Item4}</li>
                            <li>{t.privacy.section2Item5}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.privacy.section3Title}</h2>
                        <p>
                            {t.privacy.section3Intro}
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.privacy.section3Item1}</li>
                            <li>{t.privacy.section3Item2}</li>
                            <li>{t.privacy.section3Item3}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.privacy.section4Title}</h2>
                        <p>
                            {t.privacy.section4Text}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.privacy.section5Title}</h2>
                        <p>{t.privacy.section5Intro}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>{t.privacy.section5Item1}</li>
                            <li>{t.privacy.section5Item2}</li>
                            <li>{t.privacy.section5Item3}</li>
                            <li>{t.privacy.section5Item4}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.privacy.section6Title}</h2>
                        <p>
                            {t.privacy.section6Text}{" "}
                            <a href="mailto:privacy@clinify.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                privacy@clinify.com
                            </a>
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
