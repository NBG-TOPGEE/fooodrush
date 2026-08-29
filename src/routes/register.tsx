import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { register } from "@/api/auth";
import { isApiError } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — FoodRush" },
      { name: "description", content: "Register on FoodRush, Lagos food delivery." },
      { property: "og:title", content: "Register — FoodRush" },
      { property: "og:description", content: "Register on FoodRush, Lagos food delivery." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    // New signups are always CUSTOMER accounts here — restaurant/rider/admin
    // onboarding is a later phase (see backend AuthService, which also
    // rejects self-registering as ADMIN).
    mutationFn: register,
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    mutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      password,
    });
  }

  return (
    <AppShell>
      <section className="container-page flex justify-center py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-soft"
        >
          <h1 className="font-display text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Order Lagos's best food, delivered fast.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="font-semibold">Full name</span>
              <input
                value={name}
                required
                minLength={2}
                autoComplete="name"
                placeholder="Ada Obi"
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
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
              <span className="font-semibold">Phone</span>
              <input
                type="tel"
                value={phone}
                autoComplete="tel"
                placeholder="080…"
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Password</span>
              <input
                type="password"
                value={password}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
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
            {mutation.isPending ? "Creating account…" : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-foreground hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </AppShell>
  );
}
