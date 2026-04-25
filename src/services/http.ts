import axios from "axios";
export { apiClient as http } from "./api/client";
export { apiGet, apiPatch, apiPost } from "./api/request";

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
