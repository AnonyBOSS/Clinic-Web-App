// models/Slot.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type SlotStatus = "AVAILABLE" | "BOOKED";

export interface ISlot extends Document {
  doctor: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  status: SlotStatus;
}

const SlotSchema = new Schema<ISlot>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    date: { type: String, required: true }, // validated at app level
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED"],
      default: "AVAILABLE"
    }
  },
  { timestamps: true }
);

SlotSchema.index(
  { doctor: 1, clinic: 1, room: 1, date: 1, time: 1 },
  { unique: true }
); // no duplicate time slots for same doctor/room/clinic

// Index for availability queries
SlotSchema.index({ doctor: 1, date: 1, status: 1 });

export const Slot: Model<ISlot> =
  mongoose.models.Slot || mongoose.model<ISlot>("Slot", SlotSchema);
