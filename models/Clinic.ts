// models/Clinic.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClinic extends Document {
  name: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    governorate?: string;
  };
  operating_hours?: string;
}

const ClinicSchema = new Schema<IClinic>({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: {
    street: String,
    city: String,
    governorate: String,
  },
  operating_hours: String,
});

export const Clinic: Model<IClinic> =
  mongoose.models.Clinic || mongoose.model<IClinic>("Clinic", ClinicSchema);
