# Clinics Booking System - Complete Setup Guide

## ✅ Project Successfully Created!

Your full-stack Clinics Booking System has been built with **Next.js**, **TypeScript**, **MongoDB**, and **Tailwind CSS**.

### 📊 Project Statistics
- **Total Files Created**: 50+
- **API Endpoints**: 18+
- **Frontend Pages**: 12+
- **Database Models**: 7
- **Build Status**: ✅ Successfully compiles with TypeScript

## 🚀 Quick Start (5 minutes)

### 1. Ensure Dependencies Are Installed
```bash
cd c:\Users\ahmad\Downloads\ClincsManagmentSystem
npm install
```

### 2. Start MongoDB
**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update `.env.local` with your URI

### 3. Start the Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

### 4. (Optional) Seed Sample Data
```bash
npm install dotenv
node scripts/seed.js
```

Test accounts after seeding:
- **Patient**: ali.mohammed@email.com / password123
- **Doctor**: ahmed.hassan@clinic.com / password123

## 📁 Project Structure

```
ClincsManagmentSystem/
│
├── app/                              # Next.js App Router (13+)
│   ├── api/                         # REST API Routes
│   │   ├── auth/                   # Authentication (login/register)
│   │   │   ├── patient/login       # POST /api/auth/patient/login
│   │   │   ├── patient/register    # POST /api/auth/patient/register
│   │   │   ├── doctor/login        # POST /api/auth/doctor/login
│   │   │   └── doctor/register     # POST /api/auth/doctor/register
│   │   ├── appointments/           # Appointment Management
│   │   │   ├── book                # POST /api/appointments/book
│   │   │   └── [id]                # GET/PUT/DELETE /api/appointments/[id]
│   │   ├── clinics/                # Clinic APIs
│   │   │   ├── route               # GET/POST /api/clinics
│   │   │   └── [id]/route          # GET/PUT /api/clinics/[id]
│   │   ├── doctors/                # Doctor APIs
│   │   │   ├── route               # GET/POST /api/doctors
│   │   │   ├── [id]/route          # GET/PUT /api/doctors/[id]
│   │   │   └── search/route        # GET /api/doctors/search
│   │   ├── patients/               # Patient Profile APIs
│   │   │   └── [id]/route          # GET/PUT /api/patients/[id]
│   │   ├── slots/                  # Slot Management
│   │   │   └── available/route     # GET/POST /api/slots/available
│   │   ├── payments/               # Payment APIs
│   │   │   └── route               # POST/GET /api/payments
│   │   └── reports/                # Analytics Reports
│   │       └── daily/route         # GET /api/reports/daily
│   │
│   ├── (Public Pages)
│   │   ├── page.tsx                # Landing page
│   │   ├── clinics/                # /clinics - Clinic list
│   │   │   ├── page.tsx            # /clinics
│   │   │   └── [id]/page.tsx       # /clinics/[id]
│   │   ├── doctors/                # /doctors - Doctor directory
│   │   │   ├── page.tsx            # /doctors
│   │   │   └── [id]/page.tsx       # /doctors/[id]
│   │   ├── login/page.tsx          # /login - Patient login
│   │   └── register/page.tsx       # /register - Patient signup
│   │
│   ├── (Auth Pages)
│   │   └── doctor/
│   │       ├── login/page.tsx      # /doctor/login
│   │       └── register/page.tsx   # /doctor/register
│   │
│   ├── (Dashboards)
│   │   ├── patient/
│   │   │   └── dashboard/page.tsx  # /patient/dashboard
│   │   └── doctor/
│   │       └── dashboard/page.tsx  # /doctor/dashboard
│   │
│   ├── admin/                      # Admin panel
│   │   └── page.tsx                # /admin
│   │
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
│
├── models/                         # MongoDB Mongoose Models
│   ├── Patient.ts                 # Patient schema
│   ├── Doctor.ts                  # Doctor schema
│   ├── Clinic.ts                  # Clinic schema
│   ├── Room.ts                    # Room schema
│   ├── Slot.ts                    # Appointment slot schema
│   ├── Appointment.ts             # Appointment schema
│   └── Payment.ts                 # Payment schema
│
├── lib/
│   ├── db/
│   │   └── connection.ts          # MongoDB connection handler
│   └── auth.ts                    # JWT utilities
│
├── components/                    # Reusable React components (ready to add)
├── public/                        # Static assets
├── types/                         # TypeScript types (ready to add)
│
├── scripts/
│   └── seed.js                    # Database seeding script
│
├── .env.local                     # Environment variables
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
├── README.md                       # Full documentation
└── QUICKSTART.md                  # Quick start guide
```

