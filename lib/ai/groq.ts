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
    detailedAnalysis: string;
    possibleConditions: string[];
    followUpQuestions: string[];
    selfCareAdvice: string[];
    warningSignsToWatch: string[];
}

export interface ChatResponse {
    message: string;
    quickActions: string[];
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
 * Analyze patient symptoms with enhanced detail
 */
export async function analyzeSymptoms(
    symptomsDescription: string,
    patientAge?: number,
    patientGender?: string,
    language: "en" | "ar" = "en"
): Promise<SymptomAnalysis> {
    const isArabic = language === "ar";

    const systemPrompt = `You are an expert medical triage assistant with extensive clinical knowledge. Your role is to provide thorough, empathetic, and helpful symptom analysis.

CORE RESPONSIBILITIES:
1. Carefully analyze patient symptoms described in natural language
2. Suggest appropriate medical specialties they should consult (from the list below)
3. Assess urgency level based on symptom severity
4. Provide a comprehensive but understandable analysis
5. Suggest relevant follow-up questions to gather more information
6. Offer safe self-care advice when appropriate
7. List warning signs that would warrant immediate medical attention

AVAILABLE SPECIALTIES: ${MEDICAL_SPECIALTIES.join(", ")}

URGENCY GUIDELINES:
- LOW: Non-urgent, can wait for regular appointment (common cold, minor aches)
- MEDIUM: Should see doctor within a few days (persistent symptoms, moderate pain)
- HIGH: Should see doctor within 24-48 hours (high fever, severe pain, concerning symptoms)
- EMERGENCY: Go to ER immediately (chest pain, difficulty breathing, severe bleeding, loss of consciousness)

${isArabic ? `
LANGUAGE INSTRUCTIONS:
- Respond with ALL text fields in Arabic language (summary, detailedAnalysis, possibleConditions, followUpQuestions, selfCareAdvice, warningSignsToWatch)
- ONLY the suggestedSpecialties array should remain in English
- Be culturally sensitive and use formal Arabic (فصحى/MSA)
` : ""}

TONE:
- Be empathetic and reassuring
- Never be dismissive of symptoms
- Encourage seeking professional medical advice
- Be clear that you're providing guidance, not diagnosis

Respond ONLY with valid JSON (no markdown, no code blocks):
{
    "suggestedSpecialties": ["Specialty1", "Specialty2"],
    "urgencyLevel": "LOW",
    "summary": "${isArabic ? "ملخص موجز للتقييم" : "Brief one-sentence assessment"}",
    "detailedAnalysis": "${isArabic ? "تحليل مفصل للأعراض وما قد تشير إليه" : "Detailed analysis of symptoms and what they might indicate"}",
    "possibleConditions": ["${isArabic ? "الحالة المحتملة 1" : "Possible condition 1"}", "${isArabic ? "الحالة المحتملة 2" : "Possible condition 2"}"],
    "followUpQuestions": ["${isArabic ? "سؤال للحصول على مزيد من المعلومات" : "Question to gather more information"}"],
    "selfCareAdvice": ["${isArabic ? "نصيحة للرعاية الذاتية" : "Safe self-care tip"}"],
    "warningSignsToWatch": ["${isArabic ? "علامة تحذيرية يجب مراقبتها" : "Warning sign to watch for"}"]
}`;

    const userMessage = `Patient describes: "${symptomsDescription}"
${patientAge ? `Patient age: ${patientAge} years old` : "Age: Not provided"}
${patientGender ? `Patient gender: ${patientGender}` : "Gender: Not provided"}

Please provide a thorough analysis with practical advice.`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            temperature: 0.3,
            max_tokens: 1000,
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

        const parsed = JSON.parse(cleanJson);

        // Ensure all required fields exist with defaults
        return {
            suggestedSpecialties: parsed.suggestedSpecialties || ["General Practice"],
            urgencyLevel: parsed.urgencyLevel || "LOW",
            summary: parsed.summary || "Please consult a healthcare professional for proper evaluation.",
            detailedAnalysis: parsed.detailedAnalysis || parsed.summary || "",
            possibleConditions: parsed.possibleConditions || [],
            followUpQuestions: parsed.followUpQuestions || [],
            selfCareAdvice: parsed.selfCareAdvice || [],
            warningSignsToWatch: parsed.warningSignsToWatch || []
        };
    } catch (error) {
        console.error("[SYMPTOM_ANALYSIS_ERROR]", error);
        // Enhanced fallback response
        return {
            suggestedSpecialties: ["General Practice"],
            urgencyLevel: "LOW",
            summary: isArabic
                ? "تعذر تحليل الأعراض. يرجى استشارة طبيب عام للتقييم المبدئي."
                : "Unable to analyze symptoms. Please consult a general practitioner for an initial assessment.",
            detailedAnalysis: isArabic
                ? "نوصي بزيارة طبيب عام يمكنه إجراء فحص شامل وتوجيهك للأخصائي المناسب إذا لزم الأمر."
                : "We recommend visiting a general practitioner who can perform a thorough examination and refer you to a specialist if needed.",
            possibleConditions: [],
            followUpQuestions: [],
            selfCareAdvice: [],
            warningSignsToWatch: []
        };
    }
}

