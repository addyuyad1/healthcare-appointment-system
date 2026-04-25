import { create } from "zustand";
import { appointmentsApi } from "../api/appointmentsApi";
import { getErrorMessage } from "../../../services/http";
import type {
  AppointmentFilters,
  AppointmentRecord,
  BookAppointmentPayload,
  UpdateAppointmentPayload,
} from "../../../shared/types/models";

interface ActionResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface AppointmentsState {
  appointments: AppointmentRecord[];
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  fetchAppointments: (
    filters?: AppointmentFilters,
    options?: { silent?: boolean },
  ) => Promise<void>;
  bookAppointment: (payload: BookAppointmentPayload) => Promise<ActionResult<AppointmentRecord>>;
  cancelAppointment: (appointmentId: string) => Promise<ActionResult<AppointmentRecord>>;
  rescheduleAppointment: (
    appointmentId: string,
    payload: UpdateAppointmentPayload,
  ) => Promise<ActionResult<AppointmentRecord>>;
  clearError: () => void;
}

function upsertAppointment(
  appointments: AppointmentRecord[],
  appointment: AppointmentRecord,
) {
  const nextAppointments = appointments.filter((item) => item.id !== appointment.id);
  nextAppointments.push(appointment);

  return nextAppointments.sort((first, second) => {
    const firstValue = `${first.date} ${first.timeSlot}`;
    const secondValue = `${second.date} ${second.timeSlot}`;
    return firstValue.localeCompare(secondValue);
  });
}

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: [],
  error: null,
  isLoading: false,
  isRefreshing: false,
  async fetchAppointments(filters, options) {
    set(
      options?.silent
        ? { isRefreshing: true }
        : { isLoading: true, error: null },
    );

    try {
      const appointments = await appointmentsApi.getAppointments(filters);
      set({
        appointments,
        error: null,
        isLoading: false,
        isRefreshing: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoading: false,
        isRefreshing: false,
      });
    }
  },
  async bookAppointment(payload) {
    set({ isLoading: true, error: null });

    try {
      const appointment = await appointmentsApi.bookAppointment(payload);
      set((state) => ({
        appointments: upsertAppointment(state.appointments, appointment),
        error: null,
        isLoading: false,
      }));
      return { success: true, data: appointment };
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
  async cancelAppointment(appointmentId) {
    set({ isLoading: true, error: null });

    try {
      const appointment = await appointmentsApi.updateAppointment(appointmentId, {
        status: "cancelled",
      });
      set((state) => ({
        appointments: upsertAppointment(state.appointments, appointment),
        error: null,
        isLoading: false,
      }));
      return { success: true, data: appointment };
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
  async rescheduleAppointment(appointmentId, payload) {
    set({ isLoading: true, error: null });

    try {
      const appointment = await appointmentsApi.updateAppointment(appointmentId, payload);
      set((state) => ({
        appointments: upsertAppointment(state.appointments, appointment),
        error: null,
        isLoading: false,
      }));
      return { success: true, data: appointment };
    } catch (error) {
      const message = getErrorMessage(error);
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
  clearError() {
    set({ error: null });
  },
}));
