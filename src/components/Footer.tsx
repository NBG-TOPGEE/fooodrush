import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-lg">🍲</span>
            <span className="font-display text-xl font-extrabold">FoodRush</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-foreground/70">
            Hot meals from the best kitchens in Lagos, delivered in minutes.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-foreground/60">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/restaurants" className="text-ink-foreground/80 hover:text-primary">
                Restaurants
              </Link>
            </li>
            <li>
              <Link to="/categories" className="text-ink-foreground/80 hover:text-primary">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/orders" className="text-ink-foreground/80 hover:text-primary">
                My orders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-foreground/60">
            Partners
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
            <li>List your restaurant</li>
            <li>Become a rider</li>
            <li>Business orders</li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-foreground/60">
            Support
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
            <li>help@foodrush.ng</li>
            <li>+234 800 FOODRUSH</li>
            <li>Mon–Sun, 8am–11pm</li>
          </ul>
        </div>
      </div>
      <div className="container-page border-t border-ink-foreground/10 py-6 text-xs text-ink-foreground/60">
        © {new Date().getFullYear()} FoodRush. All rights reserved.
      </div>
    </footer>
  );
}
