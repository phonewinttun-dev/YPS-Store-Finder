import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fetchPedestrianRoute,
  findDirectBusJourney,
  type Coordinate,
} from '../services/routing.ts';

const origin: Coordinate = { latitude: 16.775963, longitude: 96.158731 };
const destination: Coordinate = { latitude: 16.783158, longitude: 96.155725 };

test('walking route returns road geometry instead of a two-point guide line', async () => {
  const fetcher: typeof fetch = async () => Response.json({
    trip: {
      summary: { length: 1.114, time: 835.137 },
      legs: [{
        shape: 'sp|~^waalvDcHIwm@q@GhDEzBEhDUvTYjY_@~ZwvCwDApESfVE|DiCCGtIUjYoDEg]i@g`@m@i[u@cAPSzAKnIEzB{BE?qDyQO_s@lLk_@xGcU`EqAV',
        maneuvers: [{ instruction: 'Walk north.', travel_mode: 'pedestrian' }],
      }],
    },
  });

  const route = await fetchPedestrianRoute(origin, destination, undefined, fetcher);

  assert.ok(route.coordinates.length > 2);
  assert.equal(route.distanceKm, 1.11);
  assert.equal(route.durationMin, 14);
});

test('bus route uses a common YBS relation and includes both walking access legs', async () => {
  const stopsAndRelations = {
    elements: [
      { type: 'node', id: 10, lat: 16.7761, lon: 96.1588, tags: { name: 'Boarding stop' } },
      { type: 'node', id: 20, lat: 16.7830, lon: 96.1558, tags: { name: 'Alighting stop' } },
      {
        type: 'relation',
        id: 500,
        tags: { route: 'bus', ref: '37' },
        members: [
          { type: 'node', ref: 10, role: 'platform' },
          { type: 'node', ref: 20, role: 'platform' },
          { type: 'way', ref: 100, role: '' },
          { type: 'way', ref: 101, role: '' },
        ],
      },
    ],
  };
  const relationGeometry = {
    elements: [
      {
        type: 'relation', id: 500, members: [
          { type: 'node', ref: 10, role: 'platform' },
          { type: 'node', ref: 20, role: 'platform' },
          { type: 'way', ref: 100, role: '' },
          { type: 'way', ref: 101, role: '' },
        ],
      },
      { type: 'way', id: 100, geometry: [{ lat: 16.7761, lon: 96.1588 }, { lat: 16.779, lon: 96.157 }] },
      { type: 'way', id: 101, geometry: [{ lat: 16.779, lon: 96.157 }, { lat: 16.7830, lon: 96.1558 }] },
    ],
  };
  let call = 0;
  const fetcher: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes('overpass-api.de')) {
      call += 1;
      return Response.json(call === 1 ? stopsAndRelations : relationGeometry);
    }
    return Response.json({
      trip: {
        summary: { length: 0.12, time: 90 },
        legs: [{ shape: 'sp|~^waalvDcHIwm@', maneuvers: [] }],
      },
    });
  };

  const journey = await findDirectBusJourney(origin, destination, ['37'], [], undefined, fetcher);

  assert.ok(journey);
  assert.equal(journey.line, '37');
  assert.equal(journey.boardingStop.name, 'Boarding stop');
  assert.equal(journey.alightingStop.name, 'Alighting stop');
  assert.ok(journey.busCoordinates.length > 2);
  assert.ok(journey.accessRoute.coordinates.length > 2);
  assert.ok(journey.egressRoute.coordinates.length > 2);
});
