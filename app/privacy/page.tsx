// app/privacy/page.tsx
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";

export default function PrivacyPage() {
    return (
        <PageShell
            title="Privacy Policy"
            description="How we handle and protect your data"
        >
            <Card className="max-w-4xl mx-auto prose prose-slate dark:prose-invert prose-sm">
                <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Name, email address, and phone number when you create an account</li>
                            <li>Appointment booking details and medical preferences</li>
                            <li>Communication records when you contact us for support</li>
                            <li>Payment information when you complete transactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process appointments and payments</li>
                            <li>Send you appointment reminders and updates</li>
                            <li>Respond to your inquiries and provide customer support</li>
                            <li>Protect against fraudulent or illegal activity</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">3. Information Sharing</h2>
                        <p>
                            We do not sell your personal information. We may share your information with:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Healthcare providers you book appointments with</li>
                            <li>Service providers who assist in our operations</li>
                            <li>Legal authorities when required by law</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">4. Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">5. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at{" "}
                            <a href="mailto:privacy@clinify.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                privacy@clinify.com
                            </a>
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
