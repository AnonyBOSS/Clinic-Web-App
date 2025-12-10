// app/terms/page.tsx
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function TermsPage() {
    return (
        <PageShell
            title="Terms of Service"
            description="Please read these terms carefully before using Clinify"
        >
            <Card className="max-w-4xl mx-auto prose prose-slate dark:prose-invert prose-sm">
                <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Clinify, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">2. Description of Service</h2>
                        <p>
                            Clinify is a healthcare appointment booking platform that connects patients with healthcare providers. We provide scheduling, reminders, and payment processing services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">3. User Accounts</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>You must provide accurate and complete information when creating an account</li>
                            <li>You are responsible for maintaining the security of your account</li>
                            <li>You must not share your login credentials with others</li>
                            <li>You must notify us immediately of any unauthorized access</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">4. Booking and Cancellation</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Appointments are subject to availability</li>
                            <li>Cancellations must be made at least 24 hours in advance</li>
                            <li>Repeated no-shows may result in account restrictions</li>
                            <li>Healthcare providers reserve the right to reschedule or cancel appointments</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5. Payment Terms</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Consultation fees are set by individual healthcare providers</li>
                            <li>Payments are processed securely through our platform</li>
                            <li>Refunds are subject to our refund policy</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">6. Prohibited Conduct</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Use the service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with or disrupt the service</li>
                            <li>Impersonate any person or entity</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">7. Limitation of Liability</h2>
                        <p>
                            Clinify is a booking platform and does not provide medical advice. We are not responsible for the quality of care provided by healthcare providers on our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">8. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-dark-700">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </Card>
        </PageShell>
    );
}
