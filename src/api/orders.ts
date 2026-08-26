import { api } from "./client";
import type { Order } from "@/data/types";
import { buildOrder, persistOrder, type OrderDraft } from "./orders.local";

export type PlaceOrderPayload = {
  restaurantId: string;
  items: { menuItemId: string; quantity: number; note?: string }[];
  addressId: string;
  fulfilment: "delivery" | "pickup";
  paymentMethod: string;
  note?: string;
};

export async function getOrders() {
  const { data } = await api.get<Order[]>("/orders");
  return data;
}

export async function getOrder(id: string) {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const { data } = await api.post<Order>("/orders", payload);
  return data;
}

export async function cancelOrder(id: string) {
  const { data } = await api.post<Order>(`/orders/${id}/cancel`);
  return data;
}

/**
 * Order submission used by /checkout.
 *
 * Today it creates the order locally (demo mock persistence) so the customer
 * flow works end to end. Backend integration = replace the body with:
 *
 *   return placeOrder(payload)
 *
 * and keep the same return type (Order).
 */
export async function submitOrder(draft: OrderDraft): Promise<Order> {
  const order = buildOrder(draft);
  await new Promise((resolve) => setTimeout(resolve, 550));
  persistOrder(order);
  return order;
}
