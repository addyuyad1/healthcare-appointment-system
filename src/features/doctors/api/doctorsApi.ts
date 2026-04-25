import { http } from "../../../services/http";
import type { DoctorProfile } from "../../../shared/types/models";

export const doctorsApi = {
  async getDoctors(specialization?: string) {
    const response = await http.get<DoctorProfile[]>("/doctors", {
      params: specialization ? { specialization } : undefined,
    });
    return response.data;
  },
  async getDoctorById(doctorId: string) {
    const response = await http.get<DoctorProfile>(`/doctors/${doctorId}`);
    return response.data;
  },
};
