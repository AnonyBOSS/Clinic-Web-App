// models/Clinic.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  governorate: string;
}

export interface IDoctorSummary {
  doctor: mongoose.Types.ObjectId; // Doctor ref
  full_name: string;
  specializations: string[];
}

export interface IRoomSummary {
  room: mongoose.Types.ObjectId; // Room ref
  room_number: string;
  status: "AVAILABLE" | "MAINTENANCE";
}

export interface IClinic extends Document {
  name: string;
  address: IAddress;
  phone: string;
  operating_hours?: string;
  doctors_summary: IDoctorSummary[];
  rooms_summary: IRoomSummary[];
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    governorate: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const DoctorSummarySchema = new Schema<IDoctorSummary>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    full_name: { type: String, required: true, trim: true },
    specializations: { type: [String], default: [] }
  },
  { _id: false }
);

const RoomSummarySchema = new Schema<IRoomSummary>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    room_number: { type: String, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "MAINTENANCE"],
      default: "AVAILABLE"
    }
  },
  { _id: false }
);

const ClinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: AddressSchema, required: true },
    phone: { type: String, required: true, trim: true },
    operating_hours: { type: String, trim: true },
    doctors_summary: { type: [DoctorSummarySchema], default: [] },
    rooms_summary: { type: [RoomSummarySchema], default: [] }
  },
  { timestamps: true }
);

export const Clinic: Model<IClinic> =
  mongoose.models.Clinic || mongoose.model<IClinic>("Clinic", ClinicSchema);
