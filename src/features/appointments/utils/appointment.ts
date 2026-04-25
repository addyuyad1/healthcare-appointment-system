import type { AppointmentRecord } from "../../../shared/types/models";

export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function getBookedSlotsForDate(
  appointments: AppointmentRecord[],
  date: string,
) {
  return new Set(
    appointments
      .filter((appointment) => appointment.status === "scheduled" && appointment.date === date)
      .map((appointment) => appointment.timeSlot),
  );
}
