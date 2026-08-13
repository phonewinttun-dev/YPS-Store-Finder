'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Bus, Car, ExternalLink, Footprints, Gauge, MapPin, Navigation, Route, Store, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';
import { useNearbyBusStopsForStore } from '../hooks/useStoreQueries';
import {
  fetchDrivingRoute,
  googleMapsDirectionsUrl,
  requestDirectBusJourney,
  requestPedestrianRoute,
  type BusJourney,
  type DrivingRoute,
  type PedestrianRoute,
  type TravelMode,
} from '../services/routing';
import { StoreDto } from '../types/store';

interface MapViewContainerProps {
  stores: StoreDto[];
  userLocation: { latitude: number; longitude: number; hasRealLocation: boolean };
  radiusKm: number;
  selectedStoreId: number | null;
  onSelectStore: (store: StoreDto) => void;
  onShowDirection?: (store: StoreDto) => void;
  onCloseDirection?: () => void;
  onRequestEnableGps?: () => void;
  activeDirectionStoreId?: number | null;
  nearestStoreId?: number | null;
  mobileTab?: 'map' | 'list';
}

const YANGON_BOUNDS = L.latLngBounds([16.3, 95.8], [17.5, 96.7]);

const categoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('bus') || normalized.includes('terminal')) {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 6v6M16 6v6M4 18v2h4v-2M16 18v2h4v-2M3 10h18v8H3zM4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/></svg>';
  }
  if (normalized.includes('cinema')) {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4"/></svg>';
  }
  if (normalized.includes('agent')) {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6c3.5 0 6-1.4 8-3 2 1.6 4.5 3 8 3z"/><path d="m9 12 2 2 4-4"/></svg>';
  }
  return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 10h18M5 10v10h14V10M4 10l2-6h12l2 6M9 20v-6h6v6"/></svg>';
};

