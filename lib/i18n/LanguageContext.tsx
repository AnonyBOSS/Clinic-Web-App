// lib/i18n/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language } from "./translations";

// Create a union type for both translation types
type TranslationType = typeof translations.en | typeof translations.ar;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationType;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "clinify-language";

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    // Load saved language preference
    useEffect(() => {
        const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
        if (saved && (saved === "en" || saved === "ar")) {
            setLanguageState(saved);
        }
        setMounted(true);
    }, []);

    // Update document direction and language
    useEffect(() => {
        if (!mounted) return;

        document.documentElement.lang = language;
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

        // Add/remove RTL class for styling
        if (language === "ar") {
            document.documentElement.classList.add("rtl");
        } else {
            document.documentElement.classList.remove("rtl");
        }
    }, [language, mounted]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LANGUAGE_KEY, lang);
    };

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: translations[language],
        isRTL: language === "ar",
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <LanguageContext.Provider value={{ ...value, language: "en", t: translations.en, isRTL: false }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

// Hook for easy translation access
export function useTranslation() {
    const { t, language, isRTL } = useLanguage();
    return { t, language, isRTL };
}
