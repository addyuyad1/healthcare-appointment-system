declare global {
  interface Window {
    __APP_ENV__?: Record<string, string | undefined>;
  }
}

function getRuntimeEnv(key: string, fallback: string) {
  if (typeof window !== "undefined" && window.__APP_ENV__?.[key]) {
    return window.__APP_ENV__?.[key] ?? fallback;
  }

  const processEnv = (
    globalThis as typeof globalThis & {
      process?: {
        env?: Record<string, string | undefined>;
      };
    }
  ).process?.env;

  if (processEnv?.[key]) {
    return processEnv[key] ?? fallback;
  }

  return fallback;
}

const appEnv = getRuntimeEnv("VITE_APP_ENV", "development");

const env = {
  apiBaseUrl: getRuntimeEnv("VITE_API_BASE_URL", "/api"),
  appEnv,
  appName: getRuntimeEnv("VITE_APP_NAME", "Healthcare Appointment System"),
  enableApiLogging: getRuntimeEnv("VITE_ENABLE_API_LOGGING", "true") === "true",
  enableMonitoring: getRuntimeEnv("VITE_ENABLE_MONITORING", "true") === "true",
  isProduction: appEnv === "production",
};

export { env };
