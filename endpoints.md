# 🔌 YPS Store Finder - API Endpoints Documentation

This document describes all RESTful API controller endpoints available in the **YPS Store Finder** API backend (`YpsStoreFinder.Api`).

All endpoints are hosted under the base route `/api/` and feature IP-based fixed window rate limiting (`ip-fixed-window`).

---

## 🏪 1. Stores Controller (`/api/stores`)

Base Controller: `StoresController.cs`

| HTTP Method | Endpoint Route | Parameters | Return Type | Description / Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/stores` | `category` *(optional string)* | `Result<List<StoreDto>>` | Retrieves **all stores** (in-memory cached) for map pin rendering and initial display. Optionally filter by category string. |
| **`GET`** | `/api/stores/search` | `query` *(string)*<br>`category` *(string)*<br>`pageNumber` *(int, default: 1)*<br>`pageSize` *(int, default: 10)* | `PagedResult<StoreDto>` | Performs a **paginated keyword search** across store names, addresses, and descriptions. |
| **`GET`** | `/api/stores/categories` | *None* | `Result<List<CategorySummaryDto>>` | Retrieves a **category summary list** containing total store counts grouped by each store category. |
| **`GET`** | `/api/stores/nearby` | `latitude` *(double, required)*<br>`longitude` *(double, required)*<br>`radiusKm` *(double, default: 5)*<br>`category` *(string)*<br>`pageNumber` *(int)*<br>`pageSize` *(int)* | `PagedResult<StoreDto>` | Performs a **geo-spatial nearby search** using the Haversine formula to return stores within a specific distance radius (in km), sorted by distance. |
| **`GET`** | `/api/stores/{id}` | `id` *(int, path param)* | `Result<StoreDto>` | Retrieves the **full store details** for a specific store by its unique integer ID. |

---

## 🚌 2. Buses Controller (`/api/buses`)

Base Controller: `BusesController.cs`

| HTTP Method | Endpoint Route | Parameters | Return Type | Description / Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/buses` | `keyword` *(optional string)*<br>`pageNumber` *(int, default: 1)*<br>`pageSize` *(int, default: 10)* | `PagedResult<BusLineDto>` | Retrieves a **paginated list of all YBS bus lines** (route header info, stop counts, and YPS support status). Optionally filter by search keyword. |
| **`GET`** | `/api/buses/yps-supported` | `keyword` *(optional string)*<br>`pageNumber` *(int, default: 1)*<br>`pageSize` *(int, default: 10)* | `PagedResult<BusLineDto>` | Retrieves a **paginated list of YPS-supported bus lines only** (`IsYpsSupported == true`), allowing cardholders to verify where they can tap their card. |
| **`GET`** | `/api/buses/{busNumber}` | `busNumber` *(string, path param)* | `Result<BusRouteDetailDto>` | Retrieves **complete route details** for a specific bus line (e.g. `"1"` or `"21"`), including outbound and return title, total stops, and full stop lists with township details. |
| **`GET`** | `/api/buses/nearby-store/{storeId}` | `storeId` *(int, path param)* | `Result<StoreNearbyBusStopsDto>` | Finds **nearby YBS bus stops and servicing bus lines** within walking distance of a specific store ID, highlighting YPS card-supported bus numbers. |

---

## 📦 Data Transfer Objects (DTOs) Overview

### `StoreDto`
- `Id` *(int)*
- `Category` *(string)*
- `Name` *(string)*
- `Latitude` *(double)*
- `Longitude` *(double)*
- `Address` *(string?)*
- `Description` *(string?)*
- `RawAttributes` *(string?)*
- `DistanceKm` *(double?)*

### `BusLineDto`
- `BusNumber` *(string)*
- `RouteId` *(string)*
- `IsYpsSupported` *(bool)*
- `OutboundTitle` *(string?)*
- `OutboundTotalStops` *(int)*
- `ReturnTitle` *(string?)*
- `ReturnTotalStops` *(int)*

### `BusRouteDetailDto`
- `BusNumber` *(string)*
- `RouteId` *(string)*
- `IsYpsSupported` *(bool)*
- `OutboundTitle` *(string?)*
- `OutboundStops` *(List<BusStopDto>)*
- `ReturnTitle` *(string?)*
- `ReturnStops` *(List<BusStopDto>)*

### `StoreNearbyBusStopsDto`
- `StoreId` *(int)*
- `StoreName` *(string)*
- `Township` *(string?)*
- `NearbyBusStops` *(List<NearbyBusStopItem>)*
  - `StopName` *(string)*
  - `RoadTownship` *(string?)*
  - `ServicingBusNumbers` *(List<string>)*
  - `YpsSupportedBusNumbers` *(List<string>)*
