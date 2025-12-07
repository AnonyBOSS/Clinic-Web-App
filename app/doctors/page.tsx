"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

type DoctorClinic = {
  _id: string;
  name: string;
  city?: string;
};

type Doctor = {
  _id: string;
  full_name: string;
  specializations?: string[];
  years_of_experience?: number;
  clinic?: DoctorClinic;
  bio?: string;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDoctors() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/doctors", { method: "GET" });
        const data = await res.json();

        if (cancelled) return;

        if (res.ok && Array.isArray(data)) {
          setDoctors(data);
        } else if (res.ok && Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        } else {
          setError("Failed to load doctors.");
        }
      } catch (err) {
        console.error("Error loading doctors:", err);
        if (!cancelled) setError("Failed to load doctors.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDoctors();
    return () => {
      cancelled = true;
    };
  }, []);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => d.specializations?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch =
        !search ||
        doctor.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (doctor.clinic?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (doctor.clinic?.city || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSpecialty =
        !specialtyFilter ||
        doctor.specializations?.includes(specialtyFilter);

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialtyFilter]);

  return (
    <main className="site-container py-10 space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-1">Find a doctor</h1>
          <p className="text-sm text-slate-500">
            Search for specialists by name, clinic, or city and book the right
            doctor for your visit.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            placeholder="Search by doctor or clinic..."
            className="form-input max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">
              Specialization
            </label>
            <select
              className="form-input max-w-xs"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="">All</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section>
        {loading ? (
          <div className="card">
            <p>Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="card">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="card">
            <p className="text-sm text-slate-500">
              No doctors match your filters. Try a different name, clinic, or
              specialization.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <article
                key={doctor._id}
                className="card flex flex-col gap-3 bg-gradient-to-b from-white to-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {doctor.full_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {doctor.specializations?.join(" • ") || "General doctor"}
                    </p>
                  </div>
                  {doctor.years_of_experience != null && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      {doctor.years_of_experience}+ yrs exp.
                    </span>
                  )}
                </div>

                {doctor.clinic && (
                  <p className="text-xs text-slate-500">
                    {doctor.clinic.name}
                    {doctor.clinic.city ? ` • ${doctor.clinic.city}` : ""}
                  </p>
                )}

                {doctor.bio && (
                  <p className="text-xs text-slate-500 line-clamp-3">
                    {doctor.bio}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    <p>Available slots shown at booking.</p>
                  </div>
                  <Link href={`/doctors/${doctor._id}`}>
                    <Button variant="primary" size="sm">
                      View profile
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
