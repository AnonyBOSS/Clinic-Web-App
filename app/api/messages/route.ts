// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connection";
import { getAuthUserFromRequest } from "@/lib/auth-request";
import { Message } from "@/models/Message";
import { Notification } from "@/models/Notification";
import { Doctor } from "@/models/Doctor";
import { Patient } from "@/models/Patient";
import { Appointment } from "@/models/Appointment";

// GET: Fetch conversation with a specific user
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

        const { searchParams } = new URL(req.url);
        const withUserId = searchParams.get("withUser");

        // Convert to ObjectId for MongoDB queries
        const userObjectId = new mongoose.Types.ObjectId(authUser.id);

        if (withUserId) {
            const withUserObjectId = new mongoose.Types.ObjectId(withUserId);

            // Fetch conversation with specific user
            const messages = await Message.find({
                $or: [
                    { sender: userObjectId, receiver: withUserObjectId },
                    { sender: withUserObjectId, receiver: userObjectId }
                ]
            })
                .sort({ createdAt: 1 })
                .limit(100)
                .exec();

            // Mark messages as read
            await Message.updateMany(
                { sender: withUserObjectId, receiver: userObjectId, read: false },
                { read: true }
            );

            return NextResponse.json(
                { success: true, data: messages },
                { status: 200 }
            );
        }

        // Fetch list of conversations (unique users)
        const sentMessages = await Message.aggregate([
            { $match: { sender: userObjectId } },
            { $group: { _id: "$receiver", lastMessage: { $last: "$$ROOT" } } }
        ]);

        const receivedMessages = await Message.aggregate([
            { $match: { receiver: userObjectId } },
            { $group: { _id: "$sender", lastMessage: { $last: "$$ROOT" } } }
        ]);

        // Merge conversations
        const conversationMap = new Map<string, any>();

        for (const msg of [...sentMessages, ...receivedMessages]) {
            const oderId = msg._id.toString();
            const existing = conversationMap.get(oderId);
            if (!existing || new Date(msg.lastMessage.createdAt) > new Date(existing.lastMessage.createdAt)) {
                conversationMap.set(oderId, msg);
            }
        }

        // Get user details for each conversation
        const conversations = [];
        for (const [oderId, data] of conversationMap) {
            const otherUserObjectId = new mongoose.Types.ObjectId(oderId);
            const unreadCount = await Message.countDocuments({
                sender: otherUserObjectId,
                receiver: userObjectId,
                read: false
            });

            // Try to find as Doctor first, then Patient
            let otherUser: { full_name: string; email: string } | null =
                await Doctor.findById(oderId).select("full_name email").lean() as { full_name: string; email: string } | null;
            let otherUserType = "DOCTOR";

            if (!otherUser) {
                otherUser = await Patient.findById(oderId).select("full_name email").lean() as { full_name: string; email: string } | null;
                otherUserType = "PATIENT";
            }

            if (otherUser) {
                conversations.push({
                    userId: oderId,
                    userType: otherUserType,
                    userName: (otherUser as any).full_name,
                    lastMessage: data.lastMessage.content,
                    lastMessageTime: data.lastMessage.createdAt,
                    unreadCount
                });
            }
        }

        // Sort by last message time
        conversations.sort((a, b) =>
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );

        return NextResponse.json(
            { success: true, data: conversations },
            { status: 200 }
        );
    } catch (error) {
        console.error("[MESSAGES_GET_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}

// POST: Send a message
export async function POST(req: NextRequest) {
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
        const { receiverId, receiverType, content } = body ?? {};

        if (!receiverId || !receiverType || !content?.trim()) {
            return NextResponse.json(
                { success: false, error: "receiverId, receiverType, and content are required." },
                { status: 400 }
            );
        }

        // Validate that user can only message people they have appointments with
        const appointmentFilter = authUser.role === "PATIENT"
            ? { patient: authUser.id, doctor: receiverId }
            : { doctor: authUser.id, patient: receiverId };

        const hasAppointment = await Appointment.exists(appointmentFilter);
        if (!hasAppointment) {
            return NextResponse.json(
                { success: false, error: "You can only message users you have appointments with." },
                { status: 403 }
            );
        }

        const message = await Message.create({
            sender: authUser.id,
            senderType: authUser.role,
            receiver: receiverId,
            receiverType,
            content: content.trim()
        });

        // Create notification for receiver with sender info for navigation
        const senderName = authUser.role === "DOCTOR"
            ? (await Doctor.findById(authUser.id).select("full_name").lean())?.full_name
            : (await Patient.findById(authUser.id).select("full_name").lean())?.full_name;

        await Notification.create({
            user: receiverId,
            userType: receiverType,
            type: "NEW_MESSAGE",
            message: `New message from ${senderName || "Someone"}`,
            metadata: { senderId: authUser.id, senderType: authUser.role }
        });

        return NextResponse.json(
            { success: true, data: message },
            { status: 201 }
        );
    } catch (error) {
        console.error("[MESSAGES_POST_ERROR]", error);
        return NextResponse.json(
            { success: false, error: "Internal server error." },
            { status: 500 }
        );
    }
}
