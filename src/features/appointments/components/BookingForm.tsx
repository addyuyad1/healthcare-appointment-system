import { useEffect, useState } from "react";
import { appointmentsApi } from "../api/appointmentsApi";
import { useAppointments } from "../hooks/useAppointments";
import { getBookedSlotsForDate, getTodayDate } from "../utils/appointment";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { TextArea } from "../../../shared/components/ui/TextArea";
import { getErrorMessage } from "../../../services/http";
import type { AppointmentRecord, DoctorProfile, User } from "../../../shared/types/models";

interface BookingFormProps {
  doctor: DoctorProfile;
  user: User;
}

export function BookingForm({ doctor, user }: BookingFormProps) {
  const { bookAppointment, isLoading } = useAppointments();
  const [date, setDate] = useState(getTodayDate());
  const [timeSlot, setTimeSlot] = useState(doctor.availableTimeSlots[0] ?? "");
  const [reason, setReason] = useState("");
  const [doctorAppointments, setDoctorAppointments] = useState<AppointmentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void appointmentsApi
      .getAppointments({ doctorId: doctor.id, status: "scheduled" })
      .then((result) => {
        if (isMounted) {
          setDoctorAppointments(result);
        }
      })
      .catch((reason) => {
        if (isMounted) {
          setError(getErrorMessage(reason));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [doctor.id]);

  useEffect(() => {
    if (!doctor.availableTimeSlots.includes(timeSlot)) {
      setTimeSlot(doctor.availableTimeSlots[0] ?? "");
    }
  }, [doctor.availableTimeSlots, timeSlot]);

  const bookedSlots = getBookedSlotsForDate(doctorAppointments, date);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!reason.trim()) {
      setError("Please share a brief reason for the appointment.");
      return;
    }

    const result = await bookAppointment({
      date,
      doctorId: doctor.id,
      patientId: user.id,
      reason: reason.trim(),
      timeSlot,
    });

    if (!result.success) {
      setError(result.message ?? "Unable to book appointment.");
      return;
    }

    setSuccessMessage("Appointment booked successfully.");
    setReason("");

    const refreshedAppointments = await appointmentsApi.getAppointments({
      doctorId: doctor.id,
      status: "scheduled",
    });
    setDoctorAppointments(refreshedAppointments);
  }

  return (
    <Card className="border-white/80 bg-white/95">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-950">Book appointment</h3>
        <p className="text-sm leading-6 text-slate-600">
          Choose a day and an open time slot. Double booking is blocked automatically.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Appointment date"
          min={getTodayDate()}
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <Select
          label="Available slot"
          value={timeSlot}
          onChange={(event) => setTimeSlot(event.target.value)}
        >
          {doctor.availableTimeSlots.map((slot) => (
            <option
              key={slot}
              disabled={bookedSlots.has(slot)}
              value={slot}
            >
              {slot} {bookedSlots.has(slot) ? "(Booked)" : ""}
            </option>
          ))}
        </Select>

        <TextArea
          label="Reason for visit"
          placeholder="Describe symptoms, follow-up needs, or any notes for the doctor."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <Button fullWidth type="submit" variant="secondary" disabled={isLoading}>
          {isLoading ? "Booking..." : "Confirm appointment"}
        </Button>
      </form>
    </Card>
  );
}
