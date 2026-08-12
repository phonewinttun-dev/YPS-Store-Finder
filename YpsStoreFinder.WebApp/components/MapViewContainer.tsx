'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Clock, MapPin, Navigation, Route, Store, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
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
  const background = 'rgb(var(--store))';
  const foreground = 'rgb(var(--surface))';
  const border = selected ? 'rgb(var(--route))' : 'rgb(var(--surface))';
  return L.divIcon({
    className: 'custom-store-pin',
    html: `<div aria-hidden="true" style="background:${background};color:${foreground};width:40px;height:40px;border-radius:14px 14px 14px 5px;border:${selected ? 4 : 2}px solid ${border};box-shadow:${selected ? '0 0 0 7px rgb(var(--route) / .2),0 6px 20px rgba(0,0,0,.28)' : '0 5px 14px rgba(0,0,0,.22)'};display:flex;align-items:center;justify-content:center;transform:rotate(-45deg) ${selected ? 'scale(1.1)' : ''};transition:transform .2s ease"><span style="display:flex;transform:rotate(45deg)">${categoryIcon(category)}</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [20, 36],
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
  activeDirectionStoreId,
}: MapViewContainerProps) {
  const { t, tAddress, tCategory, tStoreName, toMmNum } = useLanguage();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const storesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const previousStoreId = useRef<number | null>(null);
  const previousGpsState = useRef(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const previewStore = selectedStoreId ? stores.find((store) => store.id === selectedStoreId) ?? null : null;
  const routeStore = activeDirectionStoreId ? stores.find((store) => store.id === activeDirectionStoreId) ?? null : null;

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
    if (!routeStore) return;
    const controller = new AbortController();
    const loadRoute = async () => {
      setIsLoadingRoute(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${routeStore.longitude},${routeStore.latitude}?overview=full&geometries=geojson`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('OSRM route service unavailable');
        const data = await response.json();
        const route = data.routes?.[0];
        if (!route) throw new Error('No route returned');
        setRouteCoordinates(route.geometry.coordinates.map(([longitude, latitude]: [number, number]) => [latitude, longitude]));
        setRouteInfo({ distanceKm: Number((route.distance / 1000).toFixed(2)), durationMin: Math.max(1, Math.round(route.duration / 60)) });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('Routing service fallback:', error);
        setRouteCoordinates([[userLocation.latitude, userLocation.longitude], [routeStore.latitude, routeStore.longitude]]);
        setRouteInfo(null);
      } finally {
        if (!controller.signal.aborted) setIsLoadingRoute(false);
      }
    };
    loadRoute();
    return () => controller.abort();
  }, [routeStore, userLocation.latitude, userLocation.longitude]);

  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!routeStore) return;
    const positions: L.LatLngTuple[] = routeCoordinates.length
      ? routeCoordinates as L.LatLngTuple[]
      : [[userLocation.latitude, userLocation.longitude], [routeStore.latitude, routeStore.longitude]];
    layer.addLayer(L.polyline(positions, {
      color: resolvedTheme === 'dark' ? '#A9A7FF' : '#4F46C7',
      weight: 6,
      opacity: 0.92,
      dashArray: routeCoordinates.length ? undefined : '10, 10',
    }));
  }, [resolvedTheme, routeCoordinates, routeStore, userLocation.latitude, userLocation.longitude]);

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
      badge.className = 'inline-flex rounded-full bg-store-soft px-2 py-1 text-[10px] font-bold text-store';
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
      direction.className = 'mt-3 min-h-11 w-full rounded-[14px] bg-route-action px-3 text-xs font-bold text-white';
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

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      {previewStore && (
        <div className={`glass-panel absolute left-3 right-3 top-3 z-[600] max-w-sm rounded-[24px] border p-3 shadow-soft sm:left-5 sm:right-auto ${routeStore ? 'border-route/60' : 'border-store/55'}`}>
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] ${routeStore ? 'bg-route-soft text-route' : 'bg-store-soft text-store'}`}>
              {routeStore ? <Route className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-ink">{tStoreName(previewStore.name)}</h2>
              <div className="font-mono-meta mt-1 flex items-center gap-2 text-[10px] font-semibold text-muted" role={isLoadingRoute ? 'status' : undefined}>
                {isLoadingRoute ? <span className="text-route">{t('calculatingRoute')}</span> : routeInfo ? <><span className="font-bold text-route">{toMmNum(routeInfo.distanceKm)} {t('km')}</span><span aria-hidden="true">•</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{toMmNum(routeInfo.durationMin)} {t('minutes')}</span></> : <span>{tCategory(previewStore.category)}</span>}
              </div>
            </div>
            <button type="button" onClick={() => onCloseDirection?.()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-elevated text-muted hover:text-ink" aria-label={t('close')}><X className="h-4 w-4" /></button>
          </div>
          {!routeStore && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onShowDirection?.(previewStore)} className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-route-action text-xs font-bold text-white"><Navigation className="h-4 w-4" />{t('showDirection')}</button>
              <Link href={`/stores/${previewStore.id}`} className="flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-line bg-surface text-xs font-bold text-ink"><Store className="h-4 w-4" />{t('storeDetails')}</Link>
            </div>
          )}
        </div>
      )}
      <div ref={containerRef} className="min-h-0 w-full flex-1 overflow-hidden" />
    </div>
  );
}
