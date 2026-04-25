import { create } from "zustand";
import { authApi } from "../api/authApi";
import { getErrorMessage } from "../../../services/http";
import type { LoginPayload, SignupPayload, User } from "../../../shared/types/models";

interface AuthState {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  signup: (payload: SignupPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  error: null,
  isLoading: false,
  isBootstrapping: true,
  async bootstrap() {
    set({ isBootstrapping: true });

    try {
      const user = await authApi.getSession();
      set({ user, error: null, isBootstrapping: false });
    } catch {
      set({ user: null, isBootstrapping: false });
    }
  },
  async login(payload) {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(payload);
      set({ user: response.user, isLoading: false, error: null });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return false;
    }
  },
  async signup(payload) {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.signup(payload);
      set({ user: response.user, isLoading: false, error: null });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      return false;
    }
  },
  async logout() {
    set({ isLoading: true });

    try {
      await authApi.logout();
    } finally {
      set({ user: null, error: null, isLoading: false });
    }
  },
  clearError() {
    set({ error: null });
  },
}));
