import { http } from "../../../services/http";
import type {
  AppointmentFilters,
  AppointmentRecord,
  BookAppointmentPayload,
  UpdateAppointmentPayload,
} from "../../../shared/types/models";

export const appointmentsApi = {
  async getAppointments(filters?: AppointmentFilters) {
    const response = await http.get<AppointmentRecord[]>("/appointments", {
      params: filters,
    });
    return response.data;
  },
  async bookAppointment(payload: BookAppointmentPayload) {
    const response = await http.post<AppointmentRecord>("/appointments", payload);
    return response.data;
  },
  async updateAppointment(appointmentId: string, payload: UpdateAppointmentPayload) {
    const response = await http.patch<AppointmentRecord>(
      `/appointments/${appointmentId}`,
      payload,
    );
    return response.data;
  },
};
