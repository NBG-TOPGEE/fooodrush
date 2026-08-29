import { api } from "./client";
import type { Role, User } from "@/data/types";

/**
 * Auth calls, matching the real Spring Boot DTOs:
 *   com.foodrush.dto.Dtos.RegisterRequest / LoginRequest
 *   com.foodrush.entity.User (id: number, role: CUSTOMER|RESTAURANT|RIDER|ADMIN)
 *
 * The backend's User shape doesn't match the frontend's UI-facing `User`
 * type (numeric id, upper-case role, `name` instead of `fullName`), so
 * responses are mapped through `toUser` below instead of changing the
 * shared domain type that Navbar/checkout already depend on.
 */

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
};

type BackendUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "RESTAURANT" | "RIDER" | "ADMIN";
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthPayload = { user: BackendUser; token: string };
export type AuthResult = { user: User; token: string };

function toUser(backendUser: BackendUser): User {
  return {
    id: String(backendUser.id),
    fullName: backendUser.name,
    email: backendUser.email,
    phone: backendUser.phone ?? "",
    role: backendUser.role.toLowerCase() as Role,
  };
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const { data } = await api.post<AuthPayload>("/auth/login", payload);
  return { user: toUser(data.user), token: data.token };
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const { data } = await api.post<AuthPayload>("/auth/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    role: payload.role?.toUpperCase(),
  });
  return { user: toUser(data.user), token: data.token };
}

export async function me(): Promise<User> {
  const { data } = await api.get<BackendUser>("/auth/me");
  return toUser(data);
}

// Note: the backend uses stateless JWT auth and has no /auth/logout route.
// Sessions end purely client-side — see useAuth().signOut, which clears the
// stored token and user without calling the API. Do not add a call here.
