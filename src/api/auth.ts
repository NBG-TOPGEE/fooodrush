import { api } from "./client";
import type { Role, User } from "@/data/types";

/**
 * Auth calls. Endpoint paths and payload shapes are placeholders — swap them
 * for the real Spring Boot DTOs when the backend is connected.
 */

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: Role;
};
export type AuthResponse = { token: string; user: User };

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function me() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}
