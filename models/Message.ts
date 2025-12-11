// models/Message.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    senderType: "PATIENT" | "DOCTOR";
    receiver: mongoose.Types.ObjectId;
    receiverType: "PATIENT" | "DOCTOR";
    content: string;
    read: boolean;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        sender: { type: Schema.Types.ObjectId, required: true },
        senderType: { type: String, enum: ["PATIENT", "DOCTOR"], required: true },
        receiver: { type: Schema.Types.ObjectId, required: true },
        receiverType: { type: String, enum: ["PATIENT", "DOCTOR"], required: true },
        content: { type: String, required: true, trim: true },
        read: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Indexes for conversation queries
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, read: 1 });

export const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
