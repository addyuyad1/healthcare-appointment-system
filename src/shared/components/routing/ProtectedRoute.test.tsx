import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "../../../features/auth/store/authStore";

function renderWithRoutes(initialPath = "/dashboard", allowedRoles?: Array<"doctor" | "patient">) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/appointments" element={<div>Appointments page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    useAuthStore.setState({
      error: null,
      isBootstrapping: false,
      isLoading: false,
      user: null,
    });
  });

  it("redirects unauthenticated users to login", async () => {
    useAuthStore.setState({
      error: null,
      isBootstrapping: false,
      isLoading: false,
      user: null,
    });

    renderWithRoutes("/appointments");

    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("blocks users without the required role", async () => {
    useAuthStore.setState({
      error: null,
      isBootstrapping: false,
      isLoading: false,
      user: {
        email: "patient@care.com",
        id: "patient-1",
        name: "Patient User",
        role: "patient",
      },
    });

    renderWithRoutes("/appointments", ["doctor"]);

    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
  });

  it("renders protected content when the role matches", async () => {
    useAuthStore.setState({
      error: null,
      isBootstrapping: false,
      isLoading: false,
      user: {
        email: "doctor@care.com",
        id: "doctor-1",
        name: "Doctor User",
        role: "doctor",
      },
    });

    renderWithRoutes("/appointments", ["doctor"]);

    expect(await screen.findByText("Appointments page")).toBeInTheDocument();
  });
});
