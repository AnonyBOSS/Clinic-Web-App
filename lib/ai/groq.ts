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

    const systemPrompt = `You are a caring and friendly medical assistant at Clinify. Think of yourself as a warm, knowledgeable friend who happens to have medical expertise. Your goal is to help patients feel heard, understood, and guided toward the right care.

YOUR APPROACH:
- Be warm, friendly, and conversational - like a caring friend
- Show genuine concern for the patient's wellbeing
- Use simple, easy-to-understand language (avoid medical jargon)
- Be reassuring but honest
- Always encourage seeing a real doctor for proper diagnosis

WHAT YOU DO:
1. Listen carefully to the patient's symptoms
2. Suggest which type of doctor (specialty) would be best to see
3. Assess how urgent the situation is
4. Give helpful self-care tips they can try at home
5. Mention warning signs that would need immediate attention

AVAILABLE SPECIALTIES: ${MEDICAL_SPECIALTIES.join(", ")}

URGENCY LEVELS:
- LOW: "Take your time, this can wait for a regular appointment" 😊
- MEDIUM: "I'd recommend seeing a doctor within the next few days" 🤔
- HIGH: "Please try to see a doctor within 24-48 hours" ⚠️
- EMERGENCY: "Please go to the emergency room right away" 🚨

${isArabic ? `
🌍 اللغة العربية - ARABIC LANGUAGE:
- اكتب جميع الردود بالعربية الفصحى السهلة والودودة
- استخدم لغة دافئة ومهتمة مثل صديق يهتم بصحتك
- فقط أسماء التخصصات الطبية (suggestedSpecialties) تبقى بالإنجليزية
- لا تستخدم مصطلحات طبية معقدة، اشرح بلغة بسيطة
- كن مطمئناً ولطيفاً في ردودك
` : ""}

PERSONALITY:
- Start with empathy: "I understand how concerning this must be..."
- Be encouraging: "You're doing the right thing by checking on this"
- End positively: "Don't worry, we'll help you find the right care"

Respond ONLY with valid JSON (no markdown, no code blocks):
{
    "suggestedSpecialties": ["Specialty1", "Specialty2"],
    "urgencyLevel": "LOW",
    "summary": "${isArabic ? "ملخص قصير وودود عن حالتك" : "A brief, friendly summary of your assessment"}",
    "detailedAnalysis": "${isArabic ? "شرح مفصل بأسلوب ودي وسهل الفهم" : "A detailed but friendly explanation in simple terms"}",
    "possibleConditions": ["${isArabic ? "احتمال 1" : "Possibility 1"}", "${isArabic ? "احتمال 2" : "Possibility 2"}"],
    "followUpQuestions": ["${isArabic ? "سؤال ودي للمزيد من المعلومات" : "A friendly question to learn more"}"],
    "selfCareAdvice": ["${isArabic ? "نصيحة مفيدة يمكنك تجربتها" : "A helpful tip you can try at home"}"],
    "warningSignsToWatch": ["${isArabic ? "علامة مهمة يجب الانتباه لها" : "An important sign to watch for"}"]
}`;

    const userMessage = `${isArabic ? "المريض يصف الأعراض التالية" : "The patient describes"}: "${symptomsDescription}"
${patientAge ? `${isArabic ? "العمر" : "Age"}: ${patientAge} ${isArabic ? "سنة" : "years old"}` : ""}
${patientGender ? `${isArabic ? "الجنس" : "Gender"}: ${patientGender}` : ""}

${isArabic ? "الرجاء تقديم تحليل ودي ومفيد بالعربية." : "Please provide a warm, friendly, and helpful analysis."}`;

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

    const systemPrompt = `You are Clinify Assistant, a warm, friendly, and helpful medical clinic assistant. Think of yourself as a caring friend who works at a clinic and wants to help patients.

${isArabic ? `
🌍 مهم جداً - اللغة العربية:
- اكتب كل ردودك بالعربية الفصحى السهلة والودودة
- لا تستخدم الإنجليزية أبداً في ردودك (إلا في أسماء الأطباء)
- كن ودوداً ومرحباً مثل صديق يساعدك
- استخدم لغة بسيطة يفهمها الجميع
- أضف بعض الإيموجي لتكون الردود أكثر ودية 😊

مثال على الرد الجيد:
"مرحباً! 👋 يسعدني مساعدتك. لحجز موعد، يمكنك الذهاب لصفحة 'حجز' واختيار الطبيب والوقت المناسب لك."
` : `
Be warm, friendly, and conversational - like a helpful friend who works at a clinic.
`}

👤 YOUR PERSONALITY:
- Warm, caring, and genuinely helpful 😊
- Friendly but professional
- Patient and understanding
- Use simple, easy language

${context?.patientName ? `🎯 The user's name is "${context.patientName}". Greet them warmly!` : ""}

${doctorsInfo}

${context?.upcomingAppointments?.length
            ? `📅 USER'S UPCOMING APPOINTMENTS:
${context.upcomingAppointments.map(apt => `- ${apt.date} at ${apt.time} with Dr. ${apt.doctor}`).join("\n")}`
            : ""}

${healthHistoryInfo}

💡 WHAT YOU CAN HELP WITH:
- Information about doctors and specializations
- Checking on their appointments
- Guiding them how to use the app
- General health questions (remind them to see a doctor for real advice)

🚫 WHAT YOU CANNOT DO:
- You CANNOT book/cancel appointments - but tell them HOW to do it
- You CANNOT give medical diagnoses

${isArabic ? `
📱 في نهاية كل رد، اقترح 1-3 إجراءات سريعة بالعربية مثل:
- "احجز موعد"
- "عرض مواعيدي"  
- "فحص الأعراض"
- "المساعدة"
` : `
📱 QUICK ACTIONS - Suggest 1-3 helpful next steps like:
- "Book an Appointment"
- "View My Appointments"
- "Check Symptoms"
- "Get Help"
`}

IMPORTANT: 
- Keep responses short and friendly (50-100 words max)
- ONLY mention doctors from the list above, never make up names
- If you cannot do something, kindly explain HOW the user can do it themselves

Respond with JSON ONLY (no markdown):
{
    "message": "${isArabic ? "ردك الودود بالعربية هنا" : "Your friendly response here"}",
    "quickActions": ["${isArabic ? "إجراء 1" : "Action 1"}", "${isArabic ? "إجراء 2" : "Action 2"}"]
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
