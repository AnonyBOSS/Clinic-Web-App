// models/Appointment.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type PaymentStatus = "PAID" | "REFUNDED" | "FAILED";

export interface IEmbeddedPayment {
  amount: number;
  method: "CASH" | "CARD";
  transaction_id: string;
  status: PaymentStatus;
  timestamp: Date;
}

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  slot: mongoose.Types.ObjectId;
  status: AppointmentStatus;
  notes?: string;
  payment: IEmbeddedPayment; // mandatory embedded payment
}

const EmbeddedPaymentSchema = new Schema<IEmbeddedPayment>(
  {
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
  { _id: false }
);

const AppointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    slot: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    status: {
      type: String,
      enum: ["BOOKED", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "BOOKED"
    },
    notes: { type: String, trim: true },
    payment: { type: EmbeddedPaymentSchema, required: true }
  },
  { timestamps: true }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
