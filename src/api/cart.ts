import { api } from "./client";
import type { CartLine } from "@/data/types";

/**
 * The cart is client-side for now (see useCart). These functions exist so a
 * server-side cart can be adopted without touching UI components.
 */

export async function getCart() {
  const { data } = await api.get<CartLine[]>("/cart");
  return data;
}

export async function syncCart(lines: CartLine[]) {
  const { data } = await api.put<CartLine[]>("/cart", { lines });
  return data;
}

export async function clearRemoteCart() {
  await api.delete("/cart");
}
