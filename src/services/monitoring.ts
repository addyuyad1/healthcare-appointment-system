import { env } from "../app/config/env";
import { logger } from "./logger";

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!env.enableMonitoring) {
    return;
  }

  logger.error("Captured application error", {
    context,
    error,
  });
}

export function installGlobalMonitoring() {
  if (!env.enableMonitoring) {
    return () => undefined;
  }

  const handleError = (event: ErrorEvent) => {
    captureError(event.error ?? event.message, { type: "window.error" });
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    captureError(event.reason, { type: "window.unhandledrejection" });
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleRejection);

  return () => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleRejection);
  };
}
