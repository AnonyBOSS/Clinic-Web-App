// models/ChatHistory.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    quickActions?: string[]; // Suggested quick actions from assistant
}

export interface IChatHistory extends Document {
    user: mongoose.Types.ObjectId;
    userType: "PATIENT" | "DOCTOR";
    messages: IChatMessage[];
    language: "en" | "ar";
    lastActivity: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        quickActions: [{ type: String }]
    },
    { _id: false }
);

const ChatHistorySchema = new Schema<IChatHistory>(
    {
        user: { type: Schema.Types.ObjectId, required: true, refPath: "userType" },
        userType: { type: String, enum: ["PATIENT", "DOCTOR"], required: true },
        messages: [ChatMessageSchema],
        language: { type: String, enum: ["en", "ar"], default: "en" },
        lastActivity: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

// Index for quick lookup
ChatHistorySchema.index({ user: 1, userType: 1 });

// Keep only last 50 messages per user
ChatHistorySchema.pre("save", function (next) {
    if (this.messages.length > 50) {
        this.messages = this.messages.slice(-50);
    }
    next();
});

export const ChatHistory: Model<IChatHistory> =
    mongoose.models.ChatHistory ||
    mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
