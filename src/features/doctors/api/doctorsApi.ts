import { http } from "../../../services/http";
import type {
  DoctorProfile,
  DoctorsQuery,
  PaginatedResponse,
} from "../../../shared/types/models";

export const doctorsApi = {
  async getDoctors(query?: DoctorsQuery) {
    const response = await http.get<PaginatedResponse<DoctorProfile>>("/doctors", {
      params: query,
    });
    return response.data;
  },
  async getDoctorById(doctorId: string) {
    const response = await http.get<DoctorProfile>(`/doctors/${doctorId}`);
    return response.data;
  },
};
