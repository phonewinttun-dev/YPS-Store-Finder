import {
  fetchPedestrianRoute,
  findDirectBusJourney,
  type Coordinate,
} from '../../../services/routing';

export const runtime = 'nodejs';

interface RoutingPayload {
  mode?: 'walking' | 'bus';
  origin?: Coordinate;
  destination?: Coordinate;
  allowedLines?: unknown;
  destinationStopNames?: unknown;
}

const isYangonCoordinate = (value: unknown): value is Coordinate => {
  if (!value || typeof value !== 'object') return false;
  const coordinate = value as Partial<Coordinate>;
  return typeof coordinate.latitude === 'number'
    && typeof coordinate.longitude === 'number'
    && Number.isFinite(coordinate.latitude)
    && Number.isFinite(coordinate.longitude)
    && coordinate.latitude >= 16.3
    && coordinate.latitude <= 17.5
    && coordinate.longitude >= 95.8
    && coordinate.longitude <= 96.7;
};

const cleanStringList = (value: unknown, limit: number, maxLength: number) => (
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim().slice(0, maxLength))
      .filter(Boolean)
      .slice(0, limit)
    : []
);

export async function POST(request: Request) {
  let payload: RoutingPayload;
  try {
    payload = await request.json() as RoutingPayload;
  } catch {
    return Response.json({ message: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!isYangonCoordinate(payload.origin) || !isYangonCoordinate(payload.destination)) {
    return Response.json({ message: 'Valid Yangon origin and destination coordinates are required.' }, { status: 400 });
  }

  try {
    if (payload.mode === 'walking') {
      const route = await fetchPedestrianRoute(payload.origin, payload.destination, request.signal);
      return Response.json(route);
    }
    if (payload.mode === 'bus') {
      const allowedLines = cleanStringList(payload.allowedLines, 160, 16);
      const destinationStopNames = cleanStringList(payload.destinationStopNames, 30, 100);
      const journey = await findDirectBusJourney(
        payload.origin,
        payload.destination,
        allowedLines,
        destinationStopNames,
        request.signal
      );
      return Response.json(journey);
    }
    return Response.json({ message: 'Unsupported routing mode.' }, { status: 400 });
  } catch (error) {
    console.warn('Routing provider request failed:', error instanceof Error ? error.message : 'Unknown error');
    return Response.json({ message: 'Routing data is temporarily unavailable.' }, { status: 502 });
  }
}
