// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./../styles/globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import AIChatWidget from "@/components/AIChatWidget";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Clinify — Smart Clinic Booking",
    template: "%s | Clinify",
  },
  description:
    "Book clinic appointments instantly. Browse doctors by specialization, check AI-powered symptom analysis, and manage your health — all in one platform.",
  keywords: [
    "clinic booking",
    "doctor appointment",
    "healthcare",
    "medical",
    "symptom checker",
    "Clinify",
  ],
  openGraph: {
    title: "Clinify — Smart Clinic Booking",
    description:
      "Book clinic appointments instantly. AI-powered symptom analysis, doctor search, and appointment management.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <LanguageProvider>
          <ThemeProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="border-t border-slate-200 dark:border-dark-700 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              <p>© {new Date().getFullYear()} Clinify. All rights reserved.</p>
            </footer>
            <AIChatWidget />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
