import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/authStore";
import { AppShell } from "../../shared/components/layout/AppShell";
import { ProtectedRoute, PublicOnlyRoute } from "../../shared/components/routing/ProtectedRoute";

const LoginPage = lazy(async () => {
  const module = await import("../../features/auth/pages/LoginPage");
  return { default: module.LoginPage };
});

const SignupPage = lazy(async () => {
  const module = await import("../../features/auth/pages/SignupPage");
  return { default: module.SignupPage };
});

const DoctorsPage = lazy(async () => {
  const module = await import("../../features/doctors/pages/DoctorsPage");
  return { default: module.DoctorsPage };
});

const DoctorProfilePage = lazy(async () => {
  const module = await import("../../features/doctors/pages/DoctorProfilePage");
  return { default: module.DoctorProfilePage };
});

const DashboardPage = lazy(async () => {
  const module = await import("../../features/dashboard/pages/DashboardPage");
  return { default: module.DashboardPage };
});

const AppointmentsPage = lazy(async () => {
  const module = await import("../../features/appointments/pages/AppointmentsPage");
  return { default: module.AppointmentsPage };
});

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
        element: <ProtectedRoute allowedRoles={["patient"]} />,
        children: [
          {
            path: "dashboard/patient",
            element: <DashboardPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["doctor"]} />,
        children: [
          {
            path: "dashboard/doctor",
            element: <DashboardPage />,
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
