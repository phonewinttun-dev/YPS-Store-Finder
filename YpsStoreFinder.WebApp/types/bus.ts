export interface BusLineDto {
  busNumber: string;
  routeId: string;
  isYpsSupported: boolean;
  outboundTitle: string | null;
  outboundTotalStops: number;
  returnTitle: string | null;
  returnTotalStops: number;
}

export interface BusStopDto {
  stopName: string;
  roadTownship: string | null;
  stopOrder?: number;
  sequenceOrder?: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BusRouteDetailDto {
  busNumber: string;
  routeId: string;
  isYpsSupported: boolean;
  outboundTitle: string | null;
  outboundStops: BusStopDto[];
  returnTitle: string | null;
  returnStops: BusStopDto[];
}

export interface NearbyBusStopItem {
  stopName: string;
  roadTownship: string | null;
  servicingBusNumbers: string[];
  ypsSupportedBusNumbers: string[];
  distanceMeters?: number;
  walkTimeMinutes?: number;
}

export interface StoreNearbyBusStopsDto {
  storeId: number;
  storeName: string;
  township: string | null;
  nearbyBusStops: NearbyBusStopItem[];
}
