export type TravelMode = 'walking' | 'bus' | 'taxi';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteEstimate {
  distanceKm: number;
  durationMin: number;
}

export interface DrivingRoute extends RouteEstimate {
  coordinates: [number, number][];
}

export interface PedestrianRoute extends RouteEstimate {
  coordinates: [number, number][];
  instructions: string[];
}

export interface TransitStop extends Coordinate {
  id: number;
  name: string;
}

export interface BusJourney {
  line: string;
  relationId: number;
  routeName: string;
  boardingStop: TransitStop;
  alightingStop: TransitStop;
  accessRoute: PedestrianRoute;
  busCoordinates: [number, number][];
  busDistanceKm: number;
  egressRoute: PedestrianRoute;
}

const EARTH_RADIUS_KM = 6371;
const WALKING_SPEED_KMH = 4.8;
const VALHALLA_URL = 'https://valhalla1.openstreetmap.de/route';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const ROUTING_CLIENT_ID = 'yps-store-finder.app';
const BUS_STOP_SEARCH_RADIUS_METERS = 900;

interface OverpassMember {
  type: 'node' | 'way' | 'relation';
  ref: number;
  role?: string;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  members?: OverpassMember[];
  geometry?: Array<{ lat: number; lon: number }>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

export function distanceBetweenKm(origin: Coordinate, destination: Coordinate) {
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function estimateWalkingTrip(origin: Coordinate, destination: Coordinate): RouteEstimate {
  const distanceKm = distanceBetweenKm(origin, destination);
  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMin: Math.max(1, Math.round((distanceKm / WALKING_SPEED_KMH) * 60)),
  };
}

export function decodePolyline6(shape: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  const decodeValue = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = shape.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < shape.length);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < shape.length) {
    latitude += decodeValue();
    longitude += decodeValue();
    coordinates.push([latitude / 1e6, longitude / 1e6]);
  }
  return coordinates;
}

export async function fetchPedestrianRoute(
  origin: Coordinate,
  destination: Coordinate,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch
): Promise<PedestrianRoute> {
  const response = await fetcher(VALHALLA_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': ROUTING_CLIENT_ID,
    },
    body: JSON.stringify({
      locations: [
        { lat: origin.latitude, lon: origin.longitude },
        { lat: destination.latitude, lon: destination.longitude },
      ],
      costing: 'pedestrian',
      units: 'kilometers',
      language: 'en-US',
    }),
  });
  if (!response.ok) throw new Error('Pedestrian route service unavailable');

  const data = await response.json() as {
    trip?: {
      summary?: { length?: number; time?: number };
      legs?: Array<{
        shape?: string;
        maneuvers?: Array<{ instruction?: string }>;
      }>;
    };
  };
  const legs = data.trip?.legs ?? [];
  const coordinates = legs.flatMap((leg, index) => {
    const decoded = leg.shape ? decodePolyline6(leg.shape) : [];
    return index > 0 ? decoded.slice(1) : decoded;
  });
  const distanceKm = data.trip?.summary?.length;
  const durationSeconds = data.trip?.summary?.time;
  if (coordinates.length < 2 || typeof distanceKm !== 'number' || typeof durationSeconds !== 'number') {
    throw new Error('No pedestrian route returned');
  }

  return {
    coordinates,
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMin: Math.max(1, Math.round(durationSeconds / 60)),
    instructions: legs.flatMap((leg) => leg.maneuvers?.flatMap((maneuver) => maneuver.instruction ? [maneuver.instruction] : []) ?? []),
  };
}

export async function fetchDrivingRoute(
  origin: Coordinate,
  destination: Coordinate,
  signal?: AbortSignal
): Promise<DrivingRoute> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('OSRM route service unavailable');

  const data = await response.json() as {
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: [number, number][] };
    }>;
  };
  const route = data.routes?.[0];
  if (!route) throw new Error('No driving route returned');

  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMin: Math.max(1, Math.round(route.duration / 60)),
  };
}

const normalizeBusLine = (line: string) => {
  const match = line.toUpperCase().match(/AP|\d+/);
  if (!match) return line.toUpperCase().replace(/\s+/g, '');
  return match[0] === 'AP' ? 'AP' : String(Number(match[0]));
};

const normalizeStopName = (name: string) => name
  .toLocaleLowerCase()
  .replace(/[\s()（）၊။/\-_]+/g, '');

const routeDistanceKm = (coordinates: [number, number][]) => coordinates.slice(1).reduce((total, coordinate, index) => (
  total + distanceBetweenKm(
    { latitude: coordinates[index][0], longitude: coordinates[index][1] },
    { latitude: coordinate[0], longitude: coordinate[1] }
  )
), 0);