const storeMarkerIcon = (category: string, selected: boolean) => {
  return L.divIcon({
    className: 'custom-store-pin',
    html: `<div aria-hidden="true" class="hud-store-marker${selected ? ' is-selected' : ''}"><span class="hud-store-marker-glyph">${categoryIcon(category)}</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -32],
  });
};

const userMarkerIcon = () => L.divIcon({
  className: 'custom-user-marker',
  html: '<div class="user-pulse-marker" aria-hidden="true"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapViewContainer({
  stores,
  userLocation,
  radiusKm,
  selectedStoreId,
  onSelectStore,
  onShowDirection,
  onCloseDirection,
  onRequestEnableGps,
  activeDirectionStoreId,
  nearestStoreId,
}: MapViewContainerProps) {
  const { t, tAddress, tCategory, tStoreName, toMmNum } = useLanguage();
  const { playComplete, setProcessing } = useSound();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const storesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const previousStoreId = useRef<number | null>(null);
  const previousGpsState = useRef(false);
  const playCompleteRef = useRef(playComplete);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<DrivingRoute | null>(null);
  const [walkingRoute, setWalkingRoute] = useState<PedestrianRoute | null>(null);
  const [busJourney, setBusJourney] = useState<BusJourney | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isLoadingWalking, setIsLoadingWalking] = useState(false);
  const [isLoadingBus, setIsLoadingBus] = useState(false);
  const [travelModeSelection, setTravelModeSelection] = useState<{ storeId: number; mode: TravelMode } | null>(null);

  const previewStore = selectedStoreId ? stores.find((store) => store.id === selectedStoreId) ?? null : null;
  const routeStore = activeDirectionStoreId ? stores.find((store) => store.id === activeDirectionStoreId) ?? null : null;
  const nearbyBusStopsQuery = useNearbyBusStopsForStore(routeStore?.id ?? null);
  const busLines = useMemo(() => {
    const response = nearbyBusStopsQuery.data;
    if (!response?.isSuccess || !response.data) return [];
    return Array.from(new Set(response.data.nearbyBusStops.flatMap((stop) =>
      stop.servicingBusNumbers.length ? stop.servicingBusNumbers : stop.ypsSupportedBusNumbers
    ))).sort((first, second) => first.localeCompare(second, undefined, { numeric: true }));
  }, [nearbyBusStopsQuery.data]);
  const destinationStopNames = useMemo(() => {
    const response = nearbyBusStopsQuery.data;
    if (!response?.isSuccess || !response.data) return [];
    return response.data.nearbyBusStops.flatMap((stop) => [stop.stopName, stop.roadTownship ?? '']).filter(Boolean);
  }, [nearbyBusStopsQuery.data]);
  const fastestMode: Exclude<TravelMode, 'bus'> | null = useMemo(() => {
    if (!walkingRoute && !routeInfo) return null;
    if (!walkingRoute) return 'taxi';
    if (!routeInfo) return 'walking';
    return walkingRoute.durationMin <= routeInfo.durationMin ? 'walking' : 'taxi';
  }, [routeInfo, walkingRoute]);
  const selectedTravelMode: TravelMode = routeStore && travelModeSelection?.storeId === routeStore.id
    ? travelModeSelection.mode
    : fastestMode ?? 'taxi';

  /* eslint-disable react-hooks/set-state-in-effect -- Route identity changes intentionally clear stale async routing results before the next request. */
  useEffect(() => {
    playCompleteRef.current = playComplete;
  }, [playComplete]);

  useEffect(() => {
    setProcessing(isLoadingRoute || isLoadingWalking || isLoadingBus);
    return () => setProcessing(false);
  }, [isLoadingBus, isLoadingRoute, isLoadingWalking, setProcessing]);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [userLocation.latitude, userLocation.longitude],
      zoom: 14,
      minZoom: 10,
      maxZoom: 20,
      maxBounds: YANGON_BOUNDS,
      maxBoundsViscosity: 1,
      scrollWheelZoom: true,
    });
    const tileName = resolvedTheme === 'dark' ? 'dark_all' : 'light_all';
    tileLayerRef.current = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${tileName}/{z}/{x}/{y}{r}.png`, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);
    userLayerRef.current = L.layerGroup().addTo(map);
    storesLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      userLayerRef.current = null;
      storesLayerRef.current = null;
      routeLayerRef.current = null;
    };
    // The map engine is intentionally initialized once; later effects update its layers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tileName = resolvedTheme === 'dark' ? 'dark_all' : 'light_all';
    tileLayerRef.current?.setUrl(`https://{s}.basemaps.cartocdn.com/${tileName}/{z}/{x}/{y}{r}.png`);
  }, [resolvedTheme]);

  useEffect(() => {
    if (!mapRef.current || !containerRef.current) return;
    const map = mapRef.current;
    const resize = () => map.invalidateSize();
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);
    window.addEventListener('resize', resize);
    const timer = window.setTimeout(resize, 220);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (previewStore && previousStoreId.current !== previewStore.id) {
      previousStoreId.current = previewStore.id;
      if (reduceMotion) map.setView([previewStore.latitude, previewStore.longitude], 16);
      else map.flyTo([previewStore.latitude, previewStore.longitude], 16, { duration: 0.55 });
    } else if (userLocation.hasRealLocation && !previousGpsState.current) {
      previousGpsState.current = true;
      if (reduceMotion) map.setView([userLocation.latitude, userLocation.longitude], 15);
      else map.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration: 0.55 });
    }
  }, [previewStore, userLocation.hasRealLocation, userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    if (!routeStore || !userLocation.hasRealLocation) return;
    const controller = new AbortController();
    const loadRoute = async () => {
      setIsLoadingRoute(true);
      setRouteCoordinates([]);
      setRouteInfo(null);
      try {
        const route = await fetchDrivingRoute(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          routeStore,
          controller.signal
        );
        setRouteCoordinates(route.coordinates);
        setRouteInfo(route);
        playCompleteRef.current();
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('Routing service fallback:', error);
        setRouteCoordinates([]);
        setRouteInfo(null);
      } finally {
        if (!controller.signal.aborted) setIsLoadingRoute(false);
      }
    };
    loadRoute();
    return () => controller.abort();
  }, [routeStore, userLocation.hasRealLocation, userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    if (!routeStore || !userLocation.hasRealLocation) {
      setWalkingRoute(null);
      return;
    }
    const controller = new AbortController();
    const loadWalkingRoute = async () => {
      setIsLoadingWalking(true);
      setWalkingRoute(null);
      try {
        const route = await requestPedestrianRoute(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          routeStore,
          controller.signal
        );
        setWalkingRoute(route);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('Pedestrian routing unavailable:', error);
          setWalkingRoute(null);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingWalking(false);
      }
    };
    loadWalkingRoute();
    return () => controller.abort();
  }, [routeStore, userLocation.hasRealLocation, userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    if (!routeStore || !userLocation.hasRealLocation || nearbyBusStopsQuery.isLoading) return;
    if (busLines.length === 0) {
      setBusJourney(null);
      setIsLoadingBus(false);
      return;
    }
    const controller = new AbortController();
    const loadBusJourney = async () => {
      setIsLoadingBus(true);
      setBusJourney(null);
      try {
        const journey = await requestDirectBusJourney(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          routeStore,
          busLines,
          destinationStopNames,
          controller.signal
        );
        setBusJourney(journey);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('Direct YBS route unavailable:', error);
          setBusJourney(null);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingBus(false);
      }
    };
    loadBusJourney();
    return () => controller.abort();
  }, [busLines, destinationStopNames, nearbyBusStopsQuery.isLoading, routeStore, userLocation.hasRealLocation, userLocation.latitude, userLocation.longitude]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!routeStore || !userLocation.hasRealLocation) return;
    if (selectedTravelMode === 'taxi' && routeCoordinates.length > 1) {
      layer.addLayer(L.polyline(routeCoordinates as L.LatLngTuple[], {
        color: resolvedTheme === 'dark' ? '#A9A7FF' : '#4F46C7',
        weight: 6,
        opacity: 0.94,
      }));
      return;
    }
    if (selectedTravelMode === 'walking' && walkingRoute?.coordinates.length) {
      layer.addLayer(L.polyline(walkingRoute.coordinates as L.LatLngTuple[], {
        color: resolvedTheme === 'dark' ? '#30D158' : '#18733B',
        weight: 6,
        opacity: 0.96,
        lineCap: 'round',
        lineJoin: 'round',
      }));
      return;
    }
    if (selectedTravelMode === 'bus' && busJourney) {
      const walkingColor = resolvedTheme === 'dark' ? '#30D158' : '#18733B';
      const busColor = resolvedTheme === 'dark' ? '#4ECDE4' : '#005B7E';
      for (const coordinates of [busJourney.accessRoute.coordinates, busJourney.egressRoute.coordinates]) {
        layer.addLayer(L.polyline(coordinates as L.LatLngTuple[], {
          color: walkingColor,
          weight: 5,
          opacity: 0.94,
          dashArray: '7, 7',
          lineCap: 'round',
        }));
      }
      layer.addLayer(L.polyline(busJourney.busCoordinates as L.LatLngTuple[], {
        color: busColor,
        weight: 7,
        opacity: 0.96,
        lineCap: 'round',
        lineJoin: 'round',
      }));
      const markerStyle = { radius: 8, color: busColor, fillColor: resolvedTheme === 'dark' ? '#051114' : '#F6F9F8', fillOpacity: 1, weight: 3 };
      layer.addLayer(L.circleMarker([busJourney.boardingStop.latitude, busJourney.boardingStop.longitude], markerStyle)
        .bindTooltip(`${t('boardAt')}: ${busJourney.boardingStop.name}`));
      layer.addLayer(L.circleMarker([busJourney.alightingStop.latitude, busJourney.alightingStop.longitude], markerStyle)
        .bindTooltip(`${t('getOffAt')}: ${busJourney.alightingStop.name}`));
    }
  }, [busJourney, resolvedTheme, routeCoordinates, routeStore, selectedTravelMode, t, userLocation.hasRealLocation, walkingRoute]);

  useEffect(() => {
    const layer = userLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!userLocation.hasRealLocation) return;
    const marker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userMarkerIcon(), title: t('deviceLocation') });
    const popup = document.createElement('div');
    popup.className = 'p-1 text-xs';
    const title = document.createElement('strong');
    title.className = 'block text-gps';
    title.textContent = t('deviceLocation');
    const status = document.createElement('span');
    status.className = 'font-mono-meta text-muted';
    status.textContent = t('gpsActive');
    popup.append(title, status);
    marker.bindPopup(popup);
    layer.addLayer(marker);
    layer.addLayer(L.circle([userLocation.latitude, userLocation.longitude], {
      radius: radiusKm * 1000,
      color: resolvedTheme === 'dark' ? '#30D158' : '#18733B',
      fillColor: resolvedTheme === 'dark' ? '#30D158' : '#E8F8ED',
      fillOpacity: 0.16,
      weight: 2,
      dashArray: '6, 6',
    }));
  }, [radiusKm, resolvedTheme, t, userLocation]);

  useEffect(() => {
    const layer = storesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    stores.forEach((store) => {
      const marker = L.marker([store.latitude, store.longitude], {
        icon: storeMarkerIcon(store.category, store.id === selectedStoreId),
        title: tStoreName(store.name),
        alt: tStoreName(store.name),
      });
      marker.on('click', () => onSelectStore(store));

      const popup = document.createElement('div');
      popup.className = 'max-w-[260px] p-1';
      const badge = document.createElement('span');
      badge.className = 'ui-badge inline-flex border-store/30 bg-store-soft text-store';
      badge.textContent = tCategory(store.category);
      const heading = document.createElement('strong');
      heading.className = 'mt-2 block text-sm font-bold text-ink';
      heading.textContent = tStoreName(store.name);
      popup.append(badge, heading);
      if (store.address) {
        const address = document.createElement('p');
        address.className = 'mt-1 text-xs leading-relaxed text-muted';
        address.textContent = tAddress(store.address);
        popup.append(address);
      }
      const direction = document.createElement('button');
      direction.type = 'button';
      direction.className = 'ui-button mt-3 min-h-11 w-full bg-route-action px-3 text-xs font-bold text-white';
      direction.textContent = t('showDirection');
      direction.addEventListener('click', (event) => {
        event.stopPropagation();
        onShowDirection?.(store);
      });
      popup.append(direction);
      marker.bindPopup(popup);
      layer.addLayer(marker);
    });
  }, [onSelectStore, onShowDirection, resolvedTheme, selectedStoreId, stores, t, tAddress, tCategory, tStoreName]);

  const travelOptions = [
    {
      mode: 'walking' as const,
      icon: <Footprints className="h-4 w-4" />,
      label: t('walking'),
      value: isLoadingWalking
        ? t('syncing')
        : walkingRoute
          ? `~${toMmNum(walkingRoute.durationMin)} ${t('minutes')}`
          : t('notAvailable'),
      detail: walkingRoute ? `${toMmNum(walkingRoute.distanceKm)} ${t('km')}` : t('pedestrianRoute'),
    },
    {
      mode: 'bus' as const,
      icon: <Bus className="h-4 w-4" />,
      label: t('bus'),
      value: isLoadingBus || nearbyBusStopsQuery.isLoading
        ? t('findingBusRoute')
        : busJourney
          ? `YBS ${toMmNum(busJourney.line)}`
          : t('noDirectBusRoute'),
      detail: busJourney
        ? `${busJourney.boardingStop.name} → ${busJourney.alightingStop.name}`
        : t('nearbyStopsChecked'),
    },
    {
      mode: 'taxi' as const,
      icon: <Car className="h-4 w-4" />,
      label: t('taxi'),
      value: isLoadingRoute
        ? t('syncing')
        : routeInfo
          ? `~${toMmNum(routeInfo.durationMin)} ${t('minutes')}`
          : t('notAvailable'),
      detail: routeInfo ? `${toMmNum(routeInfo.distanceKm)} ${t('km')}` : t('roadRoute'),
    },
  ];
  const selectedDirectionsLabel = selectedTravelMode === 'walking'
    ? t('openWalkingDirections')
    : selectedTravelMode === 'bus'
      ? t('openBusDirections')
      : t('openTaxiDirections');
  const selectedModeNote = selectedTravelMode === 'walking'
    ? t('walkingEstimateNote')
    : selectedTravelMode === 'bus'
      ? busJourney ? t('busRouteNote') : t('busEstimateNote')
      : t('taxiEstimateNote');

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      {previewStore && (
        <div className={`hud-selected-dossier hud-panel glass-panel ui-card absolute left-3 right-3 top-3 z-[600] max-h-[calc(100%-1.5rem)] max-w-[440px] overflow-y-auto p-3 shadow-soft sm:left-5 sm:right-auto ${routeStore ? 'border-route/60' : 'border-store/55'}`} data-route-active={routeStore ? 'true' : 'false'}>
          <div className="flex items-start gap-3">
            <div className={`hud-node-icon flex h-11 w-11 shrink-0 items-center justify-center ${routeStore ? 'bg-route-soft text-route' : 'bg-store-soft text-store'}`}>
              {routeStore ? <Route className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-sm font-bold text-ink">{tStoreName(previewStore.name)}</h2>
                {previewStore.id === nearestStoreId && <span className="ui-badge shrink-0 border-gps/30 bg-gps-soft text-[9px] text-gps">{t('nearestTarget')}</span>}
              </div>
              <div className="font-mono-meta mt-1 flex items-center gap-2 text-[10px] font-semibold text-muted" role={isLoadingRoute ? 'status' : undefined}>
                {routeStore && isLoadingRoute
                  ? <span className="hud-streaming-text text-route">{t('comparingTravelModes')}</span>
                  : routeStore && fastestMode && (walkingRoute || routeInfo)
                    ? <><Zap className="h-3 w-3 text-brand" /><span className="font-bold text-ink">{t('fastestEstimate')}</span><span>{fastestMode === 'walking' ? t('walking') : t('taxi')}</span></>
                    : <span>{tCategory(previewStore.category)}</span>}
              </div>
            </div>
            <button type="button" onClick={() => onCloseDirection?.()} className="ui-button flex h-11 w-11 shrink-0 items-center justify-center border border-transparent bg-elevated text-muted hover:text-ink" aria-label={t('close')}><X className="h-4 w-4" /></button>
          </div>
          {routeStore && !userLocation.hasRealLocation && (
            <div className="mt-3 border border-brand/40 bg-brand-soft p-3 text-xs text-ink" role="status">
              <p className="font-semibold">{t('gpsNeededForRoutes')}</p>
              <button type="button" onClick={onRequestEnableGps} className="ui-button mt-3 flex min-h-11 w-full items-center justify-center gap-2 bg-gps-action font-bold text-white">
                <Navigation className="h-4 w-4" />{t('enableLocation')}
              </button>
            </div>
          )}
          {routeStore && userLocation.hasRealLocation && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono-meta flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted"><Gauge className="h-3.5 w-3.5" />{t('travelMode')}</span>
                <span className="text-[10px] font-semibold text-muted">{t('estimateLabel')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label={t('travelMode')}>
                {travelOptions.map((option) => {
                  const isSelected = selectedTravelMode === option.mode;
                  const isFastest = fastestMode === option.mode;
                  return (
                    <button
                      key={option.mode}
                      type="button"
                      className="hud-travel-mode ui-button relative min-h-[92px] border border-line bg-surface p-2 text-left"
                      data-selected={isSelected ? 'true' : 'false'}
                      onClick={() => setTravelModeSelection({ storeId: routeStore.id, mode: option.mode })}
                      aria-pressed={isSelected}
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink">{option.icon}{option.label}</span>
                      <strong className="mt-2 block text-[12px] text-ink">{option.value}</strong>
                      <span className="mt-0.5 block truncate text-[9px] text-muted">{option.detail}</span>
                      {isFastest && <span className="hud-fastest-tag">{t('fastest')}</span>}
                    </button>
                  );
                })}
              </div>

              {selectedTravelMode === 'bus' && isLoadingBus && (
                <div className="hud-streaming-text mt-3 border-l-2 border-bus bg-bus-soft/70 p-3 text-xs font-semibold text-bus" role="status">
                  {t('findingRelatedStops')}
                </div>
              )}

              {selectedTravelMode === 'bus' && !isLoadingBus && busJourney && (
                <div className="mt-3 border-l-2 border-bus pl-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold text-muted">{t('directYbsRoute')}</p>
                    <Link href={`/buses/${encodeURIComponent(busJourney.line)}`} className="ui-badge border-bus/30 bg-bus-soft text-bus">YBS {toMmNum(busJourney.line)}</Link>
                  </div>
                  <ol className="mt-3 space-y-2 text-[11px] text-ink">
                    <li className="flex items-start gap-2"><Footprints className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gps" /><span>{t('walkToStop')} <strong>{busJourney.boardingStop.name}</strong> · ~{toMmNum(busJourney.accessRoute.durationMin)} {t('minutes')}</span></li>
                    <li className="flex items-start gap-2"><Bus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bus" /><span>{t('rideYbs')} <strong>{toMmNum(busJourney.line)}</strong> · {toMmNum(busJourney.busDistanceKm)} {t('km')}</span></li>
                    <li className="flex items-start gap-2"><Footprints className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gps" /><span>{t('getOffAt')} <strong>{busJourney.alightingStop.name}</strong>, {t('thenWalkToStore')} · ~{toMmNum(busJourney.egressRoute.durationMin)} {t('minutes')}</span></li>
                  </ol>
                </div>
              )}

              {selectedTravelMode === 'bus' && !isLoadingBus && !busJourney && (
                <div className="mt-3 border-l-2 border-line bg-elevated/70 p-3 text-[11px] leading-relaxed text-muted" role="status">
                  {t('noVerifiedDirectBus')}
                </div>
              )}

              <p className="mt-3 text-[10px] leading-relaxed text-muted">{selectedModeNote}</p>
              <a
                href={googleMapsDirectionsUrl(selectedTravelMode, userLocation, routeStore)}
                target="_blank"
                rel="noreferrer"
                className="ui-button mt-3 flex min-h-11 w-full items-center justify-center gap-2 bg-route-action px-3 text-xs font-bold text-white"
              >
                {selectedDirectionsLabel}<span className="sr-only"> ({t('opensInNewTab')})</span><ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
          {!routeStore && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onShowDirection?.(previewStore)} className="ui-button flex min-h-11 items-center justify-center gap-2 bg-route-action text-xs font-bold text-white"><Navigation className="h-4 w-4" />{t('showDirection')}</button>
              <Link href={`/stores/${previewStore.id}`} className="ui-button flex min-h-11 items-center justify-center gap-2 border border-line bg-surface text-xs font-bold text-ink"><Store className="h-4 w-4" />{t('storeDetails')}</Link>
            </div>
          )}
        </div>
      )}
      <div ref={containerRef} className="tactical-map min-h-0 w-full flex-1 overflow-hidden" />
    </div>
  );
}
