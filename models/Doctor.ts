import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDoctor extends Document {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  qualifications?: string[];
  specializations: string[];
  clinic_affiliations: mongoose.Types.ObjectId[];
  schedule_days?: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    full_name: {
      type: String,
      required: [true, 'Please provide a full name'],
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    qualifications: [String],
    specializations: {
      type: [String],
      default: [],
    },
    clinic_affiliations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
      },
    ],
    schedule_days: [
      {
        day: String,
        start_time: String,
        end_time: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
DoctorSchema.pre('save', async function (this: IDoctor, next: any) {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
DoctorSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
