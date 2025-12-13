// components/AIChatWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/navigation";

interface Message {
    role: "user" | "assistant";
    content: string;
    quickActions?: string[];
}

export default function AIChatWidget() {
    const { t, language } = useTranslation();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load chat history when widget opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadChatHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function loadChatHistory() {
        setLoadingHistory(true);
        try {
            const res = await fetch("/api/ai/chat", {
                credentials: "include"
            });
            const data = await res.json();
            if (data.success && data.data.messages?.length > 0) {
                setMessages(data.data.messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                    quickActions: m.quickActions
                })));
            }
        } catch {
            // Ignore - start fresh
        } finally {
            setLoadingHistory(false);
        }
    }

    async function clearHistory() {
        try {
            await fetch("/api/ai/chat", {
                method: "DELETE",
                credentials: "include"
            });
            setMessages([]);
        } catch {
            // Ignore
        }
    }

    async function handleSend(messageText?: string) {
        const userMessage = (messageText || input).trim();
        if (!userMessage || loading) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    message: userMessage,
                    language
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: data.data.message,
                    quickActions: data.data.quickActions
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: data.error || t.errors.somethingWentWrong
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: t.errors.networkError
            }]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleQuickAction(action: string) {
        // Map quick actions to navigation or send as message
        const actionLower = action.toLowerCase();
        const actionMap: { [key: string]: string } = {
            "book appointment": "/book",
            "book an appointment": "/book",
            "احجز موعد": "/book",
            "view my appointments": "/dashboard",
            "عرض مواعيدي": "/dashboard",
            "check symptoms": "/symptom-checker",
            "فحص الأعراض": "/symptom-checker",
            "find a specialist": "/symptom-checker",
            "ابحث عن متخصص": "/symptom-checker",
            "contact support": "/contact",
            "اتصل بالدعم": "/contact",
            "get help": "/help",
            "المساعدة": "/help"
        };

        // Check if it's a navigation action
        for (const [key, path] of Object.entries(actionMap)) {
            if (actionLower.includes(key.toLowerCase()) || action.includes(key)) {
                router.push(path);
                setIsOpen(false);
                return;
            }
        }

        // Check if it's a "Book with Dr. X" action
        if (actionLower.includes("book with dr.") || action.includes("احجز مع د.")) {
            router.push("/book");
            setIsOpen(false);
            return;
        }

        // Otherwise, send as a message
        handleSend(action);
    }

    // Initial quick actions (shown when no messages)
    const initialQuickActions = language === "ar" ? [
        "كيف أحجز موعد؟",
        "ما هي مواعيدي القادمة؟",
        "أي طبيب مناسب لحالتي؟",
        "كيف أتواصل مع طبيبي؟"
    ] : [
        "How do I book an appointment?",
        "What are my upcoming appointments?",
        "Which doctor is right for me?",
        "How do I message my doctor?"
    ];

    // Get the last assistant message's quick actions
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");
    const currentQuickActions = lastAssistantMessage?.quickActions || [];

    return (
        <>
            {/* Floating Button - hidden on mobile when chat is open */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center ${isOpen ? 'hidden sm:flex' : 'flex'}`}
                aria-label={t.ai.clinicAssistant}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed z-50 bg-white dark:bg-dark-800 shadow-2xl border border-slate-200 dark:border-dark-600 overflow-hidden animate-scale-in
                    bottom-0 right-0 left-0 top-0
                    sm:bottom-24 sm:right-6 sm:left-auto sm:top-auto sm:w-96 sm:max-w-[calc(100vw-3rem)] sm:rounded-2xl sm:max-h-[calc(100vh-8rem)]
                    flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xl">🤖</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white">{t.ai.clinicAssistant}</h3>
                            <p className="text-xs text-white/80">{t.ai.poweredByAI}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    className="text-white/60 hover:text-white transition text-xs"
                                    title={language === "ar" ? "مسح المحادثة" : "Clear chat"}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 sm:h-80 sm:flex-none">
                        {loadingHistory ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                    <span className="text-3xl">👋</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
                                    {t.ai.howCanIHelp}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                                    {language === "ar"
                                        ? "اختر سؤالاً أو اكتب رسالتك"
                                        : "Choose a question or type your message"}
                                </p>
                                <div className="space-y-2">
                                    {initialQuickActions.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(action)}
                                            disabled={loading}
                                            className="block w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-700 dark:text-slate-300 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 transition disabled:opacity-50 border border-slate-200 dark:border-dark-600"
                                        >
                                            💬 {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <div key={i}>
                                        <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user"
                                                    ? "bg-indigo-600 text-white rounded-br-md"
                                                    : "bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-200 rounded-bl-md"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                        {/* Quick Actions after assistant messages */}
                                        {msg.role === "assistant" && msg.quickActions && msg.quickActions.length > 0 && i === messages.length - 1 && (
                                            <div className="flex flex-wrap gap-2 mt-2 pl-2">
                                                {msg.quickActions.map((action, j) => (
                                                    <button
                                                        key={j}
                                                        onClick={() => handleQuickAction(action)}
                                                        disabled={loading}
                                                        className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition disabled:opacity-50 border border-indigo-200 dark:border-indigo-800"
                                                    >
                                                        {action}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 dark:bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-md">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 dark:border-dark-600 bg-slate-50 dark:bg-dark-900/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t.messages.typeMessage}
                                className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                disabled={loading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
