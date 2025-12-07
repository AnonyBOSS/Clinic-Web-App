import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient_id: mongoose.Types.ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  clinic_id: mongoose.Types.ObjectId;
  room_id: mongoose.Types.ObjectId;
  slot_id: mongoose.Types.ObjectId;
  status: 'booked' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  payment: {
    amount: number;
    method: 'cash' | 'card';
    transaction_id?: string;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    room_id: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    slot_id: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['booked', 'confirmed', 'cancelled', 'completed'],
      default: 'booked',
    },
    notes: String,
    payment: {
      amount: {
        type: Number,
        required: true,
      },
      method: {
        type: String,
        enum: ['cash', 'card'],
        required: true,
      },
      transaction_id: String,
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
AppointmentSchema.index({ doctor_id: 1, createdAt: -1 });
AppointmentSchema.index({ patient_id: 1, createdAt: -1 });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
