// models/Notification.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType = "AUTO_CANCEL" | "REMINDER_TODAY" | "REMINDER_HOUR" | "NEW_MESSAGE";

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    userType: "PATIENT" | "DOCTOR";
    type: NotificationType;
    message: string;
    appointment?: mongoose.Types.ObjectId;
    metadata?: { senderId?: string; senderType?: string };
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        user: { type: Schema.Types.ObjectId, required: true, refPath: "userType" },
        userType: { type: String, enum: ["PATIENT", "DOCTOR"], required: true },
        type: {
            type: String,
            enum: ["AUTO_CANCEL", "REMINDER_TODAY", "REMINDER_HOUR", "NEW_MESSAGE"],
            required: true
        },
        message: { type: String, required: true },
        appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
        metadata: { type: Schema.Types.Mixed },
        read: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Indexes for fast queries
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, userType: 1 });

export const Notification: Model<INotification> =
    mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", NotificationSchema);
