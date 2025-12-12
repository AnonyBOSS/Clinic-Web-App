// components/NotificationBell.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

type NotificationItem = {
    _id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
    metadata?: { senderId?: string; senderType?: string };
    messageCount?: number; // Number of consolidated messages (for NEW_MESSAGE type)
};

export default function NotificationBell() {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/notifications", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.data || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }

    async function markAllRead() {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAllRead: true })
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch {
            // ignore
        }
    }

    async function handleNotificationClick(notification: NotificationItem) {
        // Mark notification(s) as read
        if (!notification.read) {
            try {
                // For NEW_MESSAGE notifications, mark ALL messages from this sender as read
                if (notification.type === "NEW_MESSAGE") {
                    // Extract sender name from message
                    const nameMatch = notification.message.match(/from\s+(.+)$/i);
                    const senderName = nameMatch ? nameMatch[1].trim() : undefined;

                    await fetch("/api/notifications", {
                        method: "PATCH",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            markSenderMessagesRead: {
                                senderId: notification.metadata?.senderId,
                                senderName: senderName
                            }
                        })
                    });
                } else {
                    // For other notifications, mark just this one as read
                    await fetch("/api/notifications", {
                        method: "PATCH",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ notificationIds: [notification._id] })
                    });
                }

                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
                );
                // Decrement by messageCount for consolidated notifications
                const decrementBy = notification.messageCount || 1;
                setUnreadCount(prev => Math.max(0, prev - decrementBy));
            } catch {
                // ignore
            }
        }

        setOpen(false);

        // Navigate based on notification type - use window.location for reliable navigation
        if (notification.type === "NEW_MESSAGE") {
            // Navigate to messages - use senderId if available, otherwise just go to messages
            if (notification.metadata?.senderId) {
                window.location.href = `/messages?chat=${notification.metadata.senderId}`;
            } else {
                window.location.href = "/messages";
            }
        } else if (notification.type === "AUTO_CANCEL" || notification.type === "REMINDER_TODAY" || notification.type === "REMINDER_HOUR") {
            // Navigate to dashboard for appointment-related notifications
            window.location.href = "/dashboard";
        }
    }

    function formatTime(dateStr: string) {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return d.toLocaleDateString();
    }

    function getIcon(type: string) {
        switch (type) {
            case "AUTO_CANCEL":
                return (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </span>
                );
            case "REMINDER_TODAY":
            case "REMINDER_HOUR":
                return (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                );
            case "NEW_MESSAGE":
                return (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </span>
                );
            default:
                return (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </span>
                );
        }
    }

    if (loading) {
        return (
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-dark-800 animate-pulse" />
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 
          bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700
          text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900"
                aria-label="Notifications"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-dark-800 shadow-xl border border-slate-200 dark:border-dark-600 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-600">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t.nav.notifications}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {t.common.markAllRead}
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                {t.nav.noNotifications}
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-dark-700 last:border-0 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                                        }`}
                                >
                                    {getIcon(n.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 dark:text-slate-200 break-words">
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {formatTime(n.createdAt)}
                                        </p>
                                    </div>
                                    {!n.read && (
                                        <span className="h-2 w-2 rounded-full bg-indigo-500 mt-2" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
