import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { login } from "@/api/auth";
import { isApiError } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — FoodRush" },
      { name: "description", content: "Login on FoodRush, Lagos food delivery." },
      { property: "og:title", content: "Login — FoodRush" },
      { property: "og:description", content: "Login on FoodRush, Lagos food delivery." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, token }) => {
      signIn(user, token);
      navigate({ to: "/" });
    },
    onError: (err) => {
      setError(isApiError(err) ? err.message : "Something went wrong. Please try again.");
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate({ email: email.trim().toLowerCase(), password });
  }

  return (
    <AppShell>
      <section className="container-page flex justify-center py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-soft"
        >
          <h1 className="font-display text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in to order from your favorite kitchens.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="font-semibold">Email</span>
              <input
                type="email"
                value={email}
                required
                autoComplete="email"
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Password</span>
              <input
                type="password"
                value={password}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-70"
          >
            {mutation.isPending ? "Logging in…" : "Log in"}
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            New to FoodRush?{" "}
            <Link to="/register" className="font-semibold text-foreground hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </AppShell>
  );
}
