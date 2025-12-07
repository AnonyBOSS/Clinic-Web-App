"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

type Clinic = {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  specializations?: string[];
  description?: string;
};

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadClinics() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/clinics", { method: "GET" });
        const data = await res.json();

        if (cancelled) return;

        if (res.ok && Array.isArray(data)) {
          setClinics(data);
        } else if (res.ok && Array.isArray(data.clinics)) {
          setClinics(data.clinics);
        } else {
          setError("Failed to load clinics.");
        }
      } catch (err) {
        console.error("Error loading clinics:", err);
        if (!cancelled) setError("Failed to load clinics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadClinics();
    return () => {
      cancelled = true;
    };
  }, []);

  const specialties = useMemo(() => {
    const set = new Set<string>();
    clinics.forEach((c) => {
      c.specializations?.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    return clinics.filter((clinic) => {
      const matchesSearch =
        !search ||
        clinic.name.toLowerCase().includes(search.toLowerCase()) ||
        (clinic.city || "").toLowerCase().includes(search.toLowerCase()) ||
        (clinic.address || "").toLowerCase().includes(search.toLowerCase());

      const matchesSpecialty =
        !specialtyFilter ||
        clinic.specializations?.includes(specialtyFilter);

      return matchesSearch && matchesSpecialty;
    });
  }, [clinics, search, specialtyFilter]);

  return (
    <main className="site-container py-10 space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-1">Find a clinic</h1>
          <p className="text-sm text-slate-500">
            Search clinics by name, location, or specialization and book an
            appointment in a few clicks.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by name or city..."
              className="form-input max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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
            <p>Loading clinics...</p>
          </div>
        ) : error ? (
          <div className="card">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="card">
            <p className="text-sm text-slate-500">
              No clinics match your filters. Try removing some filters or
              searching in another area.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredClinics.map((clinic) => (
              <article
                key={clinic._id}
                className="card flex flex-col gap-3 bg-gradient-to-b from-white to-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {clinic.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {clinic.city || ""}{" "}
                      {clinic.city && clinic.address ? "•" : ""}
                      {clinic.address || ""}
                    </p>
                  </div>
                </div>

                {clinic.specializations && clinic.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {clinic.specializations.slice(0, 4).map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700"
                      >
                        {spec}
                      </span>
                    ))}
                    {clinic.specializations.length > 4 && (
                      <span className="text-[11px] text-slate-500">
                        +{clinic.specializations.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {clinic.description && (
                  <p className="text-xs text-slate-500 line-clamp-3">
                    {clinic.description}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {clinic.phone && <p>Phone: {clinic.phone}</p>}
                  </div>

                  <Link href={`/clinics/${clinic._id}`}>
                    <Button variant="primary" size="sm">
                      View details
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
