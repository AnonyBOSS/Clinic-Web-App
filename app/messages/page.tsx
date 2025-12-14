// app/messages/page.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import Card from "@/components/Card";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { useTranslation } from "@/lib/i18n";

type Conversation = {
    userId: string;
    userType: "PATIENT" | "DOCTOR";
    userName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
};

type MessageItem = {
    _id: string;
    sender: string;
    senderType: "PATIENT" | "DOCTOR";
    receiver: string;
    receiverType: "PATIENT" | "DOCTOR";
    content: string;
    read: boolean;
    createdAt: string;
};

type CurrentUser = {
    id: string;
    full_name: string;
    role: "PATIENT" | "DOCTOR";
};

type ContactOption = {
    id: string;
    name: string;
    type: "PATIENT" | "DOCTOR";
};

function MessagesContent() {
    const searchParams = useSearchParams();
    const chatWithId = searchParams.get("chat");
    const { t } = useTranslation();

    const [user, setUser] = useState<CurrentUser | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const [contacts, setContacts] = useState<ContactOption[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function load() {
            try {
                const meRes = await fetch("/api/auth/me", { credentials: "include" });
                if (!meRes.ok) {
                    setLoading(false);
                    return;
                }
                const meData = await meRes.json();
                setUser(meData.data);

                const convRes = await fetch("/api/messages", { credentials: "include" });
                if (convRes.ok) {
                    const convData = await convRes.json();
                    const convList = convData.data || [];
                    setConversations(convList);

                    // Auto-select conversation if chat param is present
                    if (chatWithId) {
                        const existingConv = convList.find((c: Conversation) => c.userId === chatWithId);
                        if (existingConv) {
                            setSelectedConversation(existingConv);
                        } else {
                            // Try to load contact info and create new conversation entry
                            const contactsRes = await fetch("/api/messages/contacts", { credentials: "include" });
                            if (contactsRes.ok) {
                                const contactsData = await contactsRes.json();
                                const contact = (contactsData.data || []).find((c: ContactOption) => c.id === chatWithId);
                                if (contact) {
                                    const newConv: Conversation = {
                                        userId: contact.id,
                                        userType: contact.type,
                                        userName: contact.name,
                                        lastMessage: "",
                                        lastMessageTime: new Date().toISOString(),
                                        unreadCount: 0
                                    };
                                    setConversations(prev => [newConv, ...prev]);
                                    setSelectedConversation(newConv);
                                }
                            }
                        }
                    }
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [chatWithId]);

    useEffect(() => {
        if (selectedConversation) {
            // Clear old messages immediately when switching chats
            setMessages([]);
            // Initial load - mark notifications as read
            loadMessages(selectedConversation.userId, true);
        } else {
            setMessages([]);
        }
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Use ref to track current conversation to prevent race conditions
    const currentConversationIdRef = useRef<string | null>(null);

    // Keep ref in sync with selected conversation
    useEffect(() => {
        currentConversationIdRef.current = selectedConversation?.userId || null;
    }, [selectedConversation]);

    // Auto-refresh messages every 0.5 seconds when a conversation is selected
    useEffect(() => {
        if (!selectedConversation) return;

        const intervalId = setInterval(() => {
            // Polling - don't mark notifications (already marked on selection)
            loadMessages(selectedConversation.userId, false);
        }, 500);

        return () => clearInterval(intervalId);
    }, [selectedConversation]);

    // Auto-refresh conversations list every 10 seconds
    useEffect(() => {
        if (!user) return;

        const intervalId = setInterval(async () => {
            try {
                const convRes = await fetch("/api/messages", { credentials: "include" });
                if (convRes.ok) {
                    const convData = await convRes.json();
                    setConversations(convData.data || []);
                }
            } catch {
                // ignore
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, [user]);

    async function loadMessages(userId: string, shouldMarkNotifications: boolean = false) {
        try {
            const res = await fetch(`/api/messages?withUser=${userId}`, {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                const fetchedMessages = data.data || [];

                // Only update if this is still the current conversation
                // This prevents race conditions when switching chats quickly
                if (currentConversationIdRef.current === userId) {
                    setMessages(fetchedMessages);
                }

                // Reset unread count for this conversation since messages are now marked as read
                setConversations(prev =>
                    prev.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c)
                );

                // Mark notifications from this sender as read (only on initial load, not polling)
                if (shouldMarkNotifications) {
                    markSenderNotificationsRead(userId);
                }
            }
        } catch {
            // ignore
        }
    }

    // Mark message notifications from a specific sender as read
    async function markSenderNotificationsRead(senderId: string) {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    markSenderMessagesRead: { senderId }
                })
            });
        } catch {
            // ignore - non-critical
        }
    }

    async function loadContacts() {
        if (!user) return;
        setLoadingContacts(true);
        try {
            const res = await fetch("/api/messages/contacts", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setContacts(data.data || []);
            }
        } catch {
            // ignore
        } finally {
            setLoadingContacts(false);
        }
    }

    function handleNewChat() {
        setShowNewChat(true);
        loadContacts();
    }

    function startConversation(contact: ContactOption) {
        // Check if conversation exists
        const existing = conversations.find(c => c.userId === contact.id);
        if (existing) {
            setSelectedConversation(existing);
        } else {
            // Create new conversation entry
            const newConv: Conversation = {
                userId: contact.id,
                userType: contact.type,
                userName: contact.name,
                lastMessage: "",
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0
            };
            setConversations(prev => [newConv, ...prev]);
            setSelectedConversation(newConv);
        }
        setShowNewChat(false);
    }

    async function sendMessage() {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        setSending(true);
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: selectedConversation.userId,
                    receiverType: selectedConversation.userType,
                    content: newMessage.trim()
                })
            });

            if (res.ok) {
                setNewMessage("");

                // Update conversation list
                setConversations(prev =>
                    prev.map(c =>
                        c.userId === selectedConversation.userId
                            ? { ...c, lastMessage: newMessage.trim(), lastMessageTime: new Date().toISOString() }
                            : c
                    )
                );

                // Immediately fetch to show the sent message
                await loadMessages(selectedConversation.userId);
            }
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    }

    function formatTime(dateStr: string) {
        const d = new Date(dateStr);
        return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }

    function formatDate(dateStr: string) {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return t.dateTime.today;
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }

    if (loading) {
        return (
            <PageShell title={t.messages.title}>
                <LoadingSpinner />
            </PageShell>
        );
    }

    if (!user) {
        return (
            <PageShell title={t.messages.title} description={t.errors.unauthorized}>
                <EmptyState title={t.errors.unauthorized} description={t.nav.login} />
            </PageShell>
        );
    }

    return (
        <PageShell title={t.messages.title} description={t.messages.conversations}>
            <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-220px)] min-h-[500px]">
                {/* Conversations list */}
                <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-600 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {t.messages.conversations}
                        </h2>
                        <Button size="xs" variant="ghost" onClick={handleNewChat}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t.common.new}
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {showNewChat ? (
                            <div className="p-4 space-y-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {t.common.startNewConversation}
                                    </span>
                                    <button
                                        onClick={() => setShowNewChat(false)}
                                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        {t.common.cancel}
                                    </button>
                                </div>
                                {loadingContacts ? (
                                    <div className="py-4 text-center">
                                        <LoadingSpinner />
                                    </div>
                                ) : contacts.length === 0 ? (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                                        {user.role === "PATIENT"
                                            ? t.common.bookToMessage
                                            : t.common.noPatientsYet}
                                    </p>
                                ) : (
                                    contacts.map((contact) => (
                                        <button
                                            key={contact.id}
                                            onClick={() => startConversation(contact)}
                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {contact.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {contact.type === "DOCTOR" ? t.common.doctor : t.common.patient}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                <p>{t.common.noConversationsYet}</p>
                                <button
                                    onClick={handleNewChat}
                                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
                                >
                                    {t.common.startNewConversation}
                                </button>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.userId}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors ${selectedConversation?.userId === conv.userId
                                        ? "bg-indigo-50 dark:bg-indigo-900/20"
                                        : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                            {conv.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {conv.userName}
                                                </span>
                                                {conv.lastMessageTime && (
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                        {formatDate(conv.lastMessageTime)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {conv.lastMessage || t.common.startChatting}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="flex-shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Chat area */}
                <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat header */}
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-600 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {selectedConversation.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {selectedConversation.userName}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {selectedConversation.userType === "DOCTOR" ? t.common.doctor : t.common.patient}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 && (
                                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
                                        {t.common.sayHello}
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMe = msg.sender === user.id;
                                    return (
                                        <div
                                            key={msg._id}
                                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                                    ? "bg-indigo-600 text-white rounded-br-md"
                                                    : "bg-slate-100 dark:bg-dark-700 text-slate-900 dark:text-white rounded-bl-md"
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p
                                                    className={`text-[10px] mt-1 ${isMe ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"
                                                        }`}
                                                >
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            <div className="px-4 py-3 border-t border-slate-100 dark:border-dark-600">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                        placeholder={t.messages.typeMessage}
                                        className="flex-1 px-4 py-2 text-sm rounded-full border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <Button
                                        onClick={sendMessage}
                                        isLoading={sending}
                                        disabled={!newMessage.trim()}
                                        className="rounded-full px-5"
                                    >
                                        {t.messages.send}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <EmptyState
                                title={t.common.selectConversation}
                                description={t.common.chooseFromList}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </PageShell>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<PageShell title="Messages"><LoadingSpinner /></PageShell>}>
            <MessagesContent />
        </Suspense>
    );
}
