import { api } from "./client";
import type { MenuItem } from "@/data/types";

/**
 * Menu + categories, matching:
 *   GET /api/restaurants/{id}/menu -> { restaurantId, items }
 *   GET /api/categories -> { categories: [{ name, itemCount }] }
 * See com.foodrush.entity.MenuItem / RestaurantService.categories().
 */

type BackendMenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  imageUrl: string | null;
  // Jackson serializes the isAvailable() getter as "available".
  available: boolean;
  options: { id: number; name: string; price: number; available: boolean }[];
};

type MenuResponse = { restaurantId: number; items: BackendMenuItem[] };

function toMenuItem(item: BackendMenuItem, restaurantId: string): MenuItem {
  return {
    id: String(item.id),
    // The backend's MenuItem->Restaurant relation is @JsonIgnore'd, so each
    // item has no restaurantId of its own in the response — pass in the id
    // we already fetched the menu for instead of reading it off the item.
    restaurantId,
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    imageUrl: item.imageUrl ?? "",
    // Frontend calls this grouping field "section"; backend calls it "category".
    section: item.category || "Menu",
    // tags/popular/spicy aren't modeled on the backend — left undefined,
    // which FoodCard already renders gracefully.
  };
}

export async function getMenu(restaurantId: string): Promise<MenuItem[]> {
  const { data } = await api.get<MenuResponse>(`/restaurants/${restaurantId}/menu`);
  return data.items.map((item) => toMenuItem(item, restaurantId));
}

type BackendCategory = { name: string; itemCount: number };

/**
 * NOTE: this is menu-item category aggregation (item counts across every
 * restaurant's menu), not the curated cuisine taxonomy (with slugs/emojis)
 * the homepage/discovery chips use — those two concepts don't map 1:1. See
 * hooks/queries.ts for how the chips are handled until that's reconciled.
 */
export async function getMenuItemCategories() {
  const { data } = await api.get<{ categories: BackendCategory[] }>("/categories");
  return data.categories;
}
