// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Notification } from "@/models/Notification";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Not authenticated." },
                { status: 401 }
            );
        }

        const rawNotifications = await Notification.find({
            user: authUser.id,
            userType: authUser.role
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .exec();

        // Consolidate NEW_MESSAGE notifications - keep only the newest per sender
        // First pass: count messages per sender
        const messageCounts = new Map<string, number>();
        for (const n of rawNotifications as any[]) {
            if (n.type === "NEW_MESSAGE") {
                let senderKey = n.metadata?.senderId;
                if (!senderKey && n.message) {
                    const match = n.message.match(/from\s+(.+)$/i);
                    if (match) {
                        senderKey = match[1].trim().toLowerCase();
                    }
                }
                if (senderKey) {
                    messageCounts.set(senderKey, (messageCounts.get(senderKey) || 0) + 1);
                }
            }
        }

        // Second pass: filter and update message text
        const seenMessageSenders = new Set<string>();
        const notifications = rawNotifications.filter((n: any) => {
            if (n.type === "NEW_MESSAGE") {
                let senderKey = n.metadata?.senderId;
                let senderName = "";

                if (!senderKey && n.message) {
                    const match = n.message.match(/from\s+(.+)$/i);
                    if (match) {
                        senderName = match[1].trim();
                        senderKey = senderName.toLowerCase();
                    }
                }

                if (senderKey && seenMessageSenders.has(senderKey)) {
                    return false; // Skip - already have a newer notification from this sender
                }

                if (senderKey) {
                    seenMessageSenders.add(senderKey);

                    // Get the count for this sender
                    const count = messageCounts.get(senderKey) || 1;

                    // Add messageCount to the notification object
                    n._doc = n._doc || {};
                    n._doc.messageCount = count;

                    // Update message to plural if there are multiple messages
                    if (count > 1 && n.message) {
                        // Extract sender name for the updated message
                        const nameMatch = n.message.match(/from\s+(.+)$/i);
                        if (nameMatch) {
                            n.message = `New messages from ${nameMatch[1]}`;
                        }
                    }
                }
            }
            return true;
        }).slice(0, 20); // Limit to 20 after consolidation

        // Transform notifications to include messageCount in response
        const transformedNotifications = notifications.map((n: any) => {
            const obj = n.toObject ? n.toObject() : n;
            return {
                ...obj,
                messageCount: n._doc?.messageCount || 1
            };
        });

        const unreadCount = await Notification.countDocuments({
            user: authUser.id,
            userType: authUser.role,
            read: false
        });

        return NextResponse.json(
            { success: true, data: transformedNotifications, unreadCount },
            { status: 200 }
        );
    } catch (error) {
        console.error("[NOTIFICATIONS_GET_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const authUser = getAuthUserFromRequest(req);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: "Not authenticated." },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => null);
        const { notificationIds, markAllRead, markSenderMessagesRead } = body ?? {};

        if (markAllRead) {
            await Notification.updateMany(
                { user: authUser.id, userType: authUser.role, read: false },
                { read: true }
            );
        } else if (markSenderMessagesRead) {
            // Mark all NEW_MESSAGE notifications from this sender as read
            // Match by sender ID in metadata OR by sender name in message
            const senderId = markSenderMessagesRead.senderId;
            const senderName = markSenderMessagesRead.senderName;

            const orConditions: any[] = [];
            if (senderId) {
                orConditions.push({ "metadata.senderId": senderId });
            }
            if (senderName) {
                orConditions.push({ message: new RegExp(`from\\s+${senderName}\\s*$`, "i") });
            }

            if (orConditions.length > 0) {
                await Notification.updateMany(
                    {
                        user: authUser.id,
                        userType: authUser.role,
                        type: "NEW_MESSAGE",
                        read: false,
                        $or: orConditions
                    },
                    { read: true }
                );
            }
        } else if (notificationIds && Array.isArray(notificationIds)) {
            await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    user: authUser.id,
                    userType: authUser.role
                },
                { read: true }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[NOTIFICATIONS_PATCH_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
