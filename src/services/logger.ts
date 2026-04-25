import { env } from "../app/config/env";

type LogLevel = "debug" | "error" | "info" | "warn";

function writeLog(level: LogLevel, message: string, context?: unknown) {
  if (!env.enableApiLogging && level === "debug") {
    return;
  }

  const logger = console[level] ?? console.log;
  logger(`[${env.appName}] ${message}`, context ?? "");
}

export const logger = {
  debug(message: string, context?: unknown) {
    writeLog("debug", message, context);
  },
  error(message: string, context?: unknown) {
    writeLog("error", message, context);
  },
  info(message: string, context?: unknown) {
    writeLog("info", message, context);
  },
  warn(message: string, context?: unknown) {
    writeLog("warn", message, context);
  },
};
