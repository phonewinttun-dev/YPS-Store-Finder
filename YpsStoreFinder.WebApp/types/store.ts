export interface StoreDto {
  id: number;
  category: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  description: string | null;
  rawAttributes: string | null;
  distanceKm: number | null;
}

export interface CategorySummaryDto {
  category: string;
  count: number;
}

export interface ApiResult<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  isFailure: boolean;
}

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isTracking: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  error: string | null;
}
