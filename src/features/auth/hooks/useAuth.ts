import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    clearError,
    error,
    isAuthenticated: Boolean(user),
    isBootstrapping,
    isLoading,
    login,
    logout,
    signup,
    user,
  };
}
