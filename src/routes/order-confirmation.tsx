import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, MapPin, PartyPopper, Receipt, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { Order } from "@/data/types";
import { formatDateTime, formatNaira } from "@/utils/format";

const STORAGE_KEY = "foodrush.lastOrder";

const PAYMENT_LABELS: Record<string, string> = {
  card: "Card",
  transfer: "Bank transfer",
  cash: "Cash on delivery",
};

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order confirmed — FoodRush" },
      {
        name: "description",
        content: "Your FoodRush order is confirmed. Track your delivery from Lagos kitchens in real time.",
      },
      { property: "og:title", content: "Order confirmed — FoodRush" },
      { property: "og:description", content: "Your FoodRush order is confirmed and on its way." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderConfirmationPage,
});

function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setOrder(JSON.parse(raw) as Order);
    } catch {
      /* storage unavailable */
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <AppShell>
        <section className="container-page py-16">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </section>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell>
        <section className="container-page py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Order confirmation</h1>
          <div className="mt-8 max-w-xl">
            <EmptyState
              emoji="🧺"
              title="No recent order"
              description="Place an order and you'll see the confirmation, delivery ETA and receipt right here."
              action={
                <Link
                  to="/restaurants"
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  Browse restaurants
                </Link>
              }
            />
          </div>
        </section>
      </AppShell>
    );
  }

  const paymentLabel =
    (order as Order & { paymentMethod?: string }).paymentMethod
      ? PAYMENT_LABELS[(order as Order & { paymentMethod?: string }).paymentMethod!] ??
        (order as Order & { paymentMethod?: string }).paymentMethod!
      : "Card";

  return (
    <AppShell>
      <section className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-2xl">
          {/* Success header */}
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-soft md:p-8">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent-soft text-accent">
              <PartyPopper className="size-8" aria-hidden />
            </div>
            <h1 className="mt-5 flex items-center justify-center gap-2 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
              <CheckCircle2 className="size-6 text-accent" aria-hidden /> Order confirmed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your order is confirmed and the kitchen is getting ready to cook.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <StatusBadge status={order.status} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <Receipt className="size-3.5" aria-hidden /> {order.reference}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Clock className="size-3.5" aria-hidden /> ETA {order.etaMinutes} min
              </span>
            </div>
          </div>

          {/* Restaurant + delivery */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                From
              </h2>
              <div className="mt-2 flex items-center gap-3">
                {order.restaurantImage ? (
                  <img
                    src={order.restaurantImage}
                    alt=""
                    className="size-12 rounded-xl object-cover"
                  />
                ) : null}
                <span className="font-semibold">{order.restaurantName}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Placed {formatDateTime(order.placedAt)}</p>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Delivery
              </h2>
              <p className="mt-2 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{order.address}</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Payment · <span className="font-semibold text-foreground">{paymentLabel}</span>
              </p>
            </div>
          </div>

          {/* Items + totals */}
          <div className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-lg font-bold">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {order.items.map((item, index) => (
                <li key={index} className="flex items-start justify-between gap-3 text-sm">
                  <span>
                    <span className="font-semibold">{item.quantity}×</span> {item.name}
                  </span>
                  <span className="shrink-0 font-semibold">{formatNaira(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatNaira(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Delivery fee</dt>
                <dd>{formatNaira(order.deliveryFee)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Service fee</dt>
                <dd>{formatNaira(order.serviceFee)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatNaira(order.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/orders"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="size-4" aria-hidden /> Track my order
            </Link>
            <Link
              to="/restaurants"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              Order more food
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
