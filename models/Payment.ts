import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  appointment_id: mongoose.Types.ObjectId;
  patient_id: mongoose.Types.ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  amount: number;
  method: 'cash' | 'card';
  transaction_id?: string;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
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
  {
    timestamps: true,
  }
);

// Create index for reporting
PaymentSchema.index({ timestamp: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
