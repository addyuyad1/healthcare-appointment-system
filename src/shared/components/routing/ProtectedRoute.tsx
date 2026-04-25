import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute({ children }: PropsWithChildren) {
  const { user } = useAuth();

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}
