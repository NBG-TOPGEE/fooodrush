import { queryOptions } from "@tanstack/react-query";
import type { RestaurantQuery } from "@/api/restaurants";
import {
  mockAddresses,
  mockCategories,
  mockMenu,
  mockOrders,
  mockPopularItems,
  mockRestaurants,
} from "@/data/mock";
import type { MenuItem, Restaurant } from "@/data/types";

/**
 * Query layer. Each queryFn currently resolves mock data; swapping in the
 * matching function from src/api/* is the whole backend integration step.
 *
 *   queryFn: () => getRestaurants(params)
 */

const delay = <T,>(value: T, ms = 350) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

function filterRestaurants(params: RestaurantQuery): Restaurant[] {
  const search = params.search?.trim().toLowerCase();
  let list = [...mockRestaurants];

  if (search) {
    list = list.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.tagline.toLowerCase().includes(search) ||
        restaurant.area.toLowerCase().includes(search),
    );
  }
  if (params.category) {
    list = list.filter((restaurant) => restaurant.categories.includes(params.category!));
  }
  if (params.minRating) {
    list = list.filter((restaurant) => restaurant.rating >= params.minRating!);
  }

  switch (params.sort) {
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "delivery-time":
      list.sort((a, b) => a.deliveryMinutes[0] - b.deliveryMinutes[0]);
      break;
    case "delivery-fee":
      list.sort((a, b) => a.deliveryFee - b.deliveryFee);
      break;
    default:
      list.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return list;
}

export const restaurantsQuery = (params: RestaurantQuery = {}) =>
  queryOptions({
    queryKey: ["restaurants", params],
    queryFn: () => delay(filterRestaurants(params)),
  });

export const restaurantQuery = (id: string) =>
  queryOptions({
    queryKey: ["restaurant", id],
    queryFn: () => delay(mockRestaurants.find((restaurant) => restaurant.id === id) ?? null),
  });

export const menuQuery = (restaurantId: string) =>
  queryOptions({
    queryKey: ["menu", restaurantId],
    queryFn: () => delay<MenuItem[]>(mockMenu(restaurantId)),
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
