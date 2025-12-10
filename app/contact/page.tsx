// app/contact/page.tsx
"use client";

import { FormEvent, useState } from "react";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        // In a real app, this would send to an API
        setSubmitted(true);
    }

    return (
        <PageShell
            title="Contact Us"
            description="We'd love to hear from you. Get in touch with our team."
        >
            <div className="max-w-4xl mx-auto grid gap-8 lg:grid-cols-2">
                {/* Contact Form */}
                <Card className="space-y-6">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                            </p>
                            <Button
                                className="mt-4"
                                variant="outline"
                                size="sm"
                                onClick={() => setSubmitted(false)}
                            >
                                Send another message
                            </Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Send us a message</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Name</label>
                                        <Input
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
                                        <Input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Subject</label>
                                    <Input
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Message</label>
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell us more about your inquiry..."
                                        rows={5}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Send Message
                                </Button>
                            </form>
                        </>
                    )}
                </Card>

                {/* Contact Info */}
                <div className="space-y-6">
                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Information</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Email</p>
                                    <a href="mailto:support@clinify.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        support@clinify.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Phone</p>
                                    <a href="tel:+201234567890" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        +20 123 456 7890
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Address</p>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        123 Healthcare Avenue<br />
                                        Cairo, Egypt
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Business Hours</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-300">Monday - Friday</span>
                                <span className="font-medium text-slate-900 dark:text-white">9:00 AM - 6:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-300">Saturday</span>
                                <span className="font-medium text-slate-900 dark:text-white">10:00 AM - 4:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-300">Sunday</span>
                                <span className="font-medium text-slate-900 dark:text-white">Closed</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </PageShell>
    );
}
