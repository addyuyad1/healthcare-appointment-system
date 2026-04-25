import { apiGet } from "../../../services/http";
import type {
  DoctorProfile,
  DoctorsQuery,
  PaginatedResponse,
} from "../../../shared/types/models";

export const doctorsApi = {
  async getDoctors(query?: DoctorsQuery) {
    return apiGet<PaginatedResponse<DoctorProfile>>("/doctors", {
      params: query,
    });
  },
  async getDoctorById(doctorId: string) {
    return apiGet<DoctorProfile>(`/doctors/${doctorId}`);
  },
};
