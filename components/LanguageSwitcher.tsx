// components/LanguageSwitcher.tsx
"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            aria-label={language === "en" ? "Switch to Arabic" : "Switch to English"}
        >
            <span className="text-base">
                {language === "en" ? "🇪🇬" : "🇺🇸"}
            </span>
            <span className="hidden sm:inline text-xs">
                {language === "en" ? "العربية" : "English"}
            </span>
        </button>
    );
}
