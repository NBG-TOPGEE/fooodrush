import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { me } from "@/api/auth";
import { clearToken, getToken, setToken } from "@/api/client";
import type { Role, User } from "@/data/types";

/**
 * Session state for the frontend, backed by the real Spring Boot API.
 * On load, a cached user is shown immediately (if any) and then confirmed
 * against GET /auth/me; an invalid/expired token signs the session out.
 * `signIn` is called by /login and /register with the mapped { user, token }
 * from src/api/auth.ts.
 */

const USER_KEY = "foodrush.user";

type AuthContextValue = {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isReady: boolean;
  signIn: (user: User, token?: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const signOut = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(USER_KEY);
    clearToken();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      let cached: User | null = null;
      try {
        const raw = window.localStorage.getItem(USER_KEY);
        if (raw) cached = JSON.parse(raw) as User;
      } catch {
        window.localStorage.removeItem(USER_KEY);
      }

      const token = getToken();
      if (!token) {
        if (!cancelled) setIsReady(true);
        return;
      }

      // Show the cached user immediately, then confirm the token is still
      // valid (and pick up any account changes) against the backend.
      if (cached && !cancelled) setUser(cached);

      try {
        const fresh = await me();
        if (!cancelled) {
          setUser(fresh);
          window.localStorage.setItem(USER_KEY, JSON.stringify(fresh));
        }
      } catch {
        // Invalid/expired token — the response interceptor already clears it
        // on a 401; make sure local session state matches.
        if (!cancelled) {
          setUser(null);
          window.localStorage.removeItem(USER_KEY);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback((nextUser: User, token?: string) => {
    setUser(nextUser);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    if (token) setToken(token);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isReady,
      signIn,
      signOut,
    }),
    [user, isReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
