import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { doctorsApi } from "../../doctors/api/doctorsApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { Button } from "../../../shared/components/ui/Button";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { PageHeader } from "../../../shared/components/ui/PageHeader";
import type { DoctorProfile } from "../../../shared/types/models";

export function AppointmentsPage() {
  const { user } = useAuth();
  const {
    appointments,
    cancelAppointment,
    clearError,
    error,
    fetchAppointments,
    isLoading,
    rescheduleAppointment,
  } = useAppointments();
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

  const activeAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled",
  );
  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "cancelled",
  );
  const doctorLookup = new Map(doctors.map((doctor) => [doctor.id, doctor]));

  async function handleCancel(appointmentId: string) {
    await cancelAppointment(appointmentId);
  }

  async function handleReschedule(
    appointmentId: string,
    payload: { date: string; timeSlot: string },
  ) {
    const result = await rescheduleAppointment(appointmentId, payload);
    return result.success ? null : result.message ?? "Unable to reschedule.";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Appointment Management"
        title="Keep upcoming care organized"
        description="Review upcoming visits, make schedule updates, and keep patients and doctors aligned without leaving the dashboard."
        action={
          user.role === "patient" ? (
            <Link to="/doctors">
              <Button variant="secondary">Book another appointment</Button>
            </Link>
          ) : null
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Upcoming appointments</h2>
          <span className="text-sm text-slate-500">{activeAppointments.length} scheduled</span>
        </div>

        {isLoading ? (
          <div className="panel p-8 text-sm text-slate-600">Loading appointments...</div>
        ) : activeAppointments.length ? (
          <div className="space-y-4">
            {activeAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                availableSlots={
                  doctorLookup.get(appointment.doctorId)?.availableTimeSlots ?? [appointment.timeSlot]
                }
                isSaving={isLoading}
                role={user.role}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming appointments"
            description="You do not have any scheduled visits yet. Browse doctors and reserve a time that works for you."
            action={
              user.role === "patient" ? (
                <Link to="/doctors">
                  <Button variant="secondary">Explore doctors</Button>
                </Link>
              ) : null
            }
          />
        )}
      </section>

      {cancelledAppointments.length ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">Cancelled history</h2>
          <div className="space-y-4">
            {cancelledAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                availableSlots={
                  doctorLookup.get(appointment.doctorId)?.availableTimeSlots ?? [appointment.timeSlot]
                }
                isSaving={false}
                role={user.role}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
