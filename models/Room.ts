// models/Room.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type RoomStatus = "AVAILABLE" | "MAINTENANCE";

export interface IRoom extends Document {
  room_number: string;
  type?: string;
  status: RoomStatus;
  clinic: mongoose.Types.ObjectId;
}

const RoomSchema = new Schema<IRoom>(
  {
    room_number: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "MAINTENANCE"],
      default: "AVAILABLE"
    },
    clinic: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true
    }
  },
  { timestamps: true }
);

export const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
