# Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up MongoDB

### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinics-booking?retryWrites=true&w=majority
```

## 3. Seed the Database
```bash
npm install dotenv
node scripts/seed.js
```

This will create:
- 3 sample clinics
- 3 sample doctors with schedules
- 6 examination rooms
- 168 appointment slots (for 7 days)
- 2 sample patients

**Test Accounts:**
- Patient Email: `ali.mohammed@email.com` | Password: `password123`
- Doctor Email: `ahmed.hassan@clinic.com` | Password: `password123`

## 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

## 5. Quick Test Flow

### As a Patient:
1. Go to http://localhost:3000
2. Click "Login" (or go to `/login`)
3. Register with email and password
4. Go to "Find a Doctor"
5. Select a doctor
6. Choose a date and available slot
7. Book appointment
8. View appointment in patient dashboard

### As a Doctor:
1. Go to http://localhost:3000/doctor/login
2. Register with email and password
3. Specialize in a field (e.g., "Cardiology")
4. View "Today's Schedule" in doctor dashboard
5. Manage your working hours

### Explore:
- Browse clinics: http://localhost:3000/clinics
- Search doctors: http://localhost:3000/doctors
- View clinic details: http://localhost:3000/clinics/[clinic-id]
- View doctor profile: http://localhost:3000/doctors/[doctor-id]

## API Endpoints to Test

Use Postman or curl to test:

### Patient Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@test.com","password":"pass123","phone":"123456789"}'

# Login
curl -X POST http://localhost:3000/api/auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Get Available Slots
```bash
curl "http://localhost:3000/api/slots/available?doctor_id=<doctor-id>&date=2025-12-10"
```

### Book Appointment
```bash
curl -X POST http://localhost:3000/api/appointments/book \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id":"<patient-id>",
    "doctor_id":"<doctor-id>",
    "clinic_id":"<clinic-id>",
    "slot_id":"<slot-id>",
    "room_id":"<room-id>",
    "payment_amount":100,
    "payment_method":"cash"
  }'
```

### Get Daily Report
```bash
curl "http://localhost:3000/api/reports/daily?date=2025-12-05"
```

## Project Structure Overview

```
app/                          # Next.js App Router
├── api/                      # REST API routes
│   ├── auth/                # Login/Register
│   ├── appointments/        # Booking
│   ├── clinics/             # Clinic CRUD
│   ├── doctors/             # Doctor management
│   ├── slots/               # Availability
│   └── payments/            # Transactions
├── clinics/                 # Public clinic pages
├── doctors/                 # Public doctor directory
├── login/ & register/       # Auth pages
├── patient/ & doctor/       # Dashboards
└── page.tsx                 # Home page

models/                       # MongoDB schemas
├── Patient.ts
├── Doctor.ts
├── Clinic.ts
├── Room.ts
├── Slot.ts
├── Appointment.ts
└── Payment.ts

lib/
├── db/connection.ts         # MongoDB connection
└── auth.ts                  # JWT utilities
```

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running
```bash
mongod
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Port Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

## Environment Variables

Create `.env.local`:
```
# Database
MONGODB_URI=mongodb://localhost:27017/clinics-booking

# JWT
JWT_SECRET=your-secure-secret-key-change-in-production

# Public API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Next Steps

1. **Customize the seed data** in `scripts/seed.js`
2. **Add more UI components** in `components/`
3. **Implement email notifications**
4. **Add payment gateway integration**
5. **Deploy to Vercel or your hosting provider**

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Happy coding! 🚀