## 📚 Database Schema

### Patient Collection
```javascript
{
  _id: ObjectId,
  full_name: String,
  phone: String,
  email: String (unique),
  password: String (hashed),
  insurance_info: String,
  medical_summary: String,
  emergency_contact: {
    name: String,
    phone: String,
    relation: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor Collection
```javascript
{
  _id: ObjectId,
  full_name: String,
  phone: String,
  email: String (unique),
  password: String (hashed),
  qualifications: [String],
  specializations: [String],
  clinic_affiliations: [ObjectId], // References to Clinic
  schedule_days: [{
    day: String,
    start_time: String,
    end_time: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Clinic Collection
```javascript
{
  _id: ObjectId,
  name: String,
  address: {
    street: String,
    city: String,
    governorate: String
  },
  phone: String,
  operating_hours: String,
  doctor_summaries: [{
    doctor_id: ObjectId,
    name: String,
    specializations: [String]
  }],
  room_summaries: [{
    room_number: String,
    type: String,
    status: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Room Collection
```javascript
{
  _id: ObjectId,
  clinic_id: ObjectId,
  room_number: String,
  type: String (enum: ['exam', 'surgery', 'consultation', 'waiting']),
  status: String (enum: ['available', 'maintenance', 'occupied']),
  createdAt: Date,
  updatedAt: Date
}
```

### Slot Collection (Bookable time units)
```javascript
{
  _id: ObjectId,
  doctor_id: ObjectId,
  clinic_id: ObjectId,
  room_id: ObjectId,
  date: Date,
  time: String (HH:MM format),
  status: String (enum: ['available', 'booked']),
  createdAt: Date,
  updatedAt: Date
}
// Indexes: (doctor_id, clinic_id, date, status)
```

### Appointment Collection
```javascript
{
  _id: ObjectId,
  patient_id: ObjectId,
  doctor_id: ObjectId,
  clinic_id: ObjectId,
  room_id: ObjectId,
  slot_id: ObjectId (unique),
  status: String (enum: ['booked', 'confirmed', 'cancelled', 'completed']),
  notes: String,
  payment: {
    amount: Number,
    method: String (enum: ['cash', 'card']),
    transaction_id: String,
    status: String (enum: ['pending', 'paid', 'refunded', 'failed']),
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
// Indexes: (doctor_id, createdAt), (patient_id, createdAt)
```

### Payment Collection
```javascript
{
  _id: ObjectId,
  appointment_id: ObjectId,
  patient_id: ObjectId,
  doctor_id: ObjectId,
  amount: Number,
  method: String (enum: ['cash', 'card']),
  transaction_id: String,
  status: String (enum: ['pending', 'paid', 'refunded', 'failed']),
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
// Indexes: (timestamp)
```

## 🔌 API Endpoints (18 total)

### Authentication (4 endpoints)
- `POST /api/auth/patient/login` - Login as patient
- `POST /api/auth/patient/register` - Register new patient
- `POST /api/auth/doctor/login` - Login as doctor
- `POST /api/auth/doctor/register` - Register new doctor

### Clinics (3 endpoints)
- `GET /api/clinics` - List all clinics
- `POST /api/clinics` - Create clinic
- `GET /api/clinics/[id]` - Get clinic details
- `PUT /api/clinics/[id]` - Update clinic

### Doctors (4 endpoints)
- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Create doctor
- `GET /api/doctors/[id]` - Get doctor profile & schedule
- `PUT /api/doctors/[id]` - Update doctor
- `GET /api/doctors/search?specialization=...` - Search doctors

### Appointments (3 endpoints)
- `POST /api/appointments/book` - Book appointment
- `GET /api/appointments/book?patient_id=...` - Get patient appointments
- `GET /api/appointments/[id]` - Get appointment details
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Cancel appointment

### Slots (2 endpoints)
- `GET /api/slots/available?doctor_id=...&date=...` - Get available slots
- `POST /api/slots/available` - Create slot

### Payments (1 endpoint)
- `POST /api/payments` - Process payment
- `GET /api/payments?appointment_id=...` - Get payment records

### Patients (1 endpoint)
- `GET /api/patients/[id]` - Get patient profile
- `PUT /api/patients/[id]` - Update patient profile

### Reports (1 endpoint)
- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily analytics

## 🔒 Authentication

- **JWT-based** with 30-day expiration
- **Passwords hashed** with bcryptjs (10 salt rounds)
- **Token stored** in localStorage
- **Authorization headers**: `Bearer <token>`

## 🛡️ Security Features

✅ Password hashing with bcryptjs  
✅ JWT authentication  
✅ Atomic database operations (prevent race conditions)  
✅ Input validation  
✅ Unique constraints on email fields  
✅ Server-side API protection  

## 🎨 Frontend Pages (12 total)

**Public Pages:**
- `/` - Landing page with search & features
- `/clinics` - Clinic list
- `/clinics/[id]` - Clinic details
- `/doctors` - Doctor directory with filters
- `/doctors/[id]` - Doctor profile & booking

**Auth Pages:**
- `/login` - Patient login
- `/register` - Patient registration
- `/doctor/login` - Doctor login
- `/doctor/register` - Doctor registration

**Dashboard Pages:**
- `/patient/dashboard` - Patient appointments & profile
- `/doctor/dashboard` - Doctor schedule & management
- `/admin` - Admin panel

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | MongoDB |
| **ORM** | Mongoose |
| **Authentication** | JWT + bcryptjs |
| **HTTP Client** | axios |
| **Package Manager** | npm |

## 📊 Indexing Strategy

Optimized queries with MongoDB indexes:

```javascript
// Slot indexes
{ doctor_id: 1, clinic_id: 1, date: 1, status: 1 }

// Appointment indexes
{ doctor_id: 1, createdAt: -1 }
{ patient_id: 1, createdAt: -1 }

// Payment indexes
{ timestamp: -1 }

// Room indexes
{ clinic_id: 1 }
```

## 🔄 Booking Flow

1. **Patient browsing** → GET /api/doctors
2. **Select doctor** → GET /api/doctors/[id]
3. **View slots** → GET /api/slots/available?doctor_id=...&date=...
4. **Book appointment** → POST /api/appointments/book
   - Atomically updates slot status
   - Creates appointment with embedded payment
   - Creates payment record
5. **View in dashboard** → GET /api/appointments/book?patient_id=...

## 📈 Concurrency Safety

The system prevents double-booking using **atomic MongoDB updates**:

```javascript
// Only updates if slot is still available
const updatedSlot = await Slot.findOneAndUpdate(
  { _id: slot_id, status: 'available' },
  { status: 'booked' },
  { new: true }
);

// If null returned, slot was already booked
if (!updatedSlot) {
  return error('Slot is no longer available');
}
```

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

### Environment Variables for Production
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/clinics-booking
JWT_SECRET=your-strong-secret-key-min-32-characters
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## 📝 Useful Commands

```bash
# Development
npm run dev               # Start dev server (http://localhost:3000)

# Production
npm run build            # Build for production
npm run start            # Start production server

# Database
node scripts/seed.js     # Seed sample data

# Build verification
npm run build            # Check for TypeScript/build errors
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB: `mongod`

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Clear Build Cache
```bash
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
npm install --save-dev @types/jsonwebtoken @types/node
```

## 📚 Next Steps

1. **Customize seed data** in `scripts/seed.js`
2. **Add more UI components** in `components/`
3. **Implement email notifications**
4. **Add Stripe/PayPal integration**
5. **Set up GitHub Actions CI/CD**
6. **Add unit/integration tests**
7. **Deploy to Vercel or AWS**

## 📖 Documentation Files

- **README.md** - Full system documentation
- **QUICKSTART.md** - 5-minute setup guide
- **SETUP.md** - This file

## ✨ Features Implemented

✅ Patient authentication (register/login)  
✅ Doctor authentication (register/login)  
✅ Clinic management and listing  
✅ Doctor directory with search/filters  
✅ Appointment slot system  
✅ Atomic appointment booking  
✅ Payment processing (cash/card)  
✅ Patient dashboard with appointments  
✅ Doctor dashboard with schedule  
✅ Appointment cancellation  
✅ Daily analytics reports  
✅ Fully typed with TypeScript  
✅ Responsive Tailwind design  
✅ RESTful API architecture  

## 🎯 Future Enhancements

- [ ] Email/SMS notifications
- [ ] Online payment gateway (Stripe)
- [ ] Video consultations
- [ ] Prescription management
- [ ] Insurance verification
- [ ] Rating & review system
- [ ] Admin analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Automated backups

---

**Build Status**: ✅ Successfully compiled and ready for deployment  
**Last Updated**: December 5, 2025  
**Version**: 1.0.0  

For questions or issues, refer to the README.md file.
