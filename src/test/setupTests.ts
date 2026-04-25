import "@testing-library/jest-dom";

beforeEach(() => {
  window.localStorage.clear();
  window.__APP_ENV__ = {
    VITE_API_BASE_URL: "/api",
    VITE_APP_ENV: "test",
    VITE_APP_NAME: "Healthcare Appointment System",
    VITE_ENABLE_API_LOGGING: "false",
    VITE_ENABLE_MONITORING: "false",
  };
});
