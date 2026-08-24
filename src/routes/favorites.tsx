import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — FoodRush" },
      { name: "description", content: "Favorites on FoodRush, Lagos food delivery." },
      { property: "og:title", content: "Favorites — FoodRush" },
      { property: "og:description", content: "Favorites on FoodRush, Lagos food delivery." },
    ],
  }),
  component: () => (
    <AppShell>
      <section className="container-page py-16">
        <h1 className="font-display text-3xl font-bold">Favorites</h1>
        <p className="mt-2 text-muted-foreground">This page is coming next.</p>
      </section>
    </AppShell>
  ),
});
