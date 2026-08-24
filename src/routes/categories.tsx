import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — FoodRush" },
      { name: "description", content: "Categories on FoodRush, Lagos food delivery." },
      { property: "og:title", content: "Categories — FoodRush" },
      { property: "og:description", content: "Categories on FoodRush, Lagos food delivery." },
    ],
  }),
  component: () => (
    <AppShell>
      <section className="container-page py-16">
        <h1 className="font-display text-3xl font-bold">Categories</h1>
        <p className="mt-2 text-muted-foreground">This page is coming next.</p>
      </section>
    </AppShell>
  ),
});
