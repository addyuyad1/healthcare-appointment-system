import { apiGet, apiPost } from "../../../services/http";
import type { AuthResponse, LoginPayload, SignupPayload, User } from "../../../shared/types/models";

export const authApi = {
  async login(payload: LoginPayload) {
    return apiPost<AuthResponse, LoginPayload>("/auth/login", payload);
  },
  async signup(payload: SignupPayload) {
    return apiPost<AuthResponse, SignupPayload>("/auth/signup", payload);
  },
  async getSession() {
    return apiGet<User>("/auth/session");
  },
  async logout() {
    await apiPost("/auth/logout");
  },
};
