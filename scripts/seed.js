/**
 * Seed script to populate database with sample data
 * Run: node scripts/seed.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Models
const Patient = require('../models/Patient').default;
const Doctor = require('../models/Doctor').default;
const Clinic = require('../models/Clinic').default;
const Room = require('../models/Room').default;
const Slot = require('../models/Slot').default;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinics-booking';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Clinic.deleteMany({}),
      Room.deleteMany({}),
      Slot.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create sample clinics
    const clinics = await Clinic.insertMany([
      {
        name: 'Central Medical Clinic',
        address: {
          street: '123 Main St',
          city: 'Cairo',
          governorate: 'Cairo',
        },
        phone: '+20-123-456-789',
        operating_hours: '8:00 AM - 8:00 PM',
      },
      {
        name: 'Elite Health Center',
        address: {
          street: '456 Nile Ave',
          city: 'Giza',
          governorate: 'Giza',
        },
        phone: '+20-987-654-321',
        operating_hours: '7:00 AM - 9:00 PM',
      },
      {
        name: 'Wellness Medical Complex',
        address: {
          street: '789 Health Blvd',
          city: 'Alexandria',
          governorate: 'Alexandria',
        },
        phone: '+20-555-666-777',
        operating_hours: '8:00 AM - 7:00 PM',
      },
    ]);
    console.log('Created 3 clinics');

    // Create sample doctors
    const doctors = await Doctor.insertMany([
      {
        full_name: 'Dr. Ahmed Hassan',
        email: 'ahmed.hassan@clinic.com',
        password: 'password123', // Will be hashed by schema pre-hook
        phone: '+20-100-111-222',
        specializations: ['Cardiology', 'Internal Medicine'],
        qualifications: ['MD', 'Board Certified Cardiology'],
        clinic_affiliations: [clinics[0]._id],
        schedule_days: [
          { day: 'Saturday', start_time: '09:00', end_time: '17:00' },
          { day: 'Sunday', start_time: '09:00', end_time: '17:00' },
          { day: 'Monday', start_time: '09:00', end_time: '17:00' },
          { day: 'Tuesday', start_time: '09:00', end_time: '17:00' },
          { day: 'Wednesday', start_time: '09:00', end_time: '17:00' },
        ],
      },
      {
        full_name: 'Dr. Fatima Al-Rashid',
        email: 'fatima.rashid@clinic.com',
        password: 'password123',
        phone: '+20-100-222-333',
        specializations: ['Pediatrics', 'Family Medicine'],
        qualifications: ['MD', 'Pediatric Specialist'],
        clinic_affiliations: [clinics[1]._id],
        schedule_days: [
          { day: 'Saturday', start_time: '08:00', end_time: '16:00' },
          { day: 'Sunday', start_time: '08:00', end_time: '16:00' },
          { day: 'Tuesday', start_time: '08:00', end_time: '16:00' },
          { day: 'Wednesday', start_time: '08:00', end_time: '16:00' },
          { day: 'Thursday', start_time: '08:00', end_time: '16:00' },
        ],
      },
      {
        full_name: 'Dr. Mohamed Karim',
        email: 'mohamed.karim@clinic.com',
        password: 'password123',
        phone: '+20-100-333-444',
        specializations: ['Orthopedic Surgery', 'Sports Medicine'],
        qualifications: ['MD', 'Board Certified Orthopedics'],
        clinic_affiliations: [clinics[2]._id],
        schedule_days: [
          { day: 'Monday', start_time: '10:00', end_time: '18:00' },
          { day: 'Wednesday', start_time: '10:00', end_time: '18:00' },
          { day: 'Thursday', start_time: '10:00', end_time: '18:00' },
          { day: 'Friday', start_time: '10:00', end_time: '18:00' },
        ],
      },
    ]);
    console.log('Created 3 doctors');

    // Create sample rooms
    const rooms = await Room.insertMany([
      { clinic_id: clinics[0]._id, room_number: '101', type: 'exam', status: 'available' },
      { clinic_id: clinics[0]._id, room_number: '102', type: 'consultation', status: 'available' },
      { clinic_id: clinics[1]._id, room_number: '201', type: 'exam', status: 'available' },
      { clinic_id: clinics[1]._id, room_number: '202', type: 'surgery', status: 'available' },
      { clinic_id: clinics[2]._id, room_number: '301', type: 'exam', status: 'available' },
      { clinic_id: clinics[2]._id, room_number: '302', type: 'consultation', status: 'available' },
    ]);
    console.log('Created 6 rooms');

    // Create sample slots for the next 7 days
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
      const slotDate = new Date(today);
      slotDate.setDate(slotDate.getDate() + daysAhead);

      // Create slots for each doctor
      for (let hour = 9; hour < 17; hour++) {
        slots.push({
          doctor_id: doctors[0]._id,
          clinic_id: clinics[0]._id,
          room_id: rooms[0]._id,
          date: slotDate,
          time: `${hour.toString().padStart(2, '0')}:00`,
          status: 'available',
        });
      }

      for (let hour = 8; hour < 16; hour++) {
        slots.push({
          doctor_id: doctors[1]._id,
          clinic_id: clinics[1]._id,
          room_id: rooms[2]._id,
          date: slotDate,
          time: `${hour.toString().padStart(2, '0')}:00`,
          status: 'available',
        });
      }

      for (let hour = 10; hour < 18; hour++) {
        slots.push({
          doctor_id: doctors[2]._id,
          clinic_id: clinics[2]._id,
          room_id: rooms[4]._id,
          date: slotDate,
          time: `${hour.toString().padStart(2, '0')}:00`,
          status: 'available',
        });
      }
    }

    await Slot.insertMany(slots);
    console.log('Created 168 slots');

    // Create sample patients
    const patients = await Patient.insertMany([
      {
        full_name: 'Ali Mohammed',
        email: 'ali.mohammed@email.com',
        password: 'password123',
        phone: '+20-100-444-555',
        insurance_info: 'AXA Insurance',
        medical_summary: 'No known allergies',
        emergency_contact: {
          name: 'Layla Mohammed',
          phone: '+20-100-555-666',
          relation: 'Sister',
        },
      },
      {
        full_name: 'Noor Ahmed',
        email: 'noor.ahmed@email.com',
        password: 'password123',
        phone: '+20-100-666-777',
        insurance_info: 'AIG Egypt',
        medical_summary: 'Has asthma',
        emergency_contact: {
          name: 'Hassan Ahmed',
          phone: '+20-100-777-888',
          relation: 'Father',
        },
      },
    ]);
    console.log('Created 2 patients');

    // Update clinics with doctor and room summaries
    for (const clinic of clinics) {
      const clinicDoctors = doctors.filter((d) =>
        d.clinic_affiliations.some((id) => id.equals(clinic._id))
      );
      const clinicRooms = rooms.filter((r) => r.clinic_id.equals(clinic._id));

      await Clinic.updateOne(
        { _id: clinic._id },
        {
          doctor_summaries: clinicDoctors.map((d) => ({
            doctor_id: d._id,
            name: d.full_name,
            specializations: d.specializations,
          })),
          room_summaries: clinicRooms.map((r) => ({
            room_number: r.room_number,
            type: r.type,
            status: r.status,
          })),
        }
      );
    }
    console.log('Updated clinic summaries');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Patient:');
    console.log('  Email: ali.mohammed@email.com');
    console.log('  Password: password123');
    console.log('\nDoctor:');
    console.log('  Email: ahmed.hassan@clinic.com');
    console.log('  Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
