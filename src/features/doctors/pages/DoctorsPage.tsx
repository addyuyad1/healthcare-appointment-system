import { useState } from "react";
import { DoctorCard } from "../components/DoctorCard";
import { useDoctors } from "../hooks/useDoctors";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { PageHeader } from "../../../shared/components/ui/PageHeader";
import { Select } from "../../../shared/components/ui/Select";
import { doctorSpecializations } from "../../../shared/constants/specializations";

export function DoctorsPage() {
  const [specialization, setSpecialization] = useState("All");
  const { doctors, error, isLoading } = useDoctors(specialization);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Doctor Directory"
        title="Find care that matches the way you want to be supported"
        description="Explore available doctors, filter by specialty, and open a profile to review availability, pricing, and qualifications."
        action={
          <div className="min-w-[240px]">
            <Select
              label="Specialization"
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
            >
              <option value="All">All specializations</option>
              {doctorSpecializations.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="panel p-8 text-sm text-slate-600">Loading doctors...</div>
      ) : doctors.length ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No doctors found"
          description="Try a different specialization filter to see more available clinicians."
        />
      )}
    </div>
  );
}
