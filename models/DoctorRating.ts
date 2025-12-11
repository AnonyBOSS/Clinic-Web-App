// models/DoctorRating.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctorRating extends Document {
    patient: mongoose.Types.ObjectId;
    doctor: mongoose.Types.ObjectId;
    appointment: mongoose.Types.ObjectId;
    rating: number; // 1-5 stars
    review?: string;
    isAnonymous: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DoctorRatingSchema = new Schema<IDoctorRating>(
    {
        patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
        appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, trim: true, maxlength: 1000 },
        isAnonymous: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Ensure one rating per appointment
DoctorRatingSchema.index({ appointment: 1 }, { unique: true });
// For fetching doctor's ratings
DoctorRatingSchema.index({ doctor: 1, createdAt: -1 });
// For fetching patient's given ratings
DoctorRatingSchema.index({ patient: 1, createdAt: -1 });

export const DoctorRating: Model<IDoctorRating> =
    mongoose.models.DoctorRating ||
    mongoose.model<IDoctorRating>("DoctorRating", DoctorRatingSchema);
