# Clinify - Complete Setup Guide

## ✅ Project Overview

A full-stack clinic appointment booking platform with:
- **Next.js 14+** (App Router) + TypeScript
- **MongoDB** database with Mongoose ODM
- **Tailwind CSS** responsive design
- **Groq AI** for symptom analysis & medical chat
- **Full i18n** with English & Arabic (RTL support)

### 📊 Project Statistics
- **Total Features**: 25+
- **API Endpoints**: 30+
- **Frontend Pages**: 15+
- **Database Models**: 11
- **Build Status**: ✅ Production Ready

---

## 🚀 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/clinics-booking

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# AI (Groq - Free, no credit card required)
GROQ_API_KEY=your-groq-api-key
```

Get your free Groq API key: https://console.groq.com/keys

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
Update `MONGODB_URI` with your Atlas connection string.

### 4. Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                  # Auth route group
│   │   ├── login/               # Unified login
│   │   └── register/            # Unified registration
│   ├── api/                     # REST API Routes
│   │   ├── auth/                # login, register, me, logout
│   │   ├── appointments/        # booking, cancel, confirm, complete
│   │   ├── doctors/             # profiles, search, schedule, slots
│   │   ├── clinics/             # clinic management
│   │   ├── slots/               # availability
│   │   ├── payments/            # payment records
│   │   ├── profile/             # profile updates
│   │   ├── messages/            # doctor-patient chat
│   │   ├── notifications/       # in-app notifications
│   │   ├── ratings/             # doctor reviews
│   │   ├── analytics/           # dashboard stats
│   │   └── ai/                  # AI features
│   │       ├── symptom-check/   # symptom analysis
│   │       ├── chat/            # medical assistant
│   │       └── recommend-doctors/
│   ├── book/                    # Booking flow
│   ├── dashboard/               # Unified dashboard
│   ├── doctor/schedule/         # Schedule management
│   ├── messages/                # Chat interface
│   ├── symptom-checker/         # AI symptom checker
│   ├── profile/                 # Profile settings
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/                  # Reusable UI components
├── lib/
│   ├── auth.ts                  # JWT utilities
│   ├── db/connection.ts         # MongoDB connection
│   ├── ai/groq.ts               # Groq AI integration
│   └── i18n/                    # Internationalization
│       ├── translations.ts      # En & Ar translations
│       └── LanguageContext.tsx  # Language provider
├── models/
│   ├── Patient.ts               # Patient schema
│   ├── Doctor.ts                # Doctor schema
│   ├── Clinic.ts                # Clinic schema
│   ├── Room.ts                  # Room schema
│   ├── Slot.ts                  # Slot schema
│   ├── Appointment.ts           # Appointment schema
│   ├── Payment.ts               # Payment schema
│   ├── Message.ts               # Message schema
│   ├── Notification.ts          # Notification schema
│   ├── DoctorRating.ts          # Rating schema
│   └── SymptomCheck.ts          # AI history schema
└── styles/
    └── globals.css              # Global styles
```

---

## 🗄️ Database Models

### Patient
```javascript
{
  full_name: String,
  phone: String,
  email: String (unique),
  password: String (hashed),
  insurance: { provider, policyNumber },
  medical_summary: String,
  emergency_contact: { name, phone, relation }
}
```

### Doctor
```javascript
{
  full_name: String,
  phone: String,
  email: String (unique),
  password: String (hashed),
  qualifications: [String],
  specializations: [String],
  clinic_affiliations: [ObjectId],
  schedule_days: [{
    dayOfWeek: Number,
    clinic: ObjectId,
    room: ObjectId,
    startTime: String,
    endTime: String,
    slotDurationMinutes: Number
  }],
  consultation_fee: Number
}
```

### Appointment
```javascript
{
  patient: ObjectId,
  doctor: ObjectId,
  clinic: ObjectId,
  room: ObjectId,
  slot: ObjectId,
  status: 'BOOKED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  notes: String,
  payment: {
    amount: Number,
    method: 'CASH' | 'CARD',
    status: 'PENDING' | 'PAID' | 'REFUNDED'
  }
}
```

### Message
```javascript
{
  sender: ObjectId,
  senderRole: 'PATIENT' | 'DOCTOR',
  recipient: ObjectId,
  recipientRole: 'PATIENT' | 'DOCTOR',
  content: String,
  read: Boolean
}
```

### DoctorRating
```javascript
{
  patient: ObjectId,
  doctor: ObjectId,
  appointment: ObjectId,
  rating: Number (1-5),
  review: String
}
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (Patient/Doctor) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get session |
| POST | `/api/auth/logout` | Logout |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Book appointment |
| POST | `/api/appointments/[id]/cancel` | Cancel |
| POST | `/api/appointments/[id]/confirm` | Confirm |
| POST | `/api/appointments/[id]/complete` | Complete |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | List conversations |
| POST | `/api/messages` | Send message |
| GET | `/api/messages/[id]` | Get chat history |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications` | Mark as read |

### Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ratings` | Get ratings |
| POST | `/api/ratings` | Submit rating |
| PUT | `/api/ratings` | Update rating |
| DELETE | `/api/ratings` | Delete rating |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/symptom-check` | Analyze symptoms |
| GET | `/api/ai/symptom-check` | Get history |
| POST | `/api/ai/chat` | Chat with AI |
| POST | `/api/ai/recommend-doctors` | Get recommendations |

---

## 🌍 Internationalization (i18n)

### Supported Languages
- **English** (en) - LTR
- **Arabic** (ar) - RTL

### Usage
```tsx
import { useTranslation } from "@/lib/i18n";

function Component() {
  const { t, language, isRTL } = useTranslation();
  return <h1>{t.common.loading}</h1>;
}
```

### Adding Translations
Edit `lib/i18n/translations.ts`:
```typescript
export const translations = {
  en: {
    common: {
      newKey: "English text",
    },
  },
  ar: {
    common: {
      newKey: "النص العربي",
    },
  },
};
```

---

## 🔒 Security

- ✅ Password hashing with bcryptjs
- ✅ JWT stored in httpOnly cookies
- ✅ Role-based access control
- ✅ Atomic database operations
- ✅ Input validation

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/clinics
JWT_SECRET=your-strong-secret-key-min-32-characters
GROQ_API_KEY=your-groq-api-key
```

---

## 📜 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Run ESLint
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
mongod  # Start MongoDB
```

### Port 3000 in Use
```bash
npm run dev -- -p 3001
```

### Clear Build Cache
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## ✅ Features Implemented

- ✅ Unified authentication (Patient/Doctor)
- ✅ AI Symptom Checker
- ✅ AI Medical Assistant Chatbot
- ✅ Doctor-Patient Messaging
- ✅ In-App Notifications
- ✅ Doctor Ratings & Reviews
- ✅ Smart Scheduling System
- ✅ Multi-Clinic Support
- ✅ Full English/Arabic i18n
- ✅ RTL Layout Support
- ✅ Dark Mode
- ✅ Responsive Design
- ✅ Atomic Booking (race-safe)
- ✅ Payment Tracking

---

**Version**: 2.0.0  
**Last Updated**: December 2025  
**Status**: ✅ Production Ready
