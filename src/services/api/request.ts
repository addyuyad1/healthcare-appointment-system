import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./client";

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.post<TResponse>(url, payload, config);
  return response.data;
}

export async function apiPatch<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.patch<TResponse>(url, payload, config);
  return response.data;
}
