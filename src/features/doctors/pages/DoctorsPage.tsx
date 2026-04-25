import { useDeferredValue, useEffect, useState } from "react";
import { DoctorCard } from "../components/DoctorCard";
import { useDoctors } from "../hooks/useDoctors";
import { Button } from "../../../shared/components/ui/Button";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { Input } from "../../../shared/components/ui/Input";
import { PageHeader } from "../../../shared/components/ui/PageHeader";
import { Select } from "../../../shared/components/ui/Select";
import { DoctorCardSkeleton } from "../../../shared/components/ui/Skeleton";
import { doctorSpecializations } from "../../../shared/constants/specializations";

export function DoctorsPage() {
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [minRating, setMinRating] = useState("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const deferredSearch = useDeferredValue(search);
  const { doctors, error, isLoading, pagination } = useDoctors({
    availabilityDate: availabilityDate || undefined,
    minRating: minRating === "All" ? undefined : Number(minRating),
    page,
    pageSize: 6,
    search: deferredSearch || undefined,
    specialization: specialization === "All" ? undefined : specialization,
  });

  useEffect(() => {
    setPage(1);
  }, [availabilityDate, deferredSearch, minRating, specialization]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Doctor Directory"
        title="Find care that matches the way you want to be supported"
        description="Search by name, filter by specialty or rating, narrow by availability, and move through paginated results without overloading the page."
      />

      <div className="panel grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
        <Input
          label="Search by doctor name"
          placeholder="Search doctors"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
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
        <Select
          label="Minimum rating"
          value={minRating}
          onChange={(event) => setMinRating(event.target.value)}
        >
          <option value="All">Any rating</option>
          <option value="4.5">4.5 and above</option>
          <option value="4.8">4.8 and above</option>
        </Select>
        <Input
          label="Availability date"
          type="date"
          value={availabilityDate}
          onChange={(event) => setAvailabilityDate(event.target.value)}
        />
        <div className="flex items-end">
          <Button
            fullWidth
            variant="ghost"
            onClick={() => {
              setAvailabilityDate("");
              setMinRating("All");
              setSearch("");
              setSpecialization("All");
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <DoctorCardSkeleton key={index} />
          ))}
        </div>
      ) : doctors.length ? (
        <>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              Showing {(pagination.page - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
              {pagination.total} doctors
            </p>
            <p>{availabilityDate ? "Availability filter applied" : "Showing all availability"}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              disabled={pagination.page === 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <EmptyState
          title="No doctors found"
          description="Try broadening the filters or clearing the availability date to see more doctors."
        />
      )}
    </div>
  );
}
