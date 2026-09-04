import { api } from "./client";
import { mockRestaurants } from "@/data/mock";
import type { Restaurant } from "@/data/types";

/**
 * Restaurant discovery, matching the real Spring Boot endpoints:
 *   GET /api/restaurants  -> { items, total, page, limit, pages }
 *   GET /api/restaurants/{id} -> { restaurant, menu, reviewCount }
 * See com.foodrush.controller.RestaurantController / entity.Restaurant.
 *
 * Backend limitations (see notes on the mapper below) mean a few fields the
 * existing UI expects — minOrder, distanceKm, a delivery *window*, multiple
 * cuisine tags — aren't modeled server-side yet. Rather than inventing that
 * data, these are approximated/defaulted and called out explicitly so they
 * can be revisited once the backend supports them.
 */

export type RestaurantQuery = {
  search?: string;
  category?: string;
  sort?: "nearest" | "rating" | "delivery-time" | "delivery-fee" | string;
  minRating?: number;
};

type BackendRestaurant = {
  id: number;
  ownerId: number | null;
  name: string;
  description: string | null;
  cuisine: string;
  imageUrl: string | null;
  address: string;
  city: string;
  phone: string | null;
  rating: number;
  ratingCount: number;
  deliveryFee: number;
  deliveryTimeMinutes: number;
  // Jackson serializes boolean getters isOpen()/isApproved() by stripping
  // "is", so the JSON keys are "open"/"approved", not "isOpen"/"isApproved".
  open: boolean;
  approved: boolean;
};

type RestaurantListResponse = {
  items: BackendRestaurant[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type RestaurantDetailResponse = {
  restaurant: BackendRestaurant;
  menu: unknown[];
  reviewCount: number;
};

function toRestaurant(r: BackendRestaurant, reviewCount = 0): Restaurant {
  return {
    id: String(r.id),
    name: r.name,
    tagline: r.description?.trim() || `${r.cuisine} kitchen in ${r.city}`,
    imageUrl: r.imageUrl ?? "",
    // The backend models a single cuisine per restaurant, not the curated
    // multi-tag taxonomy the discovery page's category chips use — see
    // hooks/queries.ts for how that mismatch is handled today.
    categories: [r.cuisine],
    rating: r.rating,
    reviewCount,
    // The backend only stores one estimate (deliveryTimeMinutes); approximate
    // a display window around it rather than inventing a separate range.
    deliveryMinutes: [r.deliveryTimeMinutes, r.deliveryTimeMinutes + 10],
    deliveryFee: r.deliveryFee,
    // Not modeled on the backend yet (no per-restaurant minimum order).
    minOrder: 0,
    // Not modeled on the backend yet (no user geolocation / distance calc).
    distanceKm: 0,
    area: r.city,
    isOpen: r.open,
  };
}

function backendSort(sort?: string): string | undefined {
  if (sort === "delivery-time") return "delivery_time";
  if (sort === "rating") return "rating";
  // "nearest" (no distance data server-side) and "delivery-fee" (no backend
  // sort key) fall back to the default and are sorted client-side below.
  return undefined;
}

export async function getRestaurants(params: RestaurantQuery = {}): Promise<Restaurant[]> {
  try {
    const { data } = await api.get<RestaurantListResponse>("/restaurants", {
      params: {
        q: params.search || undefined,
        cuisine: params.category || undefined,
        sort: backendSort(params.sort),
        page: 1,
        // No pagination UI exists yet (Phase 3 scope is discovery, not
        // paging); fetch a generous page so existing list views keep working.
        limit: 50,
      },
    });

    let items = data.items.map((r) => toRestaurant(r));

    if (params.minRating) {
      items = items.filter((r) => r.rating >= params.minRating!);
    }
    if (params.sort === "delivery-fee") {
      items = [...items].sort((a, b) => a.deliveryFee - b.deliveryFee);
    }

    return items;
  } catch (error) {
    let items = [...mockRestaurants];

    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(q) ||
          restaurant.tagline.toLowerCase().includes(q) ||
          restaurant.categories.some((category) => category.toLowerCase().includes(q)),
      );
    }

    if (params.category) {
      items = items.filter((restaurant) => restaurant.categories.includes(params.category!));
    }

    if (params.minRating) {
      items = items.filter((restaurant) => restaurant.rating >= params.minRating!);
    }

    if (params.sort === "delivery-fee") {
      items = [...items].sort((a, b) => a.deliveryFee - b.deliveryFee);
    }

    return items;
  }
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  try {
    const { data } = await api.get<RestaurantDetailResponse>(`/restaurants/${id}`);
    return toRestaurant(data.restaurant, data.reviewCount);
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404) {
      return null;
    }

    const fallback = mockRestaurants.find((restaurant) => restaurant.id === id);
    return fallback ?? null;
  }
}
