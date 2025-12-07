# Clinics Booking System

A full-stack web application for managing clinic bookings, appointments, and doctor availability. Built with **Next.js**, **TypeScript**, **MongoDB**, and **Tailwind CSS**.

## Features

- 🏥 **Clinic Management** - Browse clinics with detailed information
- 👨‍⚕️ **Doctor Directory** - Search and filter doctors by specialization
- 📅 **Appointment Booking** - Book appointments with available time slots
- 💳 **Payment Processing** - Secure payment tracking (cash/card)
- 📊 **Dashboards** - Patient and doctor personal dashboards
- 🔐 **Authentication** - Secure login/registration for patients and doctors
- 📈 **Reports** - Daily and weekly analytics

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **Password Security**: bcryptjs

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── appointments/      # Appointment booking APIs
│   │   ├── clinics/           # Clinic management APIs
│   │   ├── doctors/           # Doctor search APIs
│   │   ├── payments/          # Payment processing APIs
│   │   ├── patients/          # Patient profile APIs
│   │   ├── reports/           # Analytics reports APIs
│   │   └── slots/             # Slot availability APIs
│   ├── clinics/               # Clinics listing and details pages
│   ├── doctors/               # Doctor directory pages
│   ├── patient/               # Patient dashboard
│   ├── doctor/                # Doctor dashboard
│   ├── admin/                 # Admin pages
│   ├── login/                 # Patient login
│   ├── register/              # Patient registration
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/                # Reusable React components
├── lib/
│   ├── db/
│   │   └── connection.ts      # MongoDB connection
│   └── auth.ts                # JWT utilities
├── models/                    # Mongoose schemas
│   ├── Patient.ts
│   ├── Doctor.ts
│   ├── Clinic.ts
│   ├── Room.ts
│   ├── Slot.ts
│   ├── Appointment.ts
│   └── Payment.ts
├── types/                     # TypeScript type definitions
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── postcss.config.js
```

## Database Models

### Patient
- full_name, phone, email, password (hashed)
- insurance_info, medical_summary
- emergency_contact (name, phone, relation)

### Doctor
- full_name, phone, email, password (hashed)
- qualifications, specializations
- clinic_affiliations, schedule_days

### Clinic
- name, address (street, city, governorate)
- phone, operating_hours
- doctor_summaries, room_summaries

### Room
- clinic_id (reference), room_number, type, status

### Slot
- doctor_id, clinic_id, room_id
- date, time, status (available/booked)

### Appointment
- patient_id, doctor_id, clinic_id, room_id, slot_id
- status (booked/confirmed/cancelled/completed)
- embedded payment object

### Payment
- appointment_id, patient_id, doctor_id
- amount, method (cash/card), transaction_id
- status (pending/paid/refunded/failed)

## Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud instance)

### Setup Steps

1. **Clone and install dependencies**
   ```bash
   cd ClincsManagmentSystem
   npm install
   ```

2. **Configure environment variables**
   Create `.env.local` with:
   ```
   MONGODB_URI=mongodb://localhost:27017/clinics-booking
   JWT_SECRET=your-secret-key-here
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Home: http://localhost:3000
   - Patient Login: http://localhost:3000/login
   - Doctor Login: http://localhost:3000/doctor/login

## API Endpoints

### Authentication
- `POST /api/auth/patient/register` - Patient registration
- `POST /api/auth/patient/login` - Patient login
- `POST /api/auth/doctor/register` - Doctor registration
- `POST /api/auth/doctor/login` - Doctor login

### Clinics
- `GET /api/clinics` - List all clinics
- `GET /api/clinics/[id]` - Get clinic details
- `POST /api/clinics` - Create clinic (admin)

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/[id]` - Get doctor profile
- `GET /api/doctors/search?specialization=...` - Search doctors
- `PUT /api/doctors/[id]` - Update doctor profile

### Slots
- `GET /api/slots/available?doctor_id=...&date=...` - Get available slots
- `POST /api/slots/available` - Create slot (admin)

### Appointments
- `POST /api/appointments/book` - Book appointment
- `GET /api/appointments/book?patient_id=...` - Get patient appointments
- `GET /api/appointments/[id]` - Get appointment details
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Cancel appointment

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments?appointment_id=...` - Get payment records

### Reports
- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily report

## User Flows

### Patient Flow
1. Register/Login → Patient Dashboard
2. Browse Doctors → Select Doctor
3. View Available Slots → Book Appointment
4. Process Payment → Appointment Confirmed
5. View Appointments & History in Dashboard

### Doctor Flow
1. Register/Login → Doctor Dashboard
2. View Today's Schedule
3. Manage Working Hours
4. View Patient Details

## Key Features Implementation

### Concurrency Safety
- Atomic slot status updates prevent double-booking
- Uses MongoDB atomic operations: `findOneAndUpdate` with status check

### Authentication
- JWT-based with 30-day expiration
- Password hashing with bcryptjs (10 salt rounds)
- Token stored in localStorage

### Data Validation
- MongoDB Mongoose schema validation
- API request validation
- Email uniqueness constraints

## Future Enhancements

- [ ] Email notifications for appointments
- [ ] SMS reminder system
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Video consultation support
- [ ] Prescription management
- [ ] Insurance verification
- [ ] Rating and review system
- [ ] Admin analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

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

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env.local`
- Verify network access if using MongoDB Atlas

### Authentication Problems
- Clear localStorage and login again
- Verify JWT_SECRET matches between login/verification
- Check token expiration

### Slot Booking Conflicts
- Verify slot status before booking
- Check database indexes are created
- Look for race conditions in concurrent requests

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the ISC License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/AnonyBOSS/ClincsManagmentSystem/issues)
- Email: support@clinicsbooking.com

---

Built with ❤️ for healthcare booking solutions.
