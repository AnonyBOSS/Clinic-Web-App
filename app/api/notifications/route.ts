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

        const notifications = await Notification.find({
            user: authUser.id,
            userType: authUser.role
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .exec();

        const unreadCount = await Notification.countDocuments({
            user: authUser.id,
            userType: authUser.role,
            read: false
        });

        return NextResponse.json(
            { success: true, data: notifications, unreadCount },
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
        const { notificationIds, markAllRead } = body ?? {};

        if (markAllRead) {
            await Notification.updateMany(
                { user: authUser.id, userType: authUser.role, read: false },
                { read: true }
            );
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
