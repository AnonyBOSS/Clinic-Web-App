// app/layout.tsx
import type { Metadata } from "next";
import "./../styles/globals.css";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Clinify",
  description: "Smart clinic appointment booking for patients and doctors."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
