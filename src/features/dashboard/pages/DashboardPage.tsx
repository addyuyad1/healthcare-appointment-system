import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "../../appointments/hooks/useAppointments";
import { useAuth } from "../../auth/hooks/useAuth";
import { doctorsApi } from "../../doctors/api/doctorsApi";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { PageHeader } from "../../../shared/components/ui/PageHeader";
import type { AppointmentRecord, DoctorProfile } from "../../../shared/types/models";
import { formatDateWithWeekday } from "../../../shared/utils/format";

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card className="border-white/80 bg-white/95">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </Card>
  );
}

function NextAppointments({ appointments }: { appointments: AppointmentRecord[] }) {
  if (!appointments.length) {
    return (
      <EmptyState
        title="No upcoming appointments"
        description="Once visits are scheduled, they will appear here with timing and patient or doctor details."
      />
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="border-white/80 bg-white/95">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                {appointment.doctorName}
              </h3>
              <p className="text-sm text-slate-600">{appointment.reason}</p>
            </div>
            <div className="text-sm text-slate-600 md:text-right">
              <p className="font-semibold text-slate-900">
                {formatDateWithWeekday(appointment.date)}
              </p>
              <p>{appointment.timeSlot}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { appointments, clearError, error, fetchAppointments, isLoading } = useAppointments();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    clearError();

    void fetchAppointments(
      user.role === "doctor" ? { doctorId: user.id } : { patientId: user.id },
    );

    void doctorsApi.getDoctors().then(setDoctors);
  }, [clearError, fetchAppointments, user]);

  if (!user) {
    return null;
  }

  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled",
  );
  const nextAppointments = scheduledAppointments.slice(0, 3);
  const todaysDate = new Date().toISOString().split("T")[0];

  if (user.role === "doctor") {
    const uniquePatients = new Set(
      scheduledAppointments.map((appointment) => appointment.patientId),
    );
    const todayAppointments = scheduledAppointments.filter(
      (appointment) => appointment.date === todaysDate,
    );

    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Doctor Dashboard"
          title={`Welcome back, ${user.name}`}
          description="Track your upcoming consultations, today’s workload, and active patient demand from one place."
          action={
            <Link to="/appointments">
              <Button variant="secondary">View schedule</Button>
            </Link>
          }
        />

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-3">
          <StatCard
            helper="Appointments currently in your active queue."
            label="Upcoming"
            value={scheduledAppointments.length}
          />
          <StatCard
            helper="Consultations scheduled for today."
            label="Today"
            value={todayAppointments.length}
          />
          <StatCard
            helper="Unique patients with active appointments."
            label="Patients"
            value={uniquePatients.size}
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">Next appointments</h2>
          {isLoading ? (
            <div className="panel p-8 text-sm text-slate-600">Loading dashboard...</div>
          ) : (
            <div className="space-y-4">
              {nextAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-white/80 bg-white/95">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">
                        {appointment.patientName}
                      </h3>
                      <p className="text-sm text-slate-600">{appointment.reason}</p>
                    </div>
                    <div className="text-sm text-slate-600 md:text-right">
                      <p className="font-semibold text-slate-900">
                        {formatDateWithWeekday(appointment.date)}
                      </p>
                      <p>{appointment.timeSlot}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {!nextAppointments.length ? (
                <EmptyState
                  title="No scheduled consultations"
                  description="When patients book appointments with you, your upcoming list will appear here."
                />
              ) : null}
            </div>
          )}
        </section>
      </div>
    );
  }

  const specialtyCount = new Set(doctors.map((doctor) => doctor.specialization)).size;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Patient Dashboard"
        title={`Hello, ${user.name}`}
        description="Stay on top of upcoming care, discover more doctors, and keep your appointment plan current."
        action={
          <Link to="/doctors">
            <Button variant="secondary">Find a doctor</Button>
          </Link>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          helper="All your currently scheduled visits."
          label="Upcoming"
          value={scheduledAppointments.length}
        />
        <StatCard
          helper="Specialties available in the doctor directory."
          label="Specialties"
          value={specialtyCount}
        />
        <StatCard
          helper="Doctors currently available for booking."
          label="Doctors"
          value={doctors.length}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Next visits</h2>
          <Link className="text-sm font-semibold text-accent-700" to="/appointments">
            Manage appointments
          </Link>
        </div>
        {isLoading ? (
          <div className="panel p-8 text-sm text-slate-600">Loading dashboard...</div>
        ) : (
          <NextAppointments appointments={nextAppointments} />
        )}
      </section>
    </div>
  );
}
