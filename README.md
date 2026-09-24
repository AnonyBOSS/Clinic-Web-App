# Clinics Booking System

A full-stack clinic appointment booking platform built with **Next.js 14+ (App Router)**, **TypeScript**, **MongoDB**, and **Tailwind CSS**. The system supports both patients and doctors with a unified dashboard experience.

**Live demo:** [clinic-web-app-two.vercel.app](https://clinic-web-app-two.vercel.app/) · **Mobile app:** [Clinify-mobile-app](https://github.com/AnonyBOSS/Clinify-mobile-app) (React Native client for this same API)

## ✨ Features

### For Patients
- 📅 **Search & Book Appointments** — Browse available doctors, filter by specialization, and book slots in real-time
- 🤖 **AI Symptom Checker** — Describe symptoms and get AI-powered specialist recommendations
- 💬 **AI Medical Assistant** — Chat with an AI assistant for general health questions
- 🗨️ **Doctor Messaging** — Send messages directly to your doctors
- 🔔 **Notifications** — Get notified about appointments, messages, and updates
- ⭐ **Rate Doctors** — Leave ratings and reviews after completed appointments
- 💳 **Payment at Booking** — Cash or card payment recorded during booking
- 📊 **Dashboard** — View today's, upcoming, and past appointments
- ❌ **Cancel Appointments** — Cancel future bookings directly from the dashboard
- 👤 **Profile Management** — Update personal details and change password

### For Doctors
- 🗓️ **Schedule Management** — Define working days, hours, and slot durations per clinic/room
- ⚙️ **Auto Slot Generation** — Generate booking slots based on schedule configuration
- 🗨️ **Patient Messaging** — Communicate with patients through in-app chat
- 🔔 **Notifications** — Get notified about new bookings and messages
- 📊 **Dashboard** — View assigned appointments across all clinics
- 👤 **Profile Management** — Update qualifications and specializations

### System Features
- 🔐 **Unified Authentication** — Single login/register page with role selection (Patient/Doctor)
- 🌗 **Dark Mode** — System-wide dark mode toggle
- 🌍 **Internationalization (i18n)** — Full English and Arabic language support with RTL layout
- 🤖 **AI Symptom Checker** — Groq-powered AI that analyzes symptoms and suggests specialists
- 💬 **Live Messaging** — Doctor-patient chat that polls for new messages every 0.5 s, with notifications
- 🔔 **Notifications** — In-app notification system for appointments and messages
- ⭐ **Doctor Ratings** — Patients can rate and review doctors after appointments
- ⚛️ **Atomic Booking** — Race-condition-safe slot reservation using MongoDB atomic updates
- 🧩 **Reusable Components** — Button, Card, Input, Select, LoadingSpinner, etc.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS 3.4 |
| **Backend** | Next.js API Routes (Serverless) |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (httpOnly cookies, 30-day expiry) |
| **Password Hashing** | bcryptjs |
| **AI** | Groq SDK (Llama 3.3 70B) |
| **i18n** | Custom React Context with RTL support |

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                  # Auth route group
│   │   ├── login/               # Unified login (Patient/Doctor)
│   │   └── register/            # Unified registration
│   ├── api/
│   │   ├── auth/                # login, register, me, logout
│   │   ├── appointments/        # GET (list), POST (book), [id]/cancel, confirm, complete
│   │   ├── doctors/             # GET, [id], search, schedule, slots
│   │   ├── clinics/             # GET, POST
│   │   ├── slots/available/     # GET available slots
│   │   ├── payments/            # POST/GET payment records
│   │   ├── profile/             # PUT profile updates
│   │   ├── messages/            # Doctor-patient messaging
│   │   ├── notifications/       # In-app notifications
│   │   ├── ratings/             # Doctor ratings and reviews
│   │   ├── analytics/           # Dashboard analytics
│   │   └── ai/                  # AI features
│   │       ├── symptom-check/   # Symptom analysis
│   │       ├── chat/            # AI medical assistant
│   │       └── recommend-doctors/ # Doctor recommendations
│   ├── book/                    # Booking flow page
│   ├── dashboard/               # Unified dashboard (Patient & Doctor)
│   ├── doctor/schedule/         # Doctor schedule management
│   ├── messages/                # Chat interface
│   ├── symptom-checker/         # AI symptom checker page
│   ├── profile/                 # Profile settings page
│   ├── contact/, help/, privacy/, terms/  # Static pages
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/
│   ├── Button.tsx               # Primary button component
│   ├── Card.tsx                 # Container card
│   ├── EmptyState.tsx           # Empty state placeholder
│   ├── Input.tsx                # Form input
│   ├── Select.tsx               # Dropdown select
│   ├── LoadingSpinner.tsx       # Loading indicator
│   ├── Navbar.tsx               # Navigation bar
│   ├── PageShell.tsx            # Page wrapper with title
│   ├── ThemeProvider.tsx        # Dark mode context
│   └── ThemeToggle.tsx          # Dark/light toggle button
├── lib/
│   ├── auth.ts                  # JWT generation/verification
│   ├── auth-request.ts          # Extract user from request
│   ├── validators.ts            # Email/password validation
│   ├── db/connection.ts         # MongoDB connection
│   ├── ai/groq.ts               # Groq AI integration for symptom analysis
│   └── i18n/                    # Internationalization
│       ├── translations.ts      # English & Arabic translations
│       ├── LanguageContext.tsx  # Language provider & hooks
│       └── index.ts             # Public exports
├── models/
│   ├── Patient.ts               # Patient schema (insurance, emergency contact)
│   ├── Doctor.ts                # Doctor schema (schedule_days, consultation_fee)
│   ├── Clinic.ts                # Clinic schema (address, operating hours)
│   ├── Room.ts                  # Room schema (type, status)
│   ├── Slot.ts                  # Slot schema (date, time, status)
│   ├── Appointment.ts           # Appointment with embedded payment
│   ├── Payment.ts               # Standalone payment record
│   ├── Message.ts               # Doctor-patient messages
│   ├── Notification.ts          # In-app notifications
│   ├── DoctorRating.ts          # Doctor ratings and reviews
│   └── SymptomCheck.ts          # AI symptom check history
└── styles/
    └── globals.css              # Tailwind imports + custom styles
```

---

## 🗄️ Database Models

### Patient
- `full_name`, `phone`, `email`, `password` (hashed)
- `insurance` (provider, policyNumber)
- `medical_summary`, `emergency_contact`

### Doctor
- `full_name`, `phone`, `email`, `password` (hashed)
- `qualifications`, `specializations[]`
- `clinic_affiliations[]` (references to Clinic)
- `schedule_days[]` (dayOfWeek, clinic, room, startTime, endTime, slotDurationMinutes)
- `consultation_fee` (default: 300)

### Clinic
- `name`, `phone`, `operating_hours`
- `address` (street, city, governorate)

### Room
- `clinic` (ref), `room_number`, `type`, `status` (AVAILABLE/MAINTENANCE)

### Slot
- `doctor`, `clinic`, `room` (refs)
- `date` (YYYY-MM-DD), `time` (HH:MM)
- `status` (AVAILABLE/BOOKED)
- Unique compound index on (doctor, clinic, room, date, time)

### Appointment
- `patient`, `doctor`, `clinic`, `room`, `slot` (refs)
- `status` (BOOKED/CONFIRMED/CANCELLED/COMPLETED)
- `notes`
- `payment` (embedded: amount, method, transaction_id, status, timestamp)

### Payment
- Standalone record mirroring embedded payment for analytics

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (Patient or Doctor) |
| POST | `/api/auth/login` | Login with role selection |
| GET | `/api/auth/me` | Get current session |
| POST | `/api/auth/logout` | Clear auth cookie |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List user's appointments |
| POST | `/api/appointments` | Book appointment (atomic) |
| POST | `/api/appointments/[id]/cancel` | Cancel appointment |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List/search doctors |
| GET | `/api/doctors/[id]` | Doctor details |
| GET | `/api/doctors/schedule` | Get doctor's schedule |
| PUT | `/api/doctors/schedule` | Update schedule + generate slots |

### Slots & Clinics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slots/available` | Available slots (filters: doctorId, clinicId, date) |
| GET | `/api/clinics` | List clinics |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/profile` | Update profile + password |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get conversations list |
| GET | `/api/messages/[recipientId]` | Get messages with specific user |
| POST | `/api/messages` | Send a message |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications` | Mark notifications as read |

### Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ratings` | Get user's ratings |
| POST | `/api/ratings` | Submit a doctor rating |
| PUT | `/api/ratings` | Update a rating |
| DELETE | `/api/ratings` | Delete a rating |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/symptom-check` | Analyze symptoms and suggest specialists |
| GET | `/api/ai/symptom-check` | Get symptom check history |
| POST | `/api/ai/chat` | Chat with AI medical assistant |
| POST | `/api/ai/recommend-doctors` | Get doctor recommendations |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd "Clinc web app"

# 2. Install dependencies
npm install

# 3. Create .env.local
cat > .env.local << EOF
MONGODB_URI=mongodb://localhost:27017/clinics-booking
JWT_SECRET=your-super-secret-key-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
GROQ_API_KEY=your-groq-api-key
EOF

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌍 Internationalization (i18n)

The application supports **English** and **Arabic** with full RTL (Right-to-Left) layout support.

### Features
- 🔄 **Language Toggle** — Switch languages from the navbar (persisted in localStorage)
- ↔️ **RTL Support** — Automatic layout direction change for Arabic
- 🤖 **AI in Arabic** — The AI symptom checker responds in the user's selected language
- 📝 **Comprehensive Coverage** — All UI text, buttons, labels, and messages are translated

### Usage in Components

```tsx
import { useTranslation } from "@/lib/i18n";

export default function MyComponent() {
    const { t, language, isRTL } = useTranslation();
    
    return (
        <div>
            <h1>{t.common.loading}</h1>
            <p>Current language: {language}</p>
        </div>
    );
}
```

### Adding New Translations

Edit `lib/i18n/translations.ts` and add keys to both `en` and `ar` objects:

```typescript
// English
common: {
    newKey: "English text",
},
// Arabic  
common: {
    newKey: "النص العربي",
},
```

---

## 🔒 Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT stored in httpOnly cookies (not localStorage)
- ✅ Role-based access control on API routes
- ✅ Atomic slot updates prevent double-booking
- ✅ Email uniqueness enforced across both Patient and Doctor collections
- ✅ Input validation on registration and login

---

## 📜 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---
