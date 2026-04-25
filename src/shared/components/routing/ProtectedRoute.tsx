import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import type { UserRole } from "../../types/models";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/dashboard" />;
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
