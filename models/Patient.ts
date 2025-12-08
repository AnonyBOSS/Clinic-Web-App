// models/Patient.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IEmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

export interface IInsuranceInfo {
  provider?: string;
  policyNumber?: string;
}

export interface IPatient extends Document {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  insurance?: IInsuranceInfo;
  medical_summary?: string;
  emergency_contact?: IEmergencyContact;
  comparePassword(candidate: string): Promise<boolean>;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relation: { type: String, trim: true }
  },
  { _id: false }
);

const InsuranceInfoSchema = new Schema<IInsuranceInfo>(
  {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true }
  },
  { _id: false }
);

const PatientSchema = new Schema<IPatient>(
  {
    full_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    insurance: { type: InsuranceInfoSchema },
    medical_summary: { type: String, trim: true },
    emergency_contact: { type: EmergencyContactSchema }
  },
  { timestamps: true }
);

// ✅ FIXED: use promise-style hook (NO next argument)
PatientSchema.pre("save", async function (this: IPatient) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method for comparing passwords
PatientSchema.methods.comparePassword = async function (candidate: string) {
  const patient = this as IPatient;
  return bcrypt.compare(candidate, patient.password);
};

export const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
