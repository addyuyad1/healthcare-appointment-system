import { useAppointmentsStore } from "../store/appointmentsStore";

export function useAppointments() {
  const appointments = useAppointmentsStore((state) => state.appointments);
  const error = useAppointmentsStore((state) => state.error);
  const isLoading = useAppointmentsStore((state) => state.isLoading);
  const fetchAppointments = useAppointmentsStore((state) => state.fetchAppointments);
  const bookAppointment = useAppointmentsStore((state) => state.bookAppointment);
  const cancelAppointment = useAppointmentsStore((state) => state.cancelAppointment);
  const rescheduleAppointment = useAppointmentsStore(
    (state) => state.rescheduleAppointment,
  );
  const clearError = useAppointmentsStore((state) => state.clearError);

  return {
    appointments,
    bookAppointment,
    cancelAppointment,
    clearError,
    error,
    fetchAppointments,
    isLoading,
    rescheduleAppointment,
  };
}
