import {
  ApiResult,
  CategorySummaryDto,
  PagedResultDto,
  StoreDto,
} from "../types/store";
import {
  BusLineDto,
  BusRouteDetailDto,
  StoreNearbyBusStopsDto,
} from "../types/bus";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5257" ||
  "https://localhost:7261";

export async function fetchStores(
  category?: string,
): Promise<ApiResult<StoreDto[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/stores`);
    if (category) url.searchParams.append("category", category);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch stores.",
      data: null,
      isFailure: true,
    };
  }
}

// Paginated search results
export async function searchStores(
  query?: string,
  category?: string,
  pageNumber = 1,
  pageSize = 10,
): Promise<PagedResultDto<StoreDto>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/stores/search`);
    if (query) url.searchParams.append("query", query);
    if (category) url.searchParams.append("category", category);
    url.searchParams.append("pageNumber", pageNumber.toString());
    url.searchParams.append("pageSize", pageSize.toString());

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to search stores.",
      data: [],
      pagination: null,
      isFailure: true,
    };
  }
}

export async function fetchCategoriesSummary(): Promise<
  ApiResult<CategorySummaryDto[]>
> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stores/categories`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch categories summary.",
      data: null,
      isFailure: true,
    };
  }
}

// Paginated geo-spatial nearby results
export async function fetchNearbyStores(
  latitude: number,
  longitude: number,
  radiusKm = 2.0,
  minRadiusKm = 0.3,
  category?: string,
  pageNumber = 1,
  pageSize = 10,
): Promise<PagedResultDto<StoreDto>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/stores/nearby`);
    url.searchParams.append("latitude", latitude.toString());
    url.searchParams.append("longitude", longitude.toString());
    url.searchParams.append("radiusKm", radiusKm.toString());
    url.searchParams.append("minRadiusKm", minRadiusKm.toString());
    if (category) url.searchParams.append("category", category);
    url.searchParams.append("pageNumber", pageNumber.toString());
    url.searchParams.append("pageSize", pageSize.toString());

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch nearby stores.",
      data: [],
      pagination: null,
      isFailure: true,
    };
  }
}

export async function fetchStoreById(id: number): Promise<ApiResult<StoreDto>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stores/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch store details.",
      data: null,
      isFailure: true,
    };
  }
}

// YBS Bus Line API endpoints
export async function fetchBusLines(): Promise<ApiResult<BusLineDto[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/buses`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch bus lines.",
      data: null,
      isFailure: true,
    };
  }
}

export async function searchBusLines(
  keyword?: string,
  pageNumber = 1,
  pageSize = 20,
): Promise<PagedResultDto<BusLineDto>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/buses/search`);
    if (keyword) url.searchParams.append("keyword", keyword);
    url.searchParams.append("pageNumber", pageNumber.toString());
    url.searchParams.append("pageSize", pageSize.toString());

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to search bus lines.",
      data: [],
      pagination: null,
      isFailure: true,
    };
  }
}

export async function fetchYpsBusLines(
  keyword?: string,
  pageNumber = 1,
  pageSize = 20,
): Promise<PagedResultDto<BusLineDto>> {
  try {
    const url = new URL(`${API_BASE_URL}/api/buses/yps-supported`);
    if (keyword) url.searchParams.append("keyword", keyword);
    url.searchParams.append("pageNumber", pageNumber.toString());
    url.searchParams.append("pageSize", pageSize.toString());

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch YPS bus lines.",
      data: [],
      pagination: null,
      isFailure: true,
    };
  }
}

export async function fetchBusRouteDetail(
  busNumber: string,
): Promise<ApiResult<BusRouteDetailDto>> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/buses/${encodeURIComponent(busNumber)}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch bus route detail.",
      data: null,
      isFailure: true,
    };
  }
}

export async function fetchNearbyBusStopsForStore(
  storeId: number,
): Promise<ApiResult<StoreNearbyBusStopsDto>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/buses/nearby-store/${storeId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      isSuccess: false,
      message: err.message || "Failed to fetch nearby bus stops.",
      data: null,
      isFailure: true,
    };
  }
}