/**
 * Chat with the medical assistant - Enhanced with Arabic support and quick actions
 */
export async function chatWithAssistant(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    context?: {
        patientName?: string;
        upcomingAppointments?: Array<{ doctor: string; date: string; time: string }>;
        availableDoctors?: Array<{ name: string; specializations: string; fee: number }>;
        language?: "en" | "ar";
        previousSymptomChecks?: Array<{ symptoms: string; suggestedSpecialties: string[] }>;
    }
): Promise<ChatResponse> {
    const isArabic = context?.language === "ar";

    // Build doctors list string
    const doctorsInfo = context?.availableDoctors?.length
        ? `AVAILABLE DOCTORS (ONLY mention these by name, never invent doctors):
${context.availableDoctors.map(d => `- Dr. ${d.name} (${d.specializations}) - EGP ${d.fee}`).join("\n")}`
        : "";

    // Build previous health checks info
    const healthHistoryInfo = context?.previousSymptomChecks?.length
        ? `PATIENT'S RECENT HEALTH CHECKS:
${context.previousSymptomChecks.map(c => `- Symptoms: "${c.symptoms}" → Suggested: ${c.suggestedSpecialties.join(", ")}`).join("\n")}`
        : "";

    const systemPrompt = `You are Clinify Assistant, a warm, professional, and knowledgeable medical clinic assistant. You work for Clinify, a modern healthcare booking platform.

${isArabic ? `
🌍 LANGUAGE: Respond ENTIRELY in Arabic (العربية). Use formal but friendly Arabic. Be culturally appropriate.
` : ""}

👤 PERSONALITY:
- Warm, empathetic, and genuinely helpful
- Professional but not cold or robotic
- Patient and understanding
- Proactive in offering assistance

${context?.patientName ? `🎯 PERSONALIZATION: The user's name is "${context.patientName}". Use their first name naturally in conversation (but not in every message - that feels robotic).` : ""}

${doctorsInfo}

${context?.upcomingAppointments?.length
            ? `📅 USER'S UPCOMING APPOINTMENTS:
${context.upcomingAppointments.map(apt => `- ${apt.date} at ${apt.time} with Dr. ${apt.doctor}`).join("\n")}`
            : "📅 No upcoming appointments scheduled."}

${healthHistoryInfo}

💡 CAPABILITIES - WHAT YOU CAN DO:
- Provide information about available doctors and their specializations
- Tell users about their scheduled appointments
- Answer general health questions (with appropriate disclaimers)
- Guide users on how to use Clinify features
- Recommend which type of specialist to see based on symptoms
- Offer emotional support and reassurance

🚫 LIMITATIONS - WHAT YOU CANNOT DO:
- You CANNOT book, cancel, or reschedule appointments (guide users to do it themselves)
- You CANNOT access or modify payment/billing information
- You CANNOT provide medical diagnoses or prescribe treatments
- You CANNOT access medical records

📱 QUICK ACTIONS - At the end of EVERY response, suggest 1-3 relevant quick actions the user might want to take. These should be button labels, e.g.:
- "Book an Appointment" / "احجز موعد"
- "View My Appointments" / "عرض مواعيدي"
- "Check Symptoms" / "فحص الأعراض"
- "Find a Specialist" / "ابحث عن متخصص"
- "Contact Support" / "اتصل بالدعم"
- "Book with Dr. [Name]" / "احجز مع د. [الاسم]"

🎯 HOW TO GUIDE USERS:
- To book: ${isArabic ? "\"اذهب إلى صفحة 'حجز' أو استخدم 'فحص الأعراض بالذكاء الاصطناعي' لإيجاد الطبيب المناسب\"" : "\"Go to the 'Book' page or use 'AI Symptom Check' to find the right doctor\""}
- To reschedule: ${isArabic ? "\"اذهب إلى لوحة التحكم واضغط على 'إعادة جدولة'\"" : "\"Go to your Dashboard and click 'Reschedule' on your appointment\""}
- To cancel: ${isArabic ? "\"اذهب إلى لوحة التحكم واضغط على 'إلغاء'\"" : "\"Go to your Dashboard and click 'Cancel' on your appointment\""}
- To message a doctor: ${isArabic ? "\"اذهب إلى صفحة 'الرسائل'\"" : "\"Go to the 'Messages' page\""}

⚠️ IMPORTANT RULES:
1. NEVER claim you performed an action. Say "I cannot do that directly, but you can..."
2. ONLY recommend doctors from the list above. NEVER invent doctor names.
3. Keep responses concise but helpful (aim for 50-150 words).
4. For medical advice, ALWAYS remind them to consult a healthcare professional.
5. If unsure, be honest and suggest they contact support or a doctor.

Respond with JSON ONLY (no markdown):
{
    "message": "Your helpful response here",
    "quickActions": ["Action 1", "Action 2"]
}`;

    try {
        const chatMessages = [
            { role: "system" as const, content: systemPrompt },
            ...messages.slice(-10).map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
        ];

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 600,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No response from AI");
        }

        // Try to parse as JSON
        try {
            let cleanJson = content.trim();

            // Remove markdown code blocks if present
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```$/, "");
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```$/, "");
            }

            // Try to find JSON object in the response
            const jsonMatch = cleanJson.match(/\{[\s\S]*"message"[\s\S]*\}/);
            if (jsonMatch) {
                cleanJson = jsonMatch[0];
            }

            const parsed = JSON.parse(cleanJson);
            return {
                message: parsed.message || content,
                quickActions: Array.isArray(parsed.quickActions) ? parsed.quickActions : getDefaultQuickActions(isArabic)
            };
        } catch {
            // If not valid JSON, try to extract just the message content
            // Check if the content looks like it contains a JSON-like structure
            const messageMatch = content.match(/"message"\s*:\s*"([^"]+(?:\\.[^"]*)*?)"/);
            if (messageMatch) {
                // Unescape the message
                const extractedMessage = messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
                return {
                    message: extractedMessage,
                    quickActions: getDefaultQuickActions(isArabic)
                };
            }

            // Return the raw content as message with default actions
            return {
                message: content,
                quickActions: getDefaultQuickActions(isArabic)
            };
        }
    } catch (error) {
        console.error("[CHAT_ASSISTANT_ERROR]", error);
        return {
            message: isArabic
                ? "عذراً، أواجه صعوبة في الرد الآن. يرجى المحاولة مرة أخرى لاحقاً."
                : "I'm sorry, I'm having trouble responding right now. Please try again later.",
            quickActions: getDefaultQuickActions(isArabic)
        };
    }
}

function getDefaultQuickActions(isArabic: boolean): string[] {
    return isArabic
        ? ["احجز موعد", "فحص الأعراض", "المساعدة"]
        : ["Book Appointment", "Check Symptoms", "Get Help"];
}

/**
 * Check if the API key is configured
 */
export function isAIConfigured(): boolean {
    return !!process.env.GROQ_API_KEY;
}

export { MEDICAL_SPECIALTIES };
