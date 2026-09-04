import { queryOptions } from "@tanstack/react-query";
import { getMenu } from "@/api/menu";
import { getRestaurant, getRestaurants, type RestaurantQuery } from "@/api/restaurants";
import { mockAddresses, mockCategories, mockOrders, mockPopularItems } from "@/data/mock";

/**
 * Query layer. Restaurant discovery, restaurant detail, and menu now call
 * the real Spring Boot API (see src/api/restaurants.ts, src/api/menu.ts).
 *
 * categories/popular-items/orders/addresses are still mock — later
 * integration phases (see PROJECT.md-style brief: categories don't map 1:1
 * onto the backend's per-menu-item category counts, and orders/addresses
 * are their own phases).
 */

const delay = <T>(value: T, ms = 350) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export const restaurantsQuery = (params: RestaurantQuery = {}) =>
  queryOptions({
    queryKey: ["restaurants", params],
    queryFn: () => getRestaurants(params),
  });

export const restaurantQuery = (id: string) =>
  queryOptions({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurant(id),
  });

export const menuQuery = (restaurantId: string) =>
  queryOptions({
    queryKey: ["menu", restaurantId],
    queryFn: () => getMenu(restaurantId),
  });

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: () => delay(mockCategories, 120) });

export const popularItemsQuery = () =>
  queryOptions({ queryKey: ["popular-items"], queryFn: () => delay(mockPopularItems) });

export const ordersQuery = () =>
  queryOptions({ queryKey: ["orders"], queryFn: () => delay(mockOrders) });

export const orderQuery = (id: string) =>
  queryOptions({
    queryKey: ["order", id],
    queryFn: () =>
      delay(mockOrders.find((order) => order.id === id || order.reference === id) ?? null),
  });

export const addressesQuery = () =>
  queryOptions({ queryKey: ["addresses"], queryFn: () => delay(mockAddresses, 150) });
