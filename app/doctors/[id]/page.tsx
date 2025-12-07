"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Chip from '../../../components/Chip';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Spinner from '../../../components/Spinner';
import Alert from '../../../components/Alert';

interface Doctor {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  specializations: string[];
  qualifications?: string[];
  clinic_affiliations?: any[];
}

interface Slot {
  _id: string;
  time: string;
  date: string;
  room_id: any;
}
interface AuthUser {
  id: string;
  role: 'patient' | 'doctor';
  full_name: string;
  email: string;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);


  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (!cancelled) setUser(null);
      }

      if (id) {
        await fetchDoctor();
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [id]);


  const fetchDoctor = async () => {
    try {
      const response = await fetch(`/api/doctors/${id}`);
      const data = await response.json();
      setDoctor(data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);

    if (date) {
      await fetchSlots(date);
    }
  };

  const fetchSlots = async (date: string) => {
    try {
      setLoadingSlots(true);
      const response = await fetch(
        `/api/slots/available?doctor_id=${id}&date=${date}`
      );
      const data = await response.json();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setBookingError('Please select a slot first');
      return;
    }

    if (!user || user.role !== 'patient') {
      setBookingError('You must be logged in as a patient to book an appointment');
      return;
    }

    if (!selectedDate) {
      setBookingError('Please select a date');
      return;
    }

    const slot = slots.find((s) => s._id === selectedSlot);
    if (!slot) return;

    try {
      setBookingError('');
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 🔑 send auth cookie
        body: JSON.stringify({
          doctor_id: id,
          clinic_id: doctor?.clinic_affiliations?.[0]?._id || '',
          slot_id: selectedSlot,
          room_id: slot.room_id._id,
          payment_amount: 100,
          payment_method: 'cash',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setBookingError(data.error || 'Booking failed');
        return;
      }

      router.push('/patient/dashboard');
    } catch (error: any) {
      setBookingError(error.message || 'An error occurred');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12 text-indigo-600" />
          <p className="text-slate-600 font-medium">Loading doctor profile...</p>
        </div>
      </div>
    );
  }
  if (!doctor) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-5xl">👨‍⚕️</p>
          <p className="text-slate-600 text-lg font-medium">Doctor not found</p>
          <Link href="/doctors">
            <Button>Back to Doctors</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
      <div className="site-container py-16 lg:py-24">
        {/* Breadcrumb */}
        <Link href="/doctors" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition-colors">
          <span className="mr-2">←</span> Back to Doctors
        </Link>

        {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 lg:p-12 space-y-6 mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-5xl shrink-0 border-4 border-indigo-200">
              👨‍⚕️
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">Dr. {doctor.full_name}</h1>
                <div className="flex flex-wrap gap-2 mt-4">
                  {doctor.specializations.map((spec, idx) => (
                    <Chip key={idx} className="text-sm" href={`/doctors?specialization=${encodeURIComponent(spec)}`}>{spec}</Chip>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Email</p>
                  <p className="text-slate-800 font-semibold">{doctor.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Phone</p>
                  <a href={`tel:${doctor.phone}`} className="text-indigo-600 font-semibold hover:text-indigo-700 underline">
                    {doctor.phone}
                  </a>
                </div>
              </div>

              {/* Qualifications */}
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs mb-2">Qualifications</p>
                  <ul className="space-y-1">
                    {doctor.qualifications.map((qual, idx) => (
                      <li key={idx} className="text-slate-700 flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">✓</span>
                        <span className="font-medium">{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinic Affiliations */}
              {doctor.clinic_affiliations && doctor.clinic_affiliations.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs mb-2">Clinic Affiliations</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.clinic_affiliations.map((clinic: any, idx: number) => (
                      clinic._id ? (
                        <Chip key={idx} href={`/clinics/${clinic._id}`} className="text-xs">🏥 {clinic.name || 'Clinic'}</Chip>
                      ) : (
                        <Chip key={idx} className="text-xs">🏥 {clinic.name || 'Clinic'}</Chip>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden lg:flex lg:items-start lg:pl-6">
              <button
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-lg px-5 py-3 bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Appointment Booking */}
          <Card id="booking" className="lg:col-span-2 p-8 space-y-8 border border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Book an Appointment</h2>
              <p className="text-slate-600">Schedule your consultation with Dr. {doctor.full_name}</p>
            </div>

            {!user && (
              <Alert type="warning">
                <span className="font-semibold">Login Required</span>
                <p className="text-sm mt-1">Please <Link href="/login" className="underline font-semibold">login</Link> to book an appointment</p>
              </Alert>
            )}

            {bookingError && (
              <Alert type="error">{bookingError}</Alert>
            )}

            <div className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-3">
                <label htmlFor="date" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Select Date</label>
                <input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 font-medium"
                />
              </div>

              {/* Slots Section */}
              {selectedDate && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Available Time Slots</label>
                  {loadingSlots ? (
                    <div className="py-8 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner className="h-8 w-8 text-indigo-600" />
                        <p className="text-sm text-slate-600">Loading available slots...</p>
                      </div>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center space-y-2">
                      <p className="text-slate-600 font-medium">No slots available for this date</p>
                      <p className="text-sm text-slate-500">Try selecting a different date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setSelectedSlot(slot._id)}
                          className={`p-3 rounded-lg border-2 transition-all text-center font-semibold ${
                            selectedSlot === slot._id
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                              : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                        >
                          <div className="text-base">{slot.time}</div>
                          <div className={`text-xs mt-1 ${selectedSlot === slot._id ? 'text-indigo-100' : 'text-slate-500'}`}>
                            Room {slot.room_id.room_number}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Booking Button */}
              <Button
                onClick={handleBookAppointment}
                disabled={!selectedSlot || !user}
                className="w-full py-4 text-lg font-bold"
              >
                {!user ? '👤 Login to Book' : !selectedSlot ? '📅 Select a Date & Time' : '✓ Confirm Booking'}
              </Button>
            </div>
          </Card>

          {/* Right Column - Summary */}
          <Card className="p-8 space-y-6 border border-slate-100 h-fit sticky top-24">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Booking Summary</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wide">Doctor</p>
                  <p className="text-slate-900 font-bold">Dr. {doctor.full_name}</p>
                </div>

                {selectedDate && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-wide">Appointment Date</p>
                    <p className="text-slate-900 font-bold">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}

                {selectedSlot && slots.find(s => s._id === selectedSlot) && (
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <p className="text-slate-500 font-medium text-xs uppercase tracking-wide">Time Slot</p>
                    <p className="text-slate-900 font-bold text-lg">
                      {slots.find(s => s._id === selectedSlot)?.time}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wide">Consultation Fee</p>
                  <p className="text-2xl font-bold text-indigo-600">$100</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">💳 Pay at clinic after consultation</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
