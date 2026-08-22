import { api } from "./client";
import type { MenuItem } from "@/data/types";

export async function getMenu(restaurantId: string) {
  const { data } = await api.get<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
  return data;
}

export async function getMenuItem(restaurantId: string, itemId: string) {
  const { data } = await api.get<MenuItem>(`/restaurants/${restaurantId}/menu/${itemId}`);
  return data;
}

export async function getCategories() {
  const { data } = await api.get<{ id: string; name: string }[]>("/categories");
  return data;
}
