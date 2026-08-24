import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — FoodRush" },
      { name: "description", content: "Register on FoodRush, Lagos food delivery." },
      { property: "og:title", content: "Register — FoodRush" },
      { property: "og:description", content: "Register on FoodRush, Lagos food delivery." },
    ],
  }),
  component: () => (
    <AppShell>
      <section className="container-page py-16">
        <h1 className="font-display text-3xl font-bold">Register</h1>
        <p className="mt-2 text-muted-foreground">This page is coming next.</p>
      </section>
    </AppShell>
  ),
});
