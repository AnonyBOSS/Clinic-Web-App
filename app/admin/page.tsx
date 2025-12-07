'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/clinics">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">Manage Clinics</h2>
            <p className="text-gray-600">Create, update, and manage clinics</p>
          </div>
        </Link>

        <Link href="/admin/doctors">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">Manage Doctors</h2>
            <p className="text-gray-600">Create and manage doctor profiles</p>
          </div>
        </Link>

        <Link href="/admin/rooms">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">Manage Rooms</h2>
            <p className="text-gray-600">Add and manage clinic rooms</p>
          </div>
        </Link>

        <Link href="/admin/reports">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">Reports</h2>
            <p className="text-gray-600">View daily and weekly reports</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
