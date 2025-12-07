import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  clinic_id: mongoose.Types.ObjectId;
  room_number: string;
  type: string;
  status: 'available' | 'maintenance' | 'occupied';
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    room_number: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['exam', 'surgery', 'consultation', 'waiting'],
    },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'occupied'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Create index for clinic_id for faster queries
RoomSchema.index({ clinic_id: 1 });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