const findNearestCoordinateIndex = (coordinates: [number, number][], target: Coordinate) => coordinates.reduce(
  (best, coordinate, index) => {
    const distance = distanceBetweenKm(
      { latitude: coordinate[0], longitude: coordinate[1] },
      target
    );
    return distance < best.distance ? { index, distance } : best;
  },
  { index: 0, distance: Number.POSITIVE_INFINITY }
).index;

async function fetchOverpass(
  query: string,
  signal: AbortSignal | undefined,
  fetcher: typeof fetch
) {
  const response = await fetcher(OVERPASS_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'YPS-Store-Finder/0.1 route-planner',
    },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) throw new Error('Bus stop service unavailable');
  return response.json() as Promise<OverpassResponse>;
}

function findJourneyCandidate(
  elements: OverpassElement[],
  origin: Coordinate,
  destination: Coordinate,
  allowedLines: string[],
  destinationStopNames: string[]
) {
  const nodes = elements.filter((element): element is OverpassElement & Required<Pick<OverpassElement, 'lat' | 'lon'>> => (
    element.type === 'node' && typeof element.lat === 'number' && typeof element.lon === 'number'
  ));
  const originStops = nodes.filter((node) => distanceBetweenKm(origin, { latitude: node.lat, longitude: node.lon }) <= BUS_STOP_SEARCH_RADIUS_METERS / 1000);
  const destinationStops = nodes.filter((node) => distanceBetweenKm(destination, { latitude: node.lat, longitude: node.lon }) <= BUS_STOP_SEARCH_RADIUS_METERS / 1000);
  const allowed = new Set(allowedLines.map(normalizeBusLine));
  const knownDestinationNames = destinationStopNames.map(normalizeStopName).filter(Boolean);
  let best: {
    relation: OverpassElement;
    line: string;
    boarding: (typeof originStops)[number];
    alighting: (typeof destinationStops)[number];
    score: number;
  } | null = null;

  for (const relation of elements.filter((element) => element.type === 'relation' && element.tags?.route === 'bus')) {
    const rawLine = relation.tags?.ref ?? '';
    const line = normalizeBusLine(rawLine);
    if (!line || !allowed.has(line) || !relation.members) continue;
    const memberOrder = new Map<number, number>();
    relation.members.forEach((member, index) => {
      if (member.type === 'node' && !memberOrder.has(member.ref)) memberOrder.set(member.ref, index);
    });

    for (const boarding of originStops) {
      const boardingOrder = memberOrder.get(boarding.id);
      if (boardingOrder === undefined) continue;
      for (const alighting of destinationStops) {
        const alightingOrder = memberOrder.get(alighting.id);
        if (alightingOrder === undefined || alightingOrder <= boardingOrder || boarding.id === alighting.id) continue;
        const directStopDistance = distanceBetweenKm(
          { latitude: boarding.lat, longitude: boarding.lon },
          { latitude: alighting.lat, longitude: alighting.lon }
        );
        if (directStopDistance < 0.15) continue;
        const alightingName = normalizeStopName(alighting.tags?.['name:en'] ?? alighting.tags?.name ?? '');
        const isKnownStoreStop = Boolean(alightingName)
          && knownDestinationNames.some((known) => known.includes(alightingName) || alightingName.includes(known));
        const score = distanceBetweenKm(origin, { latitude: boarding.lat, longitude: boarding.lon })
          + distanceBetweenKm(destination, { latitude: alighting.lat, longitude: alighting.lon })
          - (isKnownStoreStop ? 0.2 : 0);
        if (!best || score < best.score) best = { relation, line, boarding, alighting, score };
      }
    }
  }
  return best;
}

function buildRelationGeometry(elements: OverpassElement[], relationId: number) {
  const relation = elements.find((element) => element.type === 'relation' && element.id === relationId);
  if (!relation?.members) return [];
  const ways = new Map(elements.filter((element) => element.type === 'way' && element.geometry?.length)
    .map((element) => [element.id, element]));
  const coordinates: [number, number][] = [];

  for (const member of relation.members.filter((item) => item.type === 'way')) {
    const way = ways.get(member.ref);
    if (!way?.geometry?.length) continue;
    let segment: [number, number][] = way.geometry.map((point) => [point.lat, point.lon]);
    if (member.role === 'backward') segment = segment.reverse();
    else if (member.role !== 'forward' && coordinates.length) {
      const previous = coordinates[coordinates.length - 1];
      const distanceToStart = distanceBetweenKm(
        { latitude: previous[0], longitude: previous[1] },
        { latitude: segment[0][0], longitude: segment[0][1] }
      );
      const segmentEnd = segment[segment.length - 1];
      const distanceToEnd = distanceBetweenKm(
        { latitude: previous[0], longitude: previous[1] },
        { latitude: segmentEnd[0], longitude: segmentEnd[1] }
      );
      if (distanceToEnd < distanceToStart) segment = segment.reverse();
    }
    const previous = coordinates[coordinates.length - 1];
    if (previous && previous[0] === segment[0][0] && previous[1] === segment[0][1]) segment = segment.slice(1);
    coordinates.push(...segment);
  }
  return coordinates;
}

