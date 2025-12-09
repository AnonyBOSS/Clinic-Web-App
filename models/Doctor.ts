// models/Doctor.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IScheduleDay {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  clinic: mongoose.Types.ObjectId; // Clinic where this schedule applies
  room?: mongoose.Types.ObjectId;  // Optional fixed room
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDurationMinutes: number; // e.g. 30
  isActive: boolean;
}

export interface IDoctor extends Document {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  qualifications?: string;
  specializations: string[];
  clinic_affiliations: mongoose.Types.ObjectId[]; // Clinic refs
  schedule_days: IScheduleDay[];
  comparePassword(candidate: string): Promise<boolean>;
}

const ScheduleDaySchema = new Schema<IScheduleDay>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    clinic: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room"
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, required: true, min: 5 },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctor>(
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
    qualifications: { type: String, trim: true },
    specializations: { type: [String], default: [] },
    clinic_affiliations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Clinic"
      }
    ],
    schedule_days: { type: [ScheduleDaySchema], default: [] }
  },
  { timestamps: true }
);

DoctorSchema.pre("save", async function (this: IDoctor, next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

DoctorSchema.methods.comparePassword = async function (candidate: string) {
  const doctor = this as IDoctor;
  return bcrypt.compare(candidate, doctor.password);
};

export const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);
