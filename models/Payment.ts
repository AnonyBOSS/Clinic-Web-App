// models/Payment.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import type { PaymentStatus } from "./Appointment";

export interface IPayment extends Document {
  appointment: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  amount: number;
  method: "CASH" | "CARD";
  transaction_id: string;
  status: PaymentStatus;
  timestamp: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["CASH", "CARD"], required: true },
    transaction_id: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PAID", "REFUNDED", "FAILED"],
      required: true
    },
    timestamp: { type: Date, required: true }
  },
  { timestamps: true }
);

PaymentSchema.index({ timestamp: 1 });
PaymentSchema.index({ doctor: 1, timestamp: 1 });
PaymentSchema.index({ patient: 1, timestamp: 1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
