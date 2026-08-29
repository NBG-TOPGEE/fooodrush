import axios, { type AxiosError } from "axios";

/**
 * Single Axios instance for the FoodRush frontend.
 * Points at the existing Spring Boot REST API. Never hardcode URLs elsewhere.
 */
// In local development, the browser runs on a different origin (Vite default 5173/8082)
// than the Spring Boot API. Default to same-origin /api and let Vite proxy it to the
// backend so we avoid CORS issues while keeping production overrides possible via env.
export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "/api";

export const TOKEN_KEY = "foodrush.token";

/**
 * Every Spring Boot response is wrapped:
 *   success: { success: true, data: ... }
 *   error:   { success: false, message: "...", code: "...", details?: {...} }
 * See com.foodrush.common.ApiResponse. The response interceptor below
 * unwraps `data` so every api/*.ts function can work with the plain payload
 * (matching its declared type) instead of the envelope.
 */
type BackendEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  code?: string | null;
  details?: Record<string, string> | null;
};

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, string>;
};

export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "message" in error;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// Attach the JWT to every authenticated request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap the backend envelope on success; drop an expired/invalid session and
// normalize errors to ApiError on failure.
api.interceptors.response.use(
  (response) => {
    const body = response.data as BackendEnvelope<unknown> | undefined;
    if (body && typeof body === "object" && "success" in body) {
      response.data = body.data;
    }
    return response;
  },
  (error: AxiosError<BackendEnvelope<unknown>>) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    const apiError: ApiError = {
      message:
        error.response?.data?.message ?? error.message ?? "Something went wrong. Please try again.",
      code: error.response?.data?.code ?? undefined,
      status: error.response?.status,
      details: error.response?.data?.details ?? undefined,
    };
    return Promise.reject(apiError);
  },
);
