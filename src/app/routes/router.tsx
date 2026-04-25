import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../../shared/components/layout/AppShell";
import { ProtectedRoute, PublicOnlyRoute } from "../../shared/components/routing/ProtectedRoute";
import { AppointmentsPage } from "../../features/appointments/pages/AppointmentsPage";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { SignupPage } from "../../features/auth/pages/SignupPage";
import { DashboardPage } from "../../features/dashboard/pages/DashboardPage";
import { DoctorProfilePage } from "../../features/doctors/pages/DoctorProfilePage";
import { DoctorsPage } from "../../features/doctors/pages/DoctorsPage";
import { useAuthStore } from "../../features/auth/store/authStore";

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate replace to={user ? "/dashboard" : "/doctors"} />;
}

function NotFoundPage() {
  return (
    <div className="panel p-8">
      <span className="eyebrow">Not found</span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-950">
        That page does not exist.
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        The link may be outdated, or the page may have been moved.
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        path: "login",
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "signup",
        element: (
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "doctors",
        element: <DoctorsPage />,
      },
      {
        path: "doctors/:doctorId",
        element: <DoctorProfilePage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "appointments",
            element: <AppointmentsPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
