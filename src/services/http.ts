import axios from "axios";
import { mockApiAdapter } from "./mockApi";

export const http = axios.create({
  adapter: mockApiAdapter,
  baseURL: "/api",
  timeout: 1200,
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message;

    return message || "Something went wrong. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
