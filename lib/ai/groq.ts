// lib/ai/groq.ts
// Using Groq - 100% FREE with no credit card required
// Get your free API key at: https://console.groq.com/keys
import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface SymptomAnalysis {
    suggestedSpecialties: string[];
    urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
    summary: string;
    followUpQuestions?: string[];
}

// Specialty mapping for the AI to use
const MEDICAL_SPECIALTIES = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Obstetrics & Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Rheumatology",
    "Urology",
    "ENT (Ear, Nose, Throat)",
    "Allergy & Immunology",
    "Internal Medicine"
];

/**
 * Analyze patient symptoms and suggest appropriate specialties
 */
export async function analyzeSymptoms(
    symptomsDescription: string,
    patientAge?: number,
    patientGender?: string,
    language: "en" | "ar" = "en"
): Promise<SymptomAnalysis> {
    const isArabic = language === "ar";

    const systemPrompt = `You are a medical triage assistant. Your role is to:
1. Analyze patient symptoms described in natural language
2. Suggest appropriate medical specialties they should consult
3. Assess urgency level (LOW, MEDIUM, HIGH, EMERGENCY)
4. Provide a brief summary of your assessment

Available specialties: ${MEDICAL_SPECIALTIES.join(", ")}

IMPORTANT:
- Be conservative with urgency assessments
- EMERGENCY should only be for life-threatening symptoms
- Always suggest General Practice if symptoms are vague
- You are NOT diagnosing, only suggesting which specialists to see
${isArabic ? "- IMPORTANT: Respond with the summary and followUpQuestions in Arabic language. The specialty names should remain in English." : ""}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
    "suggestedSpecialties": ["Specialty1", "Specialty2"],
    "urgencyLevel": "LOW",
    "summary": "${isArabic ? "ملخص قصير بالعربية" : "Brief explanation"}",
    "followUpQuestions": ["${isArabic ? "أسئلة اختيارية بالعربية" : "Optional questions"}"]
}`;

    const userMessage = `Patient symptoms: ${symptomsDescription}
${patientAge ? `Age: ${patientAge}` : ""}
${patientGender ? `Gender: ${patientGender}` : ""}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Free, powerful model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        // Clean up the response - remove markdown code blocks if present
        let cleanJson = content.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```$/, "");
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```$/, "");
        }

        return JSON.parse(cleanJson) as SymptomAnalysis;
    } catch (error) {
        console.error("[SYMPTOM_ANALYSIS_ERROR]", error);
        // Fallback response
        return {
            suggestedSpecialties: ["General Practice"],
            urgencyLevel: "LOW",
            summary: "Unable to analyze symptoms. Please consult a general practitioner for an initial assessment."
        };
    }
}

/**
 * Chat with the medical assistant
 */
export async function chatWithAssistant(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    context?: {
        patientName?: string;
        upcomingAppointments?: Array<{ doctor: string; date: string; time: string }>;
        availableDoctors?: Array<{ name: string; specializations: string; fee: number }>;
    }
): Promise<string> {
    // Build doctors list string
    const doctorsInfo = context?.availableDoctors?.length
        ? `AVAILABLE DOCTORS (ONLY mention these, never make up doctors):
${context.availableDoctors.map(d => `- Dr. ${d.name} (${d.specializations}) - EGP ${d.fee}`).join("\n")}`
        : "";

    const systemPrompt = `You are a helpful medical clinic assistant for Clinify. You can ONLY provide information and guidance. You CANNOT perform any actions.

WHAT YOU CAN DO:
- Answer questions about available doctors and their specializations
- Provide information about the user's appointments
- Guide users on how to use the app features
- Answer general health questions (but remind them to consult a doctor)

WHAT YOU CANNOT DO (VERY IMPORTANT):
- You CANNOT book, cancel, or reschedule appointments
- You CANNOT modify any data or settings
- You CANNOT access payment information
- If someone asks you to perform an action, tell them WHERE in the app they can do it themselves

${context?.patientName ? `The user's name is ${context.patientName}. Greet them by their first name.` : ""}

${doctorsInfo}

${context?.upcomingAppointments?.length
            ? `USER'S UPCOMING APPOINTMENTS:
${context.upcomingAppointments.map(apt => `- ${apt.date} at ${apt.time} with Dr. ${apt.doctor}`).join("\n")}`
            : "No upcoming appointments."}

HOW TO GUIDE USERS:
- To book: "Go to the 'Book' page or click 'AI Check' to find the right doctor"
- To reschedule: "Go to your Dashboard and click the 'Reschedule' button on your appointment"
- To cancel: "Go to your Dashboard and click the 'Cancel' button on your appointment"
- To message a doctor: "Go to the 'Messages' page"

IMPORTANT RULES:
- NEVER say you performed an action. Always say "I cannot do that, but you can..."
- ONLY mention doctors from the list above. NEVER make up doctor names.
- Be friendly, professional, and concise (under 100 words).
- If asked for medical advice, remind them to consult their doctor.`;

    try {
        const chatMessages = [
            { role: "system" as const, content: systemPrompt },
            ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
        ];

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your request.";
    } catch (error) {
        console.error("[CHAT_ASSISTANT_ERROR]", error);
        return "I'm sorry, I'm having trouble responding right now. Please try again later.";
    }
}

/**
 * Check if the API key is configured
 */
export function isAIConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
}

export { MEDICAL_SPECIALTIES };
