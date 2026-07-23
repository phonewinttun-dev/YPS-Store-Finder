import { ApiResult, StoreDto, CategorySummaryDto } from '../types/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5257';

export async function fetchStores(category?: string): Promise<ApiResult<StoreDto[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/stores`);
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || 'Failed to fetch stores.',
      data: null,
      isFailure: true,
    };
  }
}

export async function searchStores(query?: string, category?: string): Promise<ApiResult<StoreDto[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/stores/search`);
    if (query) url.searchParams.append('query', query);
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || 'Failed to search stores.',
      data: null,
      isFailure: true,
    };
  }
}

export async function fetchCategoriesSummary(): Promise<ApiResult<CategorySummaryDto[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stores/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || 'Failed to fetch categories summary.',
      data: null,
      isFailure: true,
    };
  }
}

export async function fetchNearbyStores(
  latitude: number,
  longitude: number,
  radiusKm = 5.0,
  category?: string
): Promise<ApiResult<StoreDto[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/stores/nearby`);
    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('longitude', longitude.toString());
    url.searchParams.append('radiusKm', radiusKm.toString());
    if (category) url.searchParams.append('category', category);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || 'Failed to fetch nearby stores.',
      data: null,
      isFailure: true,
    };
  }
}

export async function fetchStoreById(id: number): Promise<ApiResult<StoreDto>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stores/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || 'Failed to fetch store details.',
      data: null,
      isFailure: true,
    };
  }
}
