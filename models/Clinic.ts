import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    governorate: string;
  };
  phone: string;
  operating_hours: string;
  doctor_summaries?: {
    doctor_id: mongoose.Types.ObjectId;
    name: string;
    specializations: string[];
  }[];
  room_summaries?: {
    room_number: string;
    type: string;
    status: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<IClinic>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a clinic name'],
    },
    address: {
      street: String,
      city: String,
      governorate: String,
    },
    phone: String,
    operating_hours: String,
    doctor_summaries: [
      {
        doctor_id: {
          type: Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        name: String,
        specializations: [String],
      },
    ],
    room_summaries: [
      {
        room_number: String,
        type: String,
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Clinic || mongoose.model<IClinic>('Clinic', ClinicSchema);
