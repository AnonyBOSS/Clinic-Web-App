import mongoose, { Schema, Document } from 'mongoose';

export interface ISlot extends Document {
  doctor_id: mongoose.Types.ObjectId;
  clinic_id: mongoose.Types.ObjectId;
  room_id: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'available' | 'booked';
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  {
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
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for faster availability searches
SlotSchema.index({ doctor_id: 1, clinic_id: 1, date: 1, status: 1 });

export default mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema);
