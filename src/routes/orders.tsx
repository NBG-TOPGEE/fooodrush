import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Clock, MapPin, Receipt, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { mockOrders } from "@/data/mock";
import type { Order } from "@/data/types";
import { formatDateTime, formatNaira } from "@/utils/format";

const HISTORY_KEY = "foodrush.ordersHistory";
const LAST_ORDER_KEY = "foodrush.lastOrder";

const PAYMENT_LABELS: Record<string, string> = {
  card: "Card",
  transfer: "Bank transfer",
  cash: "Cash on delivery",
};

function paymentLabel(order: Order) {
  const method = (order as Order & { paymentMethod?: string }).paymentMethod;
  return method ? PAYMENT_LABELS[method] ?? method : "Card";
}

function readHistory(): Order[] | null {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Order[];
      if (Array.isArray(parsed)) return parsed;
    } else if (raw === null) {
      return null;
    }
  } catch {
    /* storage unavailable */
  }
  return [];
}

function mergeLastOrder(history: Order[]): Order[] {
  let last: Order | null = null;
  try {
    const raw = window.localStorage.getItem(LAST_ORDER_KEY);
    if (raw) last = JSON.parse(raw) as Order;
  } catch {
    /* ignore */
  }
  if (!last) return history;
  const key = (order: Order) => order.reference || order.id;
  if (history.some((order) => key(order) === key(last!))) return history;
  return [last, ...history];
}

function dedupe(orders: Order[]): Order[] {
  const seen = new Set<string>();
  return orders.filter((order) => {
    const key = order.reference || order.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — FoodRush" },
      {
        name: "description",
        content: "Track your current FoodRush orders and revisit your order history from Lagos kitchens.",
      },
      { property: "og:title", content: "Your orders — FoodRush" },
      { property: "og:description", content: "Track current and past FoodRush orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = readHistory();
    let history: Order[];
    if (stored === null) {
      // Seed demo history only on the very first visit (key absent).
      history = [...mockOrders];
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch {
        /* storage unavailable */
      }
    } else {
      history = stored;
    }
    setOrders(dedupe(mergeLastOrder(history)));
    setLoaded(true);
  }, []);

  const counts = useMemo(() => {
    const active = orders.filter(
      (order) => order.status !== "delivered" && order.status !== "cancelled",
    ).length;
    return { active, total: orders.length };
  }, [orders]);

  if (!loaded) {
    return (
      <AppShell>
        <section className="container-page py-16">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </section>
      </AppShell>
    );
  }

  if (orders.length === 0) {
    return (
      <AppShell>
        <section className="container-page py-12 md:py-16">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Your orders</h1>
          <div className="mt-8 max-w-xl">
            <EmptyState
              emoji="🧺"
              title="No orders yet"
              description="Once you place an order it'll appear here with live tracking, your receipt and order history."
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

  return (
    <AppShell>
      <section className="container-page py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Your orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {counts.active > 0
                ? `${counts.active} active · ${counts.total} total`
                : `${counts.total} past order${counts.total === 1 ? "" : "s"}`}
            </p>
          </div>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <ShoppingBag className="size-4" aria-hidden /> Order again
          </Link>
        </div>

        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const isOpen = expanded[order.id] ?? false;
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li
                key={order.id}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {order.restaurantImage ? (
                      <img
                        src={order.restaurantImage}
                        alt=""
                        className="size-14 shrink-0 rounded-2xl object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={order.status} />
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                          <Receipt className="size-3.5" aria-hidden /> {order.reference}
                        </span>
                      </div>
                      <h2 className="mt-2 font-display text-lg font-bold">{order.restaurantName}</h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden /> {formatDateTime(order.placedAt)}
                        </span>
                        <span>·</span>
                        <span>
                          {order.status === "delivered" || order.status === "cancelled"
                            ? "Completed"
                            : `ETA ${order.etaMinutes} min`}
                        </span>
                        <span>·</span>
                        <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold">{formatNaira(order.total)}</p>
                      <p className="text-xs text-muted-foreground">{paymentLabel(order)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <span className="inline-flex flex-1 items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span className="line-clamp-1">{order.address}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => ({ ...prev, [order.id]: !isOpen }))}
                      aria-expanded={isOpen}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
                    >
                      {isOpen ? "Hide details" : "View details"}
                      <ChevronDown
                        className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border bg-muted/30 px-5 py-5">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Ordered items
                    </h3>
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex items-start justify-between gap-3">
                          <span>
                            <span className="font-semibold">{item.quantity}×</span> {item.name}
                          </span>
                          <span className="shrink-0 font-semibold">
                            {formatNaira(item.price * item.quantity)}
                          </span>
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
                    {order.rider && (
                      <p className="mt-4 text-xs text-muted-foreground">
                        Rider · <span className="font-semibold text-foreground">{order.rider.name}</span> ·{" "}
                        {order.rider.vehicle}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
