// models/Doctor.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IScheduleDay {
  dayOfWeek: number; // 0-6 (Sun-Sat)
  clinic: mongoose.Types.ObjectId;
  room?: mongoose.Types.ObjectId;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface IDoctor extends Document {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  qualifications?: string;
  specializations: string[];
  clinic_affiliations: mongoose.Types.ObjectId[];
  schedule_days: IScheduleDay[];
  consultation_fee?: number;
  comparePassword(candidate: string): Promise<boolean>;
}

const ScheduleDaySchema = new Schema<IScheduleDay>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    clinic: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: false },
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
    password: { type: String, required: true, select: false },
    qualifications: { type: String, trim: true },
    specializations: { type: [String], default: [] },
    clinic_affiliations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Clinic"
      }
    ],
    schedule_days: { type: [ScheduleDaySchema], default: [] },

    consultation_fee: {
      type: Number,
      default: 300,
      min: 0
    }
  },
  { timestamps: true }
);

// Index for specialization searches
DoctorSchema.index({ specializations: 1 });

DoctorSchema.pre("save", async function (next) {
  const doctor = this as IDoctor;
  // @ts-ignore
  if (!doctor.isModified || !doctor.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  doctor.password = await bcrypt.hash(doctor.password, salt);
  next();
});

DoctorSchema.methods.comparePassword = async function (candidate: string) {
  const doctor = this as IDoctor;
  return bcrypt.compare(candidate, doctor.password);
};

export const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);
