// app/help/page.tsx
"use client";

import { useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Link from "next/link";

type FAQItem = {
    question: string;
    answer: string;
};

const faqs: FAQItem[] = [
    {
        question: "How do I book an appointment?",
        answer: "To book an appointment, go to the 'Book' page, select your preferred clinic and doctor, choose an available time slot, and complete the payment process. You'll receive a confirmation once your appointment is booked."
    },
    {
        question: "How can I cancel or reschedule an appointment?",
        answer: "You can cancel an appointment from your Dashboard by clicking the 'Cancel' button on the appointment card. For rescheduling, please cancel the current appointment and book a new one. Cancellations must be made at least 24 hours in advance."
    },
    {
        question: "What payment methods are accepted?",
        answer: "We currently accept cash and card payments. Cash payments are made at the clinic on the day of your appointment. Card payments are processed securely through our platform."
    },
    {
        question: "How do I become a doctor on Clinify?",
        answer: "To register as a doctor, click 'Sign up' and select 'Doctor' as your role. Fill in your professional details including specializations and qualifications. Once registered, you can set up your schedule and start accepting appointments."
    },
    {
        question: "How do I set my availability as a doctor?",
        answer: "Go to the 'Doctor Schedule' page from your dashboard. Add your working days, select clinics and rooms, set your working hours, and consultation fee. After saving, click 'Generate Slots' to create bookable time slots for the next 2 weeks."
    },
    {
        question: "What happens if a doctor cancels my appointment?",
        answer: "If a doctor needs to cancel or reschedule due to schedule changes, your appointment will be automatically cancelled and you'll see a notification on your dashboard. You can then book a new appointment at a different time."
    },
    {
        question: "Is my personal information secure?",
        answer: "Yes, we take data security seriously. All personal and medical information is encrypted and stored securely. We never share your data with third parties without your consent. See our Privacy Policy for more details."
    },
    {
        question: "How do I update my profile information?",
        answer: "Go to your Profile page by clicking on your name in the navigation bar. From there, you can update your personal information, contact details, and change your password."
    }
];

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
    return (
        <PageShell
            title="Help Center"
            description="Find answers to common questions and get support"
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
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Book Appointment</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Schedule your next visit</p>
                        </Link>
                    </Card>
                    <Card className="text-center hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group">
                        <Link href="/dashboard" className="block">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Dashboard</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">View your appointments</p>
                        </Link>
                    </Card>
                    <Card className="text-center hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group">
                        <Link href="/contact" className="block">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                                <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Contact Support</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Get in touch with us</p>
                        </Link>
                    </Card>
                </div>

                {/* FAQ Section */}
                <Card className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <FAQAccordion key={index} item={faq} />
                        ))}
                    </div>
                </Card>

                {/* Still need help */}
                <Card className="text-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-dark-800 dark:to-violet-950/30 border-indigo-100 dark:border-indigo-900/50">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Still need help?</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                    </p>
                    <Link href="/contact">
                        <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Contact Support
                        </button>
                    </Link>
                </Card>
            </div>
        </PageShell>
    );
}
