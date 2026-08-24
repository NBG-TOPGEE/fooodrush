import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/restaurants/$id")({
  head: () => ({
    meta: [
      { title: "Restaurant — FoodRush" },
      { name: "description", content: "Browse the menu and order from this Lagos kitchen." },
      { property: "og:title", content: "Restaurant — FoodRush" },
      { property: "og:description", content: "Browse the menu and order from this Lagos kitchen." },
    ],
  }),
  component: RestaurantDetail,
});

function RestaurantDetail() {
  const { id } = Route.useParams();
  return (
    <AppShell>
      <section className="container-page py-16">
        <h1 className="font-display text-3xl font-bold">{id}</h1>
        <p className="mt-2 text-muted-foreground">Menu for this kitchen is coming next.</p>
      </section>
    </AppShell>
  );
}
