import axios from "axios";
import { env } from "../../app/config/env";
import { getAuthToken } from "../authToken";
import { logger } from "../logger";
import { captureError } from "../monitoring";
import { mockApiAdapter } from "../mockApi";

export const apiClient = axios.create({
  adapter: mockApiAdapter,
  baseURL: env.apiBaseUrl,
  timeout: 2200,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  logger.debug("API request", {
    method: config.method,
    params: config.params,
    url: config.url,
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    logger.debug("API response", {
      status: response.status,
      url: response.config.url,
    });

    return response;
  },
  (error) => {
    captureError(error, {
      source: "apiClient",
      url: error.config?.url,
    });

    return Promise.reject(error);
  },
);
