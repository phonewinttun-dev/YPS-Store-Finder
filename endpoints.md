# 🔌 YPS Store Finder - API Endpoints Documentation

This document describes all RESTful API controller endpoints available in the **YPS Store Finder** API backend (`YpsStoreFinder.Api`).

All endpoints are hosted under the base route `/api/` and feature IP-based fixed window rate limiting (`ip-fixed-window`).

---

## 🏪 1. Stores Controller (`/api/stores`)

Base Controller: `StoresController.cs`

| HTTP Method | Endpoint Route | Parameters | Return Type | Description / Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/stores` | *None* | `Result<List<StoreDto>>` | Retrieves **all stores** (in-memory cached) for map pin rendering and initial display. |
| **`GET`** | `/api/stores/search` | `query` *(string)*<br>`category` *(string)*<br>`townshipId` *(int)*<br>`pageNumber` *(int, default: 1)*<br>`pageSize` *(int, default: 10)* | `PagedResult<StoreDto>` | Performs a **paginated keyword search** across store names (Myanmar & English), categories, and township names. |
| **`GET`** | `/api/stores/categories` | *None* | `Result<List<CategorySummaryDto>>` | Retrieves a **category summary list** containing total store counts grouped by each store category. |
| **`GET`** | `/api/stores/nearby` | `latitude` *(double, required)*<br>`longitude` *(double, required)*<br>`minRadiusKm` *(double, default: 0.3)*<br>`radiusKm` *(double, default: 2.0)*<br>`category` *(string)*<br>`pageNumber` *(int)*<br>`pageSize` *(int)* | `PagedResult<StoreDto>` | Performs a **geo-spatial nearby search** using the Haversine formula to return stores within a specific distance radius (in km), sorted by distance. |
| **`GET`** | `/api/stores/{id}` | `id` *(int, path param)* | `Result<StoreDto>` | Retrieves the **full store details** for a specific store by its unique integer ID. |

---

## 🚌 2. Buses Controller (`/api/buses`)

Base Controller: `BusesController.cs`

| HTTP Method | Endpoint Route | Parameters | Return Type | Description / Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/buses` | `pageNumber` *(int, default: 1)*<br>`pageSize` *(int, default: 10)* | `PagedResult<BusLineDto>` | Retrieves a **paginated list of all YBS bus lines** (route header info, titles, and YPS payment acceptance status). |
| **`GET`** | `/api/buses/yps-supported` | `pageNumber` *(int, default: 1)*<br>`pageSize` *(int, default: 10)* | `PagedResult<BusLineDto>` | Retrieves a **paginated list of YPS-supported bus lines only** (`IsYpsAccepted == true`), allowing cardholders to verify where they can tap their card. |
| **`GET`** | `/api/buses/search` | `keyword` *(string)*<br>`pageNumber` *(int, default: 1)*<br>`pageSize` *(int, default: 10)* | `PagedResult<BusLineDto>` | Performs a **paginated keyword search** across bus numbers and route titles (Myanmar & English). |
| **`GET`** | `/api/buses/{busNumber}` | `busNumber` *(string, path param)* | `Result<BusRouteDetailDto>` | Retrieves **complete route details** for a specific bus line (by `RouteId` or `BusNumber`), including outbound and return titles, total stops, and full stop lists with township details. |
| **`GET`** | `/api/buses/nearby-store/{storeId}` | `storeId` *(int, path param)* | `Result<StoreNearbyBusStopsDto>` | Finds **nearby YBS bus stops and servicing bus lines** within walking distance of a specific store ID, highlighting YPS card-supported bus numbers. |

---

## 📦 Data Transfer Objects (DTOs) Overview

### `StoreDto`
- `StoreId` / `Id` *(int)*
- `NameMm` *(string)*
- `NameEn` *(string)*
- `Name` *(string, calculated helper)*
- `Category` *(string)*
- `TownshipId` *(int)*
- `TownshipNameMm` *(string)*
- `TownshipNameEn` *(string)*
- `Latitude` *(double)*
- `Longitude` *(double)*
- `DistanceKm` *(double?)*
- `NearestStops` *(List<StoreNearestStopDto>)*
- `ServingBusLines` *(List<StoreServingBusLineDto>)*

### `BusLineDto`
- `RouteId` *(int)*
- `BusNumber` *(string)*
- `OutboundTitleMm` *(string)*
- `OutboundTitleEn` *(string)*
- `ReturnTitleMm` *(string)*
- `ReturnTitleEn` *(string)*
- `IsYpsAccepted` / `IsYpsSupported` *(bool)*
- `OutboundTitle` *(string)*
- `ReturnTitle` *(string)*

### `BusRouteDetailDto`
- `RouteId` *(int)*
- `BusNumber` *(string)*
- `IsYpsAccepted` / `IsYpsSupported` *(bool)*
- `OutboundTitleMm` *(string)*
- `OutboundTitleEn` *(string)*
- `OutboundStops` *(List<BusStopDto>)*
- `ReturnTitleMm` *(string)*
- `ReturnTitleEn` *(string)*
- `ReturnStops` *(List<BusStopDto>)*

### `StoreNearbyBusStopsDto`
- `StoreId` *(int)*
- `StoreNameMm` *(string)*
- `StoreNameEn` *(string)*
- `TownshipNameMm` *(string)*
- `TownshipNameEn` *(string)*
- `NearbyBusStops` *(List<NearbyBusStopItem>)*
  - `StopId` *(int?)*
  - `StopNameMm` *(string)*
  - `StopNameEn` *(string)*
  - `RoadMm` *(string)*
  - `RoadEn` *(string)*
  - `TownshipNameMm` *(string)*
  - `TownshipNameEn` *(string)*
  - `ServicingBusNumbers` *(List<string>)*
  - `YpsSupportedBusNumbers` *(List<string>)*
