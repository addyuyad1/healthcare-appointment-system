import { http } from "../../../services/http";
import type { AuthResponse, LoginPayload, SignupPayload, User } from "../../../shared/types/models";

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await http.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },
  async signup(payload: SignupPayload) {
    const response = await http.post<AuthResponse>("/auth/signup", payload);
    return response.data;
  },
  async getSession() {
    const response = await http.get<User>("/auth/session");
    return response.data;
  },
  async logout() {
    await http.post("/auth/logout");
  },
};
