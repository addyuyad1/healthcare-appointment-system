import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentsApi } from "../api/appointmentsApi";
import { useAppointments } from "../hooks/useAppointments";
import { getBookedSlotsForDate, getTodayDate } from "../utils/appointment";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { TextArea } from "../../../shared/components/ui/TextArea";
import { usePolling } from "../../../shared/hooks/usePolling";
import { getErrorMessage } from "../../../services/http";
import { useToastStore } from "../../../shared/components/ui/ToastViewport";
import type { AppointmentRecord, DoctorProfile, User } from "../../../shared/types/models";

interface BookingFormProps {
  doctor: DoctorProfile;
  user: User;
}

const bookingSchema = z.object({
  date: z.string().min(1, "Please choose an appointment date."),
  reason: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters.")
    .max(240, "Please keep the reason under 240 characters."),
  timeSlot: z.string().min(1, "Please choose a time slot."),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingForm({ doctor, user }: BookingFormProps) {
  const { bookAppointment, isLoading } = useAppointments();
  const addToast = useToastStore((state) => state.addToast);
  const [doctorAppointments, setDoctorAppointments] = useState<AppointmentRecord[]>([]);
  const [isSyncingSlots, setIsSyncingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<BookingFormValues>({
    defaultValues: {
      date: getTodayDate(),
      reason: "",
      timeSlot: doctor.availableTimeSlots[0] ?? "",
    },
    resolver: zodResolver(bookingSchema),
  });
  const selectedDate = watch("date");
  const selectedTimeSlot = watch("timeSlot");

  async function loadDoctorAppointments(silent = false) {
    try {
      if (silent) {
        setIsSyncingSlots(true);
      }

      const result = await appointmentsApi.getAppointments({
        doctorId: doctor.id,
        status: "scheduled",
      });
      setDoctorAppointments(result);
      setError(null);
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setIsSyncingSlots(false);
    }
  }

  useEffect(() => {
    void loadDoctorAppointments();
  }, [doctor.id]);

  usePolling(
    () => {
      void loadDoctorAppointments(true);
    },
    10000,
    true,
  );

  const bookedSlots = useMemo(
    () => getBookedSlotsForDate(doctorAppointments, selectedDate),
    [doctorAppointments, selectedDate],
  );
  const openSlots = doctor.availableTimeSlots.filter((slot) => !bookedSlots.has(slot));

  useEffect(() => {
    if (!doctor.availableTimeSlots.length) {
      return;
    }

    if (!selectedTimeSlot || bookedSlots.has(selectedTimeSlot)) {
      const nextOpenSlot = openSlots[0] ?? "";
      setValue("timeSlot", nextOpenSlot);

      if (selectedTimeSlot && nextOpenSlot) {
        addToast({
          title: "Slot updated",
          message: "Your previously selected slot was booked, so we switched you to the next open slot.",
          tone: "info",
        });
      }
    }
  }, [addToast, bookedSlots, doctor.availableTimeSlots, openSlots, selectedTimeSlot, setValue]);

  async function submitForm(values: BookingFormValues) {
    setError(null);

    const result = await bookAppointment({
      date: values.date,
      doctorId: doctor.id,
      patientId: user.id,
      reason: values.reason.trim(),
      timeSlot: values.timeSlot,
    });

    if (!result.success) {
      const message = result.message ?? "Unable to book appointment.";
      setError(message);
      addToast({
        title: "Booking failed",
        message,
        tone: "error",
      });
      return;
    }

    addToast({
      title: "Appointment booked",
      message: `Your visit with ${doctor.name} is confirmed for ${values.date} at ${values.timeSlot}.`,
      tone: "success",
    });
    reset({
      date: values.date,
      reason: "",
      timeSlot: openSlots[0] ?? doctor.availableTimeSlots[0] ?? "",
    });
    await loadDoctorAppointments();
  }

  return (
    <Card className="border-white/80 bg-white/95">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-950">Book appointment</h3>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {isSyncingSlots ? "Syncing slots" : "Live slots"}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          Choose a day and an open time slot. Slot availability refreshes automatically to reduce booking conflicts.
        </p>
      </div>

      <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit(submitForm)}>
        <Input
          label="Appointment date"
          min={getTodayDate()}
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />

        <Select
          label="Available slot"
          error={errors.timeSlot?.message}
          disabled={!openSlots.length}
          {...register("timeSlot")}
        >
          {doctor.availableTimeSlots.map((slot) => (
            <option key={slot} disabled={bookedSlots.has(slot)} value={slot}>
              {slot} {bookedSlots.has(slot) ? "(Booked)" : ""}
            </option>
          ))}
        </Select>

        <TextArea
          label="Reason for visit"
          placeholder="Describe symptoms, follow-up needs, or any notes for the doctor."
          error={errors.reason?.message}
          {...register("reason")}
        />

        {!openSlots.length ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            All slots are currently booked for this date. Try another day to continue.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <Button
          fullWidth
          type="submit"
          variant="secondary"
          disabled={isLoading || !openSlots.length}
        >
          {isLoading ? "Booking..." : "Confirm appointment"}
        </Button>
      </form>
    </Card>
  );
}
