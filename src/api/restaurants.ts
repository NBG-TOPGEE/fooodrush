import { api } from "./client";
import type { Restaurant } from "@/data/types";

export type RestaurantQuery = {
  search?: string;
  category?: string;
  sort?: string;
  minRating?: number;
};

export async function getRestaurants(params: RestaurantQuery = {}) {
  const { data } = await api.get<Restaurant[]>("/restaurants", { params });
  return data;
}

export async function getRestaurant(id: string) {
  const { data } = await api.get<Restaurant>(`/restaurants/${id}`);
  return data;
}

export async function getFeaturedRestaurants() {
  const { data } = await api.get<Restaurant[]>("/restaurants/featured");
  return data;
}
