import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPatient extends Document {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  insurance_info?: string;
  medical_summary?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const PatientSchema = new Schema<IPatient>(
  {
    full_name: {
      type: String,
      required: [true, 'Please provide a full name'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
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
    insurance_info: {
      type: String,
    },
    medical_summary: {
      type: String,
    },
    emergency_contact: {
      name: String,
      phone: String,
      relation: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
PatientSchema.pre('save', async function (this: IPatient, next: any) {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
PatientSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
