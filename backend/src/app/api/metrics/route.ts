import { db } from "@/db";
import { users, restaurants, deliveryRiders, orders, payments } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Prometheus-compatible metrics endpoint (scrape target for the
 * Prometheus/Grafana monitoring stack).
 */
export async function GET() {
  try {
    const [usersTotal] = await db.select({ v: count() }).from(users);
    const [restaurantsTotal] = await db.select({ v: count() }).from(restaurants);
    const [ridersTotal] = await db.select({ v: count() }).from(deliveryRiders);
    const [ordersTotal] = await db.select({ v: count() }).from(orders);
    const [ordersDelivered] = await db.select({ v: count() }).from(orders).where(eq(orders.status, "delivered"));
    const [ordersCancelled] = await db.select({ v: count() }).from(orders).where(eq(orders.status, "cancelled"));
    const [paymentsFailed] = await db.select({ v: count() }).from(payments).where(eq(payments.status, "failed"));

    const active = ordersTotal.v - ordersDelivered.v - ordersCancelled.v;

    const body = [
      "# HELP foodrush_orders_total Total orders placed.",
      "# TYPE foodrush_orders_total gauge",
      `foodrush_orders_total ${ordersTotal.v}`,
      "# HELP foodrush_orders_delivered_total Orders delivered.",
      "# TYPE foodrush_orders_delivered_total counter",
      `foodrush_orders_delivered_total ${ordersDelivered.v}`,
      "# HELP foodrush_orders_cancelled_total Orders cancelled.",
      "# TYPE foodrush_orders_cancelled_total counter",
      `foodrush_orders_cancelled_total ${ordersCancelled.v}`,
      "# HELP foodrush_orders_active Active (in-progress) orders.",
      "# TYPE foodrush_orders_active gauge",
      `foodrush_orders_active ${active}`,
      "# HELP foodrush_payments_failed_total Failed payments.",
      "# TYPE foodrush_payments_failed_total counter",
      `foodrush_payments_failed_total ${paymentsFailed.v}`,
      "# HELP foodrush_users_total Registered users.",
      "# TYPE foodrush_users_total gauge",
      `foodrush_users_total ${usersTotal.v}`,
      "# HELP foodrush_restaurants_total Registered restaurants.",
      "# TYPE foodrush_restaurants_total gauge",
      `foodrush_restaurants_total ${restaurantsTotal.v}`,
      "# HELP foodrush_riders_total Registered riders.",
      "# TYPE foodrush_riders_total gauge",
      `foodrush_riders_total ${ridersTotal.v}`,
    ].join("\n");

    return new Response(body + "\n", {
      headers: { "Content-Type": "text/plain; version=0.0.4" },
    });
  } catch {
    return new Response("", { status: 500 });
  }
}