export async function findDirectBusJourney(
  origin: Coordinate,
  destination: Coordinate,
  allowedLines: string[],
  destinationStopNames: string[] = [],
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch
): Promise<BusJourney | null> {
  if (allowedLines.length === 0) return null;
  const searchQuery = `[out:json][timeout:25];(node(around:${BUS_STOP_SEARCH_RADIUS_METERS},${origin.latitude},${origin.longitude})["highway"="bus_stop"];node(around:${BUS_STOP_SEARCH_RADIUS_METERS},${origin.latitude},${origin.longitude})["public_transport"="platform"]["bus"="yes"];node(around:${BUS_STOP_SEARCH_RADIUS_METERS},${destination.latitude},${destination.longitude})["highway"="bus_stop"];node(around:${BUS_STOP_SEARCH_RADIUS_METERS},${destination.latitude},${destination.longitude})["public_transport"="platform"]["bus"="yes"];)->.stops;(.stops;rel(bn.stops)["route"="bus"];);out body;`;
  const searchData = await fetchOverpass(searchQuery, signal, fetcher);
  const candidate = findJourneyCandidate(searchData.elements ?? [], origin, destination, allowedLines, destinationStopNames);
  if (!candidate) return null;

  const geometryQuery = `[out:json][timeout:25];rel(${candidate.relation.id})->.route;(.route;way(r.route););out body geom;`;
  const geometryData = await fetchOverpass(geometryQuery, signal, fetcher);
  let fullBusCoordinates = buildRelationGeometry(geometryData.elements ?? [], candidate.relation.id);
  if (fullBusCoordinates.length < 2) return null;

  const boardingStop: TransitStop = {
    id: candidate.boarding.id,
    name: candidate.boarding.tags?.name ?? candidate.boarding.tags?.['name:en'] ?? 'Bus stop',
    latitude: candidate.boarding.lat,
    longitude: candidate.boarding.lon,
  };
  const alightingStop: TransitStop = {
    id: candidate.alighting.id,
    name: candidate.alighting.tags?.name ?? candidate.alighting.tags?.['name:en'] ?? 'Bus stop',
    latitude: candidate.alighting.lat,
    longitude: candidate.alighting.lon,
  };
  let boardingIndex = findNearestCoordinateIndex(fullBusCoordinates, boardingStop);
  let alightingIndex = findNearestCoordinateIndex(fullBusCoordinates, alightingStop);
  if (boardingIndex > alightingIndex) {
    fullBusCoordinates = fullBusCoordinates.reverse();
    boardingIndex = findNearestCoordinateIndex(fullBusCoordinates, boardingStop);
    alightingIndex = findNearestCoordinateIndex(fullBusCoordinates, alightingStop);
  }
  const busCoordinates = fullBusCoordinates.slice(boardingIndex, alightingIndex + 1);
  if (busCoordinates.length < 2) return null;

  const [accessRoute, egressRoute] = await Promise.all([
    fetchPedestrianRoute(origin, boardingStop, signal, fetcher),
    fetchPedestrianRoute(alightingStop, destination, signal, fetcher),
  ]);

  return {
    line: candidate.line,
    relationId: candidate.relation.id,
    routeName: candidate.relation.tags?.['name:en'] ?? candidate.relation.tags?.name ?? `YBS ${candidate.line}`,
    boardingStop,
    alightingStop,
    accessRoute,
    busCoordinates,
    busDistanceKm: Number(routeDistanceKm(busCoordinates).toFixed(2)),
    egressRoute,
  };
}

async function requestAppRoute<T>(payload: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/routing', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('App routing service unavailable');
  return response.json() as Promise<T>;
}

export function requestPedestrianRoute(
  origin: Coordinate,
  destination: Coordinate,
  signal?: AbortSignal
) {
  return requestAppRoute<PedestrianRoute>({ mode: 'walking', origin, destination }, signal);
}

export function requestDirectBusJourney(
  origin: Coordinate,
  destination: Coordinate,
  allowedLines: string[],
  destinationStopNames: string[],
  signal?: AbortSignal
) {
  return requestAppRoute<BusJourney | null>({
    mode: 'bus',
    origin,
    destination,
    allowedLines,
    destinationStopNames,
  }, signal);
}

export function googleMapsDirectionsUrl(
  mode: TravelMode,
  origin: Coordinate,
  destination: Coordinate
) {
  const travelMode = mode === 'taxi' ? 'driving' : mode === 'bus' ? 'transit' : 'walking';
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('origin', `${origin.latitude},${origin.longitude}`);
  url.searchParams.set('destination', `${destination.latitude},${destination.longitude}`);
  url.searchParams.set('travelmode', travelMode);
  return url.toString();
}
