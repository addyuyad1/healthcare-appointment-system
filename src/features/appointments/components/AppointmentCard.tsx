import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Modal } from "../../../shared/components/ui/Modal";
import { Select } from "../../../shared/components/ui/Select";
import type { AppointmentRecord, UserRole } from "../../../shared/types/models";
import { formatDateWithWeekday } from "../../../shared/utils/format";
import { getTodayDate } from "../utils/appointment";

interface AppointmentCardProps {
  appointment: AppointmentRecord;
  availableSlots: string[];
  isSaving: boolean;
  role: UserRole;
  onCancel: (appointmentId: string) => Promise<string | null>;
  onReschedule: (
    appointmentId: string,
    payload: { date: string; timeSlot: string },
  ) => Promise<string | null>;
}

const rescheduleSchema = z.object({
  date: z.string().min(1, "Please choose a new date."),
  timeSlot: z.string().min(1, "Please choose a time slot."),
});

type RescheduleValues = z.infer<typeof rescheduleSchema>;

export function AppointmentCard({
  appointment,
  availableSlots,
  isSaving,
  onCancel,
  onReschedule,
  role,
}: AppointmentCardProps) {
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<RescheduleValues>({
    defaultValues: {
      date: appointment.date,
      timeSlot: appointment.timeSlot,
    },
    resolver: zodResolver(rescheduleSchema),
  });

  useEffect(() => {
    setCancelError(null);
    setRescheduleError(null);
    reset({
      date: appointment.date,
      timeSlot: appointment.timeSlot,
    });
  }, [appointment.date, appointment.timeSlot, reset]);

  const slots = useMemo(
    () => Array.from(new Set([appointment.timeSlot, ...availableSlots])),
    [appointment.timeSlot, availableSlots],
  );

  async function submitReschedule(values: RescheduleValues) {
    setRescheduleError(null);
    const responseError = await onReschedule(appointment.id, values);

    if (responseError) {
      setRescheduleError(responseError);
      return;
    }

    setIsRescheduleModalOpen(false);
  }

  async function confirmCancellation() {
    const responseError = await onCancel(appointment.id);

    if (responseError) {
      setCancelError(responseError);
      return;
    }

    setCancelError(null);
    setIsCancelModalOpen(false);
  }

  return (
    <>
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
              <Button variant="ghost" onClick={() => setIsRescheduleModalOpen(true)}>
                Reschedule
              </Button>
              <Button
                variant="danger"
                disabled={isSaving}
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel appointment
              </Button>
            </div>
          ) : null}
        </div>
      </Card>

      <Modal
        isOpen={isRescheduleModalOpen}
        title="Reschedule appointment"
        description="Pick a new date and time slot. The system will prevent conflicts before saving."
        onClose={() => setIsRescheduleModalOpen(false)}
      >
        {rescheduleError ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {rescheduleError}
          </div>
        ) : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(submitReschedule)}>
          <Input
            label="New date"
            min={getTodayDate()}
            type="date"
            error={errors.date?.message}
            {...register("date")}
          />
          <Select
            label="Time slot"
            error={errors.timeSlot?.message}
            {...register("timeSlot")}
          >
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsRescheduleModalOpen(false)}>
              Keep current time
            </Button>
            <Button type="submit" variant="secondary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCancelModalOpen}
        title="Cancel appointment?"
        description="This will free the slot and notify the patient and doctor through the mock notification channels."
        onClose={() => setIsCancelModalOpen(false)}
      >
        {cancelError ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {cancelError}
          </div>
        ) : null}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>
            Keep appointment
          </Button>
          <Button variant="danger" disabled={isSaving} onClick={() => void confirmCancellation()}>
            {isSaving ? "Cancelling..." : "Yes, cancel it"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
