"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Chip from '../../../components/Chip';
import Card from '../../../components/Card';
import Spinner from '../../../components/Spinner';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';

interface Clinic {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    governorate: string;
  };
  phone: string;
  operating_hours: string;
  doctor_summaries?: any[];
  room_summaries?: any[];
}

export default function ClinicDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchClinic();
    }
  }, [id]);

  const fetchClinic = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clinics/${id}`);
      if (!response.ok) throw new Error('Failed to fetch clinic');
      const data = await response.json();
      setClinic(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching clinic');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12 text-indigo-600" />
          <p className="text-slate-600 font-medium">Loading clinic details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-5xl">⚠️</p>
          <p className="text-red-700 text-lg font-medium">{error}</p>
          <Link href="/clinics">
            <Button>Back to Clinics</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-5xl">🏥</p>
          <p className="text-slate-600 text-lg font-medium">Clinic not found</p>
          <Link href="/clinics">
            <Button>Back to Clinics</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50">
        <div className="site-container py-16 lg:py-24">
        {/* Breadcrumb */}
        <Link href="/clinics" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold mb-8 transition-colors">
          <span className="mr-2">←</span> Back to Clinics
        </Link>

        {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 lg:p-12 space-y-6 mb-12">
          <div className="flex items-start gap-8 justify-between">
            {/* Clinic Icon */}
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-5xl shrink-0 border-2 border-indigo-200">
              🏥
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">{clinic.name}</h1>
                <p className="text-slate-600 mt-2 text-lg">Professional Healthcare Facility</p>
              </div>

              {/* Key Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Operating Hours</p>
                  <p className="text-slate-900 font-bold text-sm">{clinic.operating_hours}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Phone</p>
                  <a href={`tel:${clinic.phone}`} className="text-indigo-600 font-bold text-sm hover:text-indigo-700 underline">
                    {clinic.phone}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">City</p>
                  <p className="text-slate-900 font-bold text-sm">{clinic.address.city}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Region</p>
                  <p className="text-slate-900 font-bold text-sm">{clinic.address.governorate}</p>
                </div>
              </div>

              {/* Address */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Full Address</p>
                <p className="text-slate-800 text-base leading-relaxed flex items-start gap-2">
                  <span>📍</span>
                  <span>{clinic.address.street}, {clinic.address.city}, {clinic.address.governorate}</span>
                </p>
              </div>
            </div>
            
            {/* Primary CTA */}
            <div className="hidden lg:flex lg:items-start lg:pl-6">
              <Link href={`/doctors?clinic=${clinic._id}`}>
                <Button variant="primary" size="lg" className="rounded-lg">Book Appointment</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rooms Section */}
            <Card className="p-8 border border-slate-100">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Consultation Rooms</h2>
                  <p className="text-slate-600">Equipped and ready for patient consultations</p>
                </div>

                {clinic.room_summaries && clinic.room_summaries.length > 0 ? (
                  <div className="space-y-3">
                    {clinic.room_summaries.map((room: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                            🏥
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">Room {room.room_number}</div>
                            <div className="text-sm text-slate-500 capitalize">{room.type}</div>
                          </div>
                        </div>
                        <Badge variant="gray">{room.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 font-medium">No rooms available</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Doctors Section */}
            <Card className="p-8 border border-slate-100">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Our Doctors</h2>
                  <p className="text-slate-600">Experienced healthcare professionals at this clinic</p>
                </div>

                {clinic.doctor_summaries && clinic.doctor_summaries.length > 0 ? (
                  <div className="space-y-3">
                    {clinic.doctor_summaries.map((doc: any, idx: number) => (
                      <Link key={idx} href={`/doctors/${doc._id}`} className="group block">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                              👨‍⚕️
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 group-hover:text-indigo-600">Dr. {doc.name}</div>
                              <div className="text-sm text-slate-500 line-clamp-1">{(doc.specializations || []).join(', ') || 'General Practice'}</div>
                            </div>
                          </div>
                          <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-600 font-medium">No doctors available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <Card className="p-8 border border-slate-100 sticky top-24 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/doctors" className="block">
                    <Button className="w-full" variant="primary">
                      <span className="mr-2">👨‍⚕️</span> Browse All Doctors
                    </Button>
                  </Link>
                  <a href={`tel:${clinic.phone}`} className="block">
                    <Button className="w-full" variant="secondary">
                      <span className="mr-2">📞</span> Call Clinic
                    </Button>
                  </a>
                  <Link href={`/doctors?clinic=${clinic._id}`} className="block">
                    <Button className="w-full" variant="primary">
                      <span className="mr-2">📅</span> Book Appointment
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Clinic Stats */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div>
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs mb-2">Total Rooms</p>
                  <p className="text-3xl font-bold text-indigo-600">{clinic.room_summaries?.length || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium uppercase tracking-wide text-xs mb-2">Doctors</p>
                  <p className="text-3xl font-bold text-indigo-600">{clinic.doctor_summaries?.length || 0}</p>
                </div>
              </div>

              {/* Hours Info */}
              <div className="pt-6 border-t border-slate-100 space-y-2 bg-indigo-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-indigo-900">🕐 Operating Hours</p>
                <p className="text-sm text-indigo-800 leading-relaxed">{clinic.operating_hours}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
