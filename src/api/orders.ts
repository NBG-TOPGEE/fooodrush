import { api } from "./client";
import type { Order } from "@/data/types";

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
