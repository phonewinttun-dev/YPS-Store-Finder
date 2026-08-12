'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, MapPin, Route, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
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

// Yangon Region Geographic Bounding Box Limits
const YANGON_BOUNDS = L.latLngBounds(
  [16.30, 95.80], // South-West
  [17.50, 96.70]  // North-East
);

// Custom Leaflet User Location Pulse Icon with YPS Gold Theme
const createUserMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div class="user-pulse-marker" style="background-color: #725c00; box-shadow: 0 0 0 8px rgba(255, 210, 0, 0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const getCategorySvgIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('kios') || cat.includes('top-up')) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`;
  } else if (cat.includes('bus') || cat.includes('terminal')) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M4 18v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"/><path d="M16 18v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"/><path d="M3 11a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4H4V6z"/></svg>`;
  } else if (cat.includes('cinema')) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>`;
  } else if (cat.includes('capital') || cat.includes('hyper') || cat.includes('market')) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
  } else if (cat.includes('agent')) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`;
  } else if (cat.includes('g&g') || cat.includes('store')) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M18 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M10 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/><path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7"/></svg>`;
  }
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
};

const createStoreMarkerIcon = (category: string, isSelected: boolean) => {
  const iconSvg = getCategorySvgIcon(category);

  const bgColor = isSelected ? '#ffd200' : '#725c00';
  const iconColor = isSelected ? '#1a1c1e' : '#ffffff';
  const border = isSelected ? '3px solid #1a1c1e' : '2px solid #ffffff';
  const scale = isSelected ? 'scale(1.35)' : 'scale(1)';
  const boxShadow = isSelected
    ? '0 0 16px rgba(255, 210, 0, 0.9), 0 4px 12px rgba(0,0,0,0.4)'
    : '0 3px 8px rgba(0,0,0,0.25)';

  return L.divIcon({
    className: 'custom-store-pin',
    html: `<div style="
      background-color: ${bgColor};
      color: ${iconColor};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: ${border};
      box-shadow: ${boxShadow};
      display: flex;
      align-items: center;
      justify-content: center;
      transform: ${scale};
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    ">
      ${iconSvg}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

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
  mobileTab,
}: MapViewContainerProps) {
  const { t, tCategory, tAddress, tStoreName, toMmNum } = useLanguage();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const storesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  const activeStoreId = activeDirectionStoreId || selectedStoreId;
  const selectedStore = activeStoreId
    ? stores.find((s) => s.id === activeStoreId) || null
    : null;

  const mapCenter: [number, number] = selectedStore
    ? [selectedStore.latitude, selectedStore.longitude]
    : [userLocation.latitude, userLocation.longitude];

  const targetZoom = selectedStore ? 16 : 14;

  const prevStoreIdRef = useRef<number | null>(null);
  const prevGpsStateRef = useRef<boolean>(false);
  const prevCenterRef = useRef<[number, number]>(mapCenter);

  // Initialize Native Leaflet Map Engine (React 19 & Next.js 16 Compatible)
  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [userLocation.latitude, userLocation.longitude],
      zoom: 14,
      minZoom: 10,
      maxBounds: YANGON_BOUNDS,
      maxBoundsViscosity: 1.0,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    userLayerRef.current = L.layerGroup().addTo(map);
    storesLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      userLayerRef.current = null;
      storesLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  // Resize map when window resizes, container changes size, or mobileTab changes
  useEffect(() => {
    if (!mapRef.current || !containerRef.current) return;
    const map = mapRef.current;
    const container = containerRef.current;

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    const rafId = requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mobileTab]);

  // Recenter map on store change or GPS activation
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const isStoreChanged = selectedStoreId !== prevStoreIdRef.current;
    const isGpsTurnedOn = userLocation.hasRealLocation && !prevGpsStateRef.current;
    const isCenterChanged =
      userLocation.hasRealLocation &&
      (Math.abs(prevCenterRef.current[0] - mapCenter[0]) > 0.0001 ||
        Math.abs(prevCenterRef.current[1] - mapCenter[1]) > 0.0001);

    if (isStoreChanged || isGpsTurnedOn || isCenterChanged) {
      prevStoreIdRef.current = selectedStoreId;
      prevGpsStateRef.current = userLocation.hasRealLocation;
      prevCenterRef.current = mapCenter;

      if (mapCenter && mapCenter[0] !== 0 && mapCenter[1] !== 0) {
        map.flyTo(mapCenter, targetZoom, { duration: 1.2 });
      }
    }
  }, [mapCenter, targetZoom, selectedStoreId, userLocation.hasRealLocation]);

  // Fetch OSRM route geometry
  useEffect(() => {
    if (!selectedStore || !userLocation.latitude || !userLocation.longitude) {
      setRouteCoordinates([]);
      setRouteInfo(null);
      return;
    }

    const fetchOsrmRoute = async () => {
      setIsLoadingRoute(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${selectedStore.longitude},${selectedStore.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM router service error');
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
          setRouteCoordinates(coords);
          setRouteInfo({
            distanceKm: Number((route.distance / 1000).toFixed(2)),
            durationMin: Math.max(1, Math.round(route.duration / 60)),
          });
        } else {
          setRouteCoordinates([
            [userLocation.latitude, userLocation.longitude],
            [selectedStore.latitude, selectedStore.longitude],
          ]);
          setRouteInfo(null);
        }
      } catch (err) {
        console.warn('In-app routing fetch failed, falling back to straight polyline:', err);
        setRouteCoordinates([
          [userLocation.latitude, userLocation.longitude],
          [selectedStore.latitude, selectedStore.longitude],
        ]);
        setRouteInfo(null);
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchOsrmRoute();
  }, [selectedStore, userLocation.latitude, userLocation.longitude]);

  // Update Route Polyline Layer
  useEffect(() => {
    if (!routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();

    if (selectedStore) {
      const positions: L.LatLngTuple[] =
        routeCoordinates.length > 0
          ? (routeCoordinates as L.LatLngTuple[])
          : [
              [userLocation.latitude, userLocation.longitude],
              [selectedStore.latitude, selectedStore.longitude],
            ];
      const polyline = L.polyline(positions, {
        color: '#ba1a1a',
        weight: 5,
        opacity: 0.9,
        dashArray: routeCoordinates.length > 0 ? undefined : '10, 10',
      });
      routeLayerRef.current.addLayer(polyline);
    }
  }, [selectedStore, routeCoordinates, userLocation]);

  // Update User Marker & Radius Layer
  useEffect(() => {
    if (!userLayerRef.current) return;
    userLayerRef.current.clearLayers();

    if (userLocation.hasRealLocation) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: createUserMarkerIcon(),
      });
      userMarker.bindPopup(`
        <div class="p-1 font-work-sans text-xs">
          <span class="font-bold text-[#725c00] block">${t('deviceLocation')}</span>
          <span class="text-gray-600 font-mono-meta">${t('gpsActive')}</span>
        </div>
      `);
      userLayerRef.current.addLayer(userMarker);

      const circle = L.circle([userLocation.latitude, userLocation.longitude], {
        radius: radiusKm * 1000,
        color: '#725c00',
        fillColor: '#ffd200',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '6, 6',
      });
      userLayerRef.current.addLayer(circle);
    }
  }, [userLocation, radiusKm, t]);

  // Update Store Markers Layer
  useEffect(() => {
    if (!storesLayerRef.current) return;
    storesLayerRef.current.clearLayers();

    stores.forEach((store) => {
      const isSelected = store.id === activeStoreId;
      const marker = L.marker([store.latitude, store.longitude], {
        icon: createStoreMarkerIcon(store.category, isSelected),
      });

      marker.on('click', () => {
        onSelectStore(store);
      });

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-2 max-w-[250px] font-work-sans';
      popupDiv.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fff9e6] text-[#725c00] border border-[#ffe07c]">
            ${tCategory(store.category)}
          </span>
          ${
            store.distanceKm !== null
              ? `<span class="text-xs font-bold font-mono-meta text-[#725c00] bg-[#ffd200] px-2 py-0.5 rounded border border-[#e5bc00]">${toMmNum(
                  store.distanceKm
                )} ${t('km')}</span>`
              : ''
          }
        </div>
        <h4 class="font-bold text-sm text-[#1a1c1e] mb-1.5">${tStoreName(store.name)}</h4>
        ${
          store.address
            ? `<p class="text-xs text-gray-700 font-medium mb-2.5 leading-relaxed flex items-start gap-1.5">
                <span>${tAddress(store.address)}</span>
              </p>`
            : ''
        }
        <button class="dir-btn w-full mt-2 py-2 px-3 bg-[#725c00] hover:bg-[#564500] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer">
          <span class="text-white font-bold">${t('showDirection')}</span>
        </button>
      `;

      const btn = popupDiv.querySelector('.dir-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onShowDirection) {
            onShowDirection(store);
          } else {
            onSelectStore(store);
          }
        });
      }

      marker.bindPopup(popupDiv);
      storesLayerRef.current?.addLayer(marker);
    });
  }, [stores, activeStoreId, onSelectStore, onShowDirection, t, tCategory, tAddress, tStoreName, toMmNum]);

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full relative">
      {/* In-App Route Information Header Overlay */}
      {selectedStore && (
        <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto z-[600] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-[#ffe07c] max-w-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffd200] text-[#1a1c1e] flex items-center justify-center font-bold shrink-0 border border-[#e5bc00] shadow-xs">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#1a1c1e] truncate max-w-[180px]">
                {tStoreName(selectedStore.name)}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] font-semibold text-gray-600 font-mono-meta">
                {isLoadingRoute ? (
                  <span className="text-[#725c00] animate-pulse">
                    လမ်းကြောင်း တွက်ချက်နေသည်...
                  </span>
                ) : routeInfo ? (
                  <>
                    <span className="text-[#725c00] font-bold">{toMmNum(routeInfo.distanceKm)} {t('km')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <Clock className="w-3 h-3 text-[#725c00]" />
                      ~{toMmNum(routeInfo.durationMin)} မိနစ်
                    </span>
                  </>
                ) : selectedStore.distanceKm !== null ? (
                  <span className="text-[#725c00] font-bold">{toMmNum(selectedStore.distanceKm)} {t('km')}</span>
                ) : (
                  <span>{tCategory(selectedStore.category)}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onCloseDirection) onCloseDirection();
              else onSelectStore(selectedStore);
            }}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="လမ်းကြောင်းပိတ်ရန်"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Native Leaflet Map Element Container */}
      <div ref={containerRef} className="w-full h-full rounded-none overflow-hidden z-10 flex-1" />
    </div>
  );
}
