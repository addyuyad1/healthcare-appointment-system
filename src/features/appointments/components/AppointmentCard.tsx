import { useState } from "react";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import type { AppointmentRecord, UserRole } from "../../../shared/types/models";
import { formatDateWithWeekday } from "../../../shared/utils/format";
import { getTodayDate } from "../utils/appointment";

interface AppointmentCardProps {
  appointment: AppointmentRecord;
  availableSlots: string[];
  isSaving: boolean;
  role: UserRole;
  onCancel: (appointmentId: string) => Promise<void>;
  onReschedule: (
    appointmentId: string,
    payload: { date: string; timeSlot: string },
  ) => Promise<string | null>;
}

export function AppointmentCard({
  appointment,
  availableSlots,
  isSaving,
  onCancel,
  onReschedule,
  role,
}: AppointmentCardProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [date, setDate] = useState(appointment.date);
  const [timeSlot, setTimeSlot] = useState(appointment.timeSlot);
  const [error, setError] = useState<string | null>(null);

  async function handleReschedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const responseError = await onReschedule(appointment.id, { date, timeSlot });

    if (responseError) {
      setError(responseError);
      return;
    }

    setIsRescheduling(false);
  }

  return (
    <Card className="border-white/80 bg-white/95">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-slate-950">
              {role === "doctor" ? appointment.patientName : appointment.doctorName}
            </h3>
            <Badge tone={appointment.status === "scheduled" ? "success" : "warning"}>
              {appointment.status}
            </Badge>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <p>
              <span className="font-semibold text-slate-900">Specialization:</span>{" "}
              {appointment.specialization}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Date:</span>{" "}
              {formatDateWithWeekday(appointment.date)}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Time:</span>{" "}
              {appointment.timeSlot}
            </p>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-900">Reason:</span>{" "}
            {appointment.reason}
          </p>
        </div>

        {appointment.status === "scheduled" ? (
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button variant="ghost" onClick={() => setIsRescheduling((value) => !value)}>
              {isRescheduling ? "Close reschedule" : "Reschedule"}
            </Button>
            <Button
              variant="danger"
              disabled={isSaving}
              onClick={() => void onCancel(appointment.id)}
            >
              Cancel appointment
            </Button>
          </div>
        ) : null}
      </div>

      {isRescheduling ? (
        <form className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-3" onSubmit={handleReschedule}>
          <Input
            label="New date"
            min={getTodayDate()}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <Select
            label="Time slot"
            value={timeSlot}
            onChange={(event) => setTimeSlot(event.target.value)}
          >
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
          <div className="flex items-end">
            <Button fullWidth type="submit" variant="secondary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
          {error ? (
            <div className="md:col-span-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : null}
        </form>
      ) : null}
    </Card>
  );
}
