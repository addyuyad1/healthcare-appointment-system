import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCalendar } from "../../calendar/components/AppointmentCalendar";
import { useAuth } from "../../auth/hooks/useAuth";
import { doctorsApi } from "../../doctors/api/doctorsApi";
import { usePolling } from "../../../shared/hooks/usePolling";
import { Button } from "../../../shared/components/ui/Button";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import { PageHeader } from "../../../shared/components/ui/PageHeader";
import { AppointmentCardSkeleton, Skeleton } from "../../../shared/components/ui/Skeleton";
import { useToastStore } from "../../../shared/components/ui/ToastViewport";
import type { AppointmentFilters, DoctorProfile } from "../../../shared/types/models";

export function AppointmentsPage() {
  const { user } = useAuth();
  const addToast = useToastStore((state) => state.addToast);
  const {
    appointments,
    cancelAppointment,
    clearError,
    error,
    fetchAppointments,
    isLoading,
    isRefreshing,
    rescheduleAppointment,
  } = useAppointments();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  const appointmentFilters = useMemo<AppointmentFilters | undefined>(
    () =>
      user
        ? user.role === "doctor"
          ? { doctorId: user.id }
          : { patientId: user.id }
        : undefined,
    [user],
  );

  useEffect(() => {
    if (!user || !appointmentFilters) {
      return;
    }

    clearError();
    void fetchAppointments(appointmentFilters);
    void doctorsApi.getDoctors({ page: 1, pageSize: 50 }).then((response) => {
      setDoctors(response.items);
    });
  }, [appointmentFilters, clearError, fetchAppointments, user]);

  usePolling(
    () => {
      if (appointmentFilters) {
        void fetchAppointments(appointmentFilters, { silent: true });
      }
    },
    10000,
    Boolean(appointmentFilters),
  );

  const activeAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled",
  );
  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "cancelled",
  );
  const doctorLookup = new Map(doctors.map((doctor) => [doctor.id, doctor]));

  if (!user) {
    return null;
  }

  async function handleCancel(appointmentId: string) {
    const result = await cancelAppointment(appointmentId);

    if (result.success) {
      addToast({
        title: "Appointment cancelled",
        message: "The slot has been released and notifications were queued.",
        tone: "success",
      });
      return null;
    }

    addToast({
      title: "Cancellation failed",
      message: result.message,
      tone: "error",
    });
    return result.message ?? "Unable to cancel appointment.";
  }

  async function handleReschedule(
    appointmentId: string,
    payload: { date: string; timeSlot: string },
  ) {
    const result = await rescheduleAppointment(appointmentId, payload);

    if (result.success) {
      addToast({
        title: "Appointment updated",
        message: `The appointment is now set for ${payload.date} at ${payload.timeSlot}.`,
        tone: "success",
      });
      return null;
    }

    addToast({
      title: "Reschedule failed",
      message: result.message,
      tone: "error",
    });
    return result.message ?? "Unable to reschedule.";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Appointment Management"
        title="Keep upcoming care organized"
        description="Review upcoming visits, watch them update in near real time, switch to a monthly or weekly calendar view, and make schedule changes without leaving the page."
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {isRefreshing ? "Refreshing" : "Live polling every 10s"}
            </span>
            {user.role === "patient" ? (
              <Link to="/doctors">
                <Button variant="secondary">Book another appointment</Button>
              </Link>
            ) : null}
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Calendar view</h2>
          <span className="text-sm text-slate-500">{activeAppointments.length} booked slots</span>
        </div>

        {isLoading ? (
          <div className="panel p-6">
            <Skeleton className="h-[420px] w-full rounded-[2rem]" />
          </div>
        ) : activeAppointments.length ? (
          <AppointmentCalendar appointments={activeAppointments} role={user.role} />
        ) : (
          <EmptyState
            title="No calendar events yet"
            description="Once appointments are scheduled, they will appear here in month and week views."
          />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">Upcoming appointments</h2>
          <span className="text-sm text-slate-500">{activeAppointments.length} scheduled</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <AppointmentCardSkeleton key={index} />
            ))}
          </div>
        ) : activeAppointments.length ? (
          <div className="space-y-4">
            {activeAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                availableSlots={Array.from(
                  new Set([
                    appointment.timeSlot,
                    ...(doctorLookup.get(appointment.doctorId)?.availableTimeSlots ?? []),
                  ]),
                )}
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
                availableSlots={Array.from(
                  new Set([
                    appointment.timeSlot,
                    ...(doctorLookup.get(appointment.doctorId)?.availableTimeSlots ?? []),
                  ]),
                )}
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
