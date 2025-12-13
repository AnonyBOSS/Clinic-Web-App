# 🏥 Clinify - Clinic Booking Platform

## 📦 Project Overview

A **modern full-stack clinic appointment booking platform** built with:
- **Next.js 14+** with App Router & TypeScript
- **MongoDB** with Mongoose ODM
- **Tailwind CSS** for responsive design
- **Groq AI** for intelligent health features
- **Full i18n** with English & Arabic support

---

## ✨ Key Features

### 🤖 AI-Powered
- **Symptom Checker** - Describe symptoms, get specialist recommendations
- **Medical Assistant** - Chat with AI for health questions
- **Doctor Recommendations** - AI-matched doctor suggestions

### 💬 Communication
- **Doctor-Patient Messaging** - Real-time chat system
- **In-App Notifications** - Stay updated on appointments & messages

### 📅 Booking System
- **Smart Scheduling** - Doctors define availability, patients book slots
- **Atomic Booking** - Race-condition safe reservations
- **Multi-Clinic Support** - Doctors work across multiple clinics

### ⭐ Ratings & Reviews
- Rate and review doctors after appointments

### 🌍 Internationalization
- Full English & Arabic support
- RTL layout for Arabic
- AI responds in selected language

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and GROQ_API_KEY

# Start development server
npm run dev
```

Open: **http://localhost:3000**

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Login & Register
│   ├── api/                 # REST API
│   │   ├── auth/            # Authentication
│   │   ├── appointments/    # Booking management
│   │   ├── doctors/         # Doctor profiles & schedules
│   │   ├── messages/        # Chat system
│   │   ├── notifications/   # Notification system
│   │   ├── ratings/         # Reviews & ratings
│   │   └── ai/              # AI features
│   ├── book/                # Booking flow
│   ├── dashboard/           # User dashboard
│   ├── doctor/schedule/     # Schedule management
│   ├── messages/            # Chat interface
│   ├── symptom-checker/     # AI symptom analysis
│   └── profile/             # User profile
├── components/              # Reusable UI components
├── lib/
│   ├── ai/                  # Groq AI integration
│   ├── db/                  # MongoDB connection
│   └── i18n/                # Translations
├── models/                  # Mongoose schemas
└── styles/                  # Global styles
```

---

## 🗄️ Database Models

| Model | Purpose |
|-------|---------|
| `Patient` | Patient accounts |
| `Doctor` | Doctor profiles & schedules |
| `Clinic` | Healthcare facilities |
| `Room` | Clinic rooms |
| `Slot` | Bookable time slots |
| `Appointment` | Confirmed bookings |
| `Payment` | Payment records |
| `Message` | Chat messages |
| `Notification` | In-app notifications |
| `DoctorRating` | Ratings & reviews |
| `SymptomCheck` | AI analysis history |

---

## 🔌 API Overview

### Authentication
- `POST /api/auth/register` - Register (Patient/Doctor)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get session
- `POST /api/auth/logout` - Logout

### Appointments
- `GET/POST /api/appointments` - List/Book
- `POST /api/appointments/[id]/cancel` - Cancel
- `POST /api/appointments/[id]/confirm` - Confirm
- `POST /api/appointments/[id]/complete` - Complete

### AI Features
- `POST /api/ai/symptom-check` - Analyze symptoms
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/recommend-doctors` - Get recommendations

### Communication
- `GET/POST /api/messages` - Messaging
- `GET/PUT /api/notifications` - Notifications

### Ratings
- `GET/POST/PUT/DELETE /api/ratings` - Manage ratings

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React 18, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) |
| AI | Groq SDK (Llama 3.3 70B) |
| i18n | Custom React Context + RTL |

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `README.md` | Complete documentation |
| `QUICKSTART.md` | 5-minute setup guide |
| `SETUP.md` | Detailed configuration |
| `INDEX.md` | This overview |

---

## 🔒 Security

- ✅ Password hashing (bcryptjs)
- ✅ JWT in httpOnly cookies
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

### Environment Variables
```
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-key
```

---

**Version**: 2.0.0  
**Last Updated**: December 2025  
**Status**: ✅ Production Ready

🚀 Happy Booking!
