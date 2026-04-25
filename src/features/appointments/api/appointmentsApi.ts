import { apiGet, apiPatch, apiPost } from "../../../services/http";
import type {
  AppointmentFilters,
  AppointmentRecord,
  BookAppointmentPayload,
  UpdateAppointmentPayload,
} from "../../../shared/types/models";

export const appointmentsApi = {
  async getAppointments(filters?: AppointmentFilters) {
    return apiGet<AppointmentRecord[]>("/appointments", {
      params: filters,
    });
  },
  async bookAppointment(payload: BookAppointmentPayload) {
    return apiPost<AppointmentRecord, BookAppointmentPayload>("/appointments", payload);
  },
  async updateAppointment(appointmentId: string, payload: UpdateAppointmentPayload) {
    return apiPatch<AppointmentRecord, UpdateAppointmentPayload>(
      `/appointments/${appointmentId}`,
      payload,
    );
  },
};
