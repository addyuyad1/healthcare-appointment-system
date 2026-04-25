import { Link, useParams } from "react-router-dom";
import { BookingForm } from "../../appointments/components/BookingForm";
import { useDoctor } from "../hooks/useDoctors";
import { useAuth } from "../../auth/hooks/useAuth";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { formatCurrency, getInitials } from "../../../shared/utils/format";

export function DoctorProfilePage() {
  const { doctorId } = useParams();
  const { doctor, error, isLoading } = useDoctor(doctorId);
  const { user } = useAuth();

  if (isLoading) {
    return <div className="panel p-8 text-sm text-slate-600">Loading profile...</div>;
  }

  if (!doctor || error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
        {error ?? "Doctor profile could not be loaded."}
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-8">
        <Card className="border-white/80 bg-white/95">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-100 text-2xl font-semibold text-brand-700">
              {getInitials(doctor.name)}
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold text-slate-950">
                    {doctor.name}
                  </h1>
                  <Badge tone="success">{doctor.specialization}</Badge>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  {doctor.about}
                </p>
              </div>

              <div className="grid gap-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Experience</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {doctor.experienceYears} years
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fee</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatCurrency(doctor.consultationFee)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rating</p>
                  <p className="mt-1 font-semibold text-slate-900">{doctor.rating}/5</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
                  <p className="mt-1 font-semibold text-slate-900">{doctor.location}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-white/80 bg-white/95">
          <h2 className="text-xl font-semibold text-slate-950">Qualifications</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {doctor.qualifications.map((qualification) => (
              <Badge key={qualification}>{qualification}</Badge>
            ))}
          </div>
        </Card>

        <Card className="border-white/80 bg-white/95">
          <h2 className="text-xl font-semibold text-slate-950">Available time slots</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {doctor.availableTimeSlots.map((slot) => (
              <Badge key={slot} tone="success">
                {slot}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {user?.role === "patient" ? (
          <BookingForm doctor={doctor} user={user} />
        ) : user?.role === "doctor" ? (
          <Card className="border-white/80 bg-white/95">
            <h3 className="text-xl font-semibold text-slate-950">Doctor view</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Booking is limited to patient accounts. You can still view your public
              profile and manage appointments from the dashboard.
            </p>
            <Link to="/dashboard">
              <Button className="mt-5 w-full" variant="secondary">
                Open dashboard
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="border-white/80 bg-white/95">
            <h3 className="text-xl font-semibold text-slate-950">Ready to book?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in as a patient to reserve an appointment with this doctor.
            </p>
            <Link to="/login">
              <Button className="mt-5 w-full" variant="secondary">
                Sign in to book
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
