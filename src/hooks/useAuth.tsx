import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearToken, setToken } from "@/api/client";
import type { Role, User } from "@/data/types";

/**
 * Session state for the frontend. Today it persists a mock user locally; once
 * the Spring Boot API is connected, `signIn` receives { token, user } from
 * src/api/auth.ts and nothing else has to change.
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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      window.localStorage.removeItem(USER_KEY);
    }
    setIsReady(true);
  }, []);

  const signIn = useCallback((nextUser: User, token?: string) => {
    setUser(nextUser);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    if (token) setToken(token);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(USER_KEY);
    clearToken();
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
