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

export interface PaginationDto {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PagedResultDto<T> {
  isSuccess: boolean;
  message: string;
  data: T[];
  pagination: PaginationDto | null;
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
