// models/SymptomCheck.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAIAnalysis {
    suggestedSpecialties: string[];
    urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
    summary: string;
    followUpQuestions?: string[];
    recommendedDoctorIds?: mongoose.Types.ObjectId[];
}

export interface ISymptomCheck extends Document {
    patient: mongoose.Types.ObjectId;
    symptoms: string;
    additionalInfo?: {
        age?: number;
        gender?: string;
    };
    aiAnalysis: IAIAnalysis;
    selectedDoctor?: mongoose.Types.ObjectId;
    appointmentBooked?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
    {
        suggestedSpecialties: { type: [String], required: true },
        urgencyLevel: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
            required: true
        },
        summary: { type: String, required: true },
        followUpQuestions: { type: [String], default: [] },
        recommendedDoctorIds: [{ type: Schema.Types.ObjectId, ref: "Doctor" }]
    },
    { _id: false }
);

const SymptomCheckSchema = new Schema<ISymptomCheck>(
    {
        patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        symptoms: { type: String, required: true },
        additionalInfo: {
            age: { type: Number },
            gender: { type: String }
        },
        aiAnalysis: { type: AIAnalysisSchema, required: true },
        selectedDoctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
        appointmentBooked: { type: Schema.Types.ObjectId, ref: "Appointment" }
    },
    { timestamps: true }
);

// Index for patient lookups
SymptomCheckSchema.index({ patient: 1, createdAt: -1 });

export const SymptomCheck: Model<ISymptomCheck> =
    mongoose.models.SymptomCheck ||
    mongoose.model<ISymptomCheck>("SymptomCheck", SymptomCheckSchema);
