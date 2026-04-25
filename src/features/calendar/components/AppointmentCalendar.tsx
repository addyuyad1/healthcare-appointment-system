import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { AppointmentRecord, UserRole } from "../../../shared/types/models";

interface AppointmentCalendarProps {
  appointments: AppointmentRecord[];
  role: UserRole;
}

export function AppointmentCalendar({
  appointments,
  role,
}: AppointmentCalendarProps) {
  const events = appointments.map((appointment) => ({
    backgroundColor: appointment.status === "scheduled" ? "#23a182" : "#94a3b8",
    borderColor: appointment.status === "scheduled" ? "#16806a" : "#64748b",
    end: `${appointment.date}T${addHour(appointment.timeSlot)}`,
    start: `${appointment.date}T${appointment.timeSlot}:00`,
    title:
      role === "doctor"
        ? `${appointment.patientName} • ${appointment.timeSlot}`
        : `${appointment.doctorName} • ${appointment.timeSlot}`,
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      }}
      events={events}
      height="auto"
      dayMaxEvents={3}
      slotMinTime="07:00:00"
      slotMaxTime="20:00:00"
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short",
      }}
    />
  );
}

function addHour(timeSlot: string) {
  const [hours, minutes] = timeSlot.split(":").map(Number);
  const nextHour = String((hours + 1) % 24).padStart(2, "0");
  return `${nextHour}:${String(minutes).padStart(2, "0")}:00`;
}
