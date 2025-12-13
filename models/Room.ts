// models/Room.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoom extends Document {
  clinic: mongoose.Types.ObjectId;
  room_number: string;
  status: "AVAILABLE" | "MAINTENANCE";
}

const RoomSchema = new Schema<IRoom>(
  {
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    room_number: { type: String, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "MAINTENANCE"],
      default: "AVAILABLE"
    }
  },
  { timestamps: true }
);

// Unique room number per clinic
RoomSchema.index({ clinic: 1, room_number: 1 }, { unique: true });
// Index for status-based queries
RoomSchema.index({ status: 1 });

export const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
