'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchCategoriesSummary,
  fetchStores,
  searchStores,
  fetchNearbyStores,
  fetchStoreById,
  fetchBusLines,
  fetchYpsBusLines,
  fetchBusRouteDetail,
  fetchNearbyBusStopsForStore,
} from '../services/api';

// Categories Summary Query Hook (24h stale time since categories are virtually static)
export function useCategoriesSummary() {
  return useQuery({
    queryKey: ['categoriesSummary'],
    queryFn: () => fetchCategoriesSummary(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

// Full Stores List Query Hook
export function useStores(category?: string | null) {
  return useQuery({
    queryKey: ['stores', 'all', category || 'all'],
    queryFn: () => fetchStores(category || undefined),
    staleTime: 30 * 60 * 1000, // 30 mins
  });
}

// Paginated Store Search Query Hook
export function useSearchStores(
  query: string,
  category: string | null,
  pageNumber = 1,
  pageSize = 10,
  enabled = true
) {
  return useQuery({
    queryKey: ['stores', 'search', query, category || 'all', pageNumber, pageSize],
    queryFn: () => searchStores(query, category || undefined, pageNumber, pageSize),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 mins
  });
}

// Geo-Spatial Nearby Stores Query Hook
export function useNearbyStores(
  latitude: number,
  longitude: number,
  radiusKm = 2.0,
  minRadiusKm = 0.3,
  category: string | null = null,
  pageNumber = 1,
  pageSize = 10,
  enabled = true
) {
  return useQuery({
    queryKey: [
      'stores',
      'nearby',
      latitude.toFixed(4),
      longitude.toFixed(4),
      radiusKm,
      minRadiusKm,
      category || 'all',
      pageNumber,
      pageSize,
    ],
    queryFn: () =>
      fetchNearbyStores(
        latitude,
        longitude,
        radiusKm,
        minRadiusKm,
        category || undefined,
        pageNumber,
        pageSize
      ),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 mins
  });
}

// Single Store Detail Query Hook
export function useStoreById(id: number | null) {
  return useQuery({
    queryKey: ['stores', 'detail', id],
    queryFn: () => fetchStoreById(id!),
    enabled: id !== null && id > 0,
    staleTime: 30 * 60 * 1000, // 30 mins
  });
}

// All Bus Lines Query Hook
export function useBusLines() {
  return useQuery({
    queryKey: ['busLines', 'all'],
    queryFn: () => fetchBusLines(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Paginated YPS Bus Lines Query Hook
export function useYpsBusLines(keyword?: string, pageNumber = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['busLines', 'yps', keyword || '', pageNumber, pageSize],
    queryFn: () => fetchYpsBusLines(keyword, pageNumber, pageSize),
    staleTime: 30 * 60 * 1000, // 30 mins
  });
}

// Bus Route Detail Query Hook
export function useBusRouteDetail(busNumber: string | null) {
  return useQuery({
    queryKey: ['busLines', 'routeDetail', busNumber],
    queryFn: () => fetchBusRouteDetail(busNumber!),
    enabled: !!busNumber,
    staleTime: 30 * 60 * 1000,
  });
}

// Nearby Bus Stops for a Store Query Hook
export function useNearbyBusStopsForStore(storeId: number | null) {
  return useQuery({
    queryKey: ['busLines', 'nearbyStore', storeId],
    queryFn: () => fetchNearbyBusStopsForStore(storeId!),
    enabled: storeId !== null && storeId > 0,
    staleTime: 30 * 60 * 1000,
  });
}
