# Clinics Booking System

A full-stack clinic appointment booking platform built with **Next.js 14+ (App Router)**, **TypeScript**, **MongoDB**, and **Tailwind CSS**. The system supports both patients and doctors with a unified dashboard experience.

## ✨ Features

### For Patients
- 📅 **Search & Book Appointments** — Browse available doctors, filter by specialization, and book slots in real-time
- � **Payment at Booking** — Cash or card payment recorded during booking
- 📊 **Dashboard** — View today's, upcoming, and past appointments
- ❌ **Cancel Appointments** — Cancel future bookings directly from the dashboard
- 👤 **Profile Management** — Update personal details and change password

### For Doctors
- �️ **Schedule Management** — Define working days, hours, and slot durations per clinic/room
- ⚙️ **Auto Slot Generation** — Generate booking slots based on schedule configuration
- 📊 **Dashboard** — View assigned appointments across all clinics
- 👤 **Profile Management** — Update qualifications and specializations

### System Features
- 🔐 **Unified Authentication** — Single login/register page with role selection (Patient/Doctor)
- 🌗 **Dark Mode** — System-wide dark mode toggle
- ⚛️ **Atomic Booking** — Race-condition-safe slot reservation using MongoDB atomic updates
- 🧩 **Reusable Components** — Button, Card, Input, Select, LoadingSpinner, EmptyState, etc.

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

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                  # Auth route group
│   │   ├── login/               # Unified login (Patient/Doctor)
│   │   └── register/            # Unified registration
│   ├── api/
│   │   ├── auth/                # login, register, me, logout
│   │   ├── appointments/        # GET (list), POST (book), [id]/cancel
│   │   ├── doctors/             # GET, [id], search, schedule, slots
│   │   ├── clinics/             # GET, POST
│   │   ├── slots/available/     # GET available slots
│   │   ├── payments/            # POST/GET payment records
│   │   └── profile/             # PUT profile updates
│   ├── book/                    # Booking flow page
│   ├── dashboard/               # Unified dashboard (Patient & Doctor)
│   ├── doctor/schedule/         # Doctor schedule management
│   ├── profile/                 # Profile settings page
│   ├── contact/, help/, privacy/, terms/  # Static pages
│   ├── layout.tsx               # Root layout with ThemeProvider
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
│   └── db/connection.ts         # MongoDB connection
├── models/
│   ├── Patient.ts               # Patient schema (insurance, emergency contact)
│   ├── Doctor.ts                # Doctor schema (schedule_days, consultation_fee)
│   ├── Clinic.ts                # Clinic schema (address, operating hours)
│   ├── Room.ts                  # Room schema (type, status)
│   ├── Slot.ts                  # Slot schema (date, time, status)
│   ├── Appointment.ts           # Appointment with embedded payment
│   └── Payment.ts               # Standalone payment record
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
EOF

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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
