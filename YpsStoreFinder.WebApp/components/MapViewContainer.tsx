'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StoreDto } from '../types/store';
import { Navigation, MapPin, Route, Bus, X, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

function MapRecenter({
  center,
  zoom,
  selectedStoreId,
  hasRealLocation,
  mobileTab,
}: {
  center: [number, number];
  zoom?: number;
  selectedStoreId: number | null;
  hasRealLocation: boolean;
  mobileTab?: 'map' | 'list';
}) {
  const map = useMap();
  const prevStoreIdRef = useRef<number | null>(null);
  const prevGpsStateRef = useRef<boolean>(false);
  const prevCenterRef = useRef<[number, number]>(center);

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, mobileTab]);

  useEffect(() => {
    const isStoreChanged = selectedStoreId !== prevStoreIdRef.current;
    const isGpsTurnedOn = hasRealLocation && !prevGpsStateRef.current;
    const isCenterChanged =
      hasRealLocation &&
      (Math.abs(prevCenterRef.current[0] - center[0]) > 0.0001 ||
        Math.abs(prevCenterRef.current[1] - center[1]) > 0.0001);

    if (isStoreChanged || isGpsTurnedOn || isCenterChanged) {
      prevStoreIdRef.current = selectedStoreId;
      prevGpsStateRef.current = hasRealLocation;
      prevCenterRef.current = center;

      if (center && center[0] !== 0 && center[1] !== 0) {
        map.flyTo(center, zoom || 15, { duration: 1.2 });
      }
    }
  }, [center, zoom, map, selectedStoreId, hasRealLocation]);
  return null;
}

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
  const { t, tCategory, tAddress, tStoreName, language } = useLanguage();

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

  // Fetch In-App Road Route Geometry from OSRM when activeDirectionStoreId or selectedStore changes
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
          // Fallback to straight line if no route returned
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
                {selectedStore.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] font-semibold text-gray-600 font-mono-meta">
                {isLoadingRoute ? (
                  <span className="text-[#725c00] animate-pulse">
                    {language === 'my' ? 'လမ်းကြောင်း တွက်ချက်နေသည်...' : 'Calculating route...'}
                  </span>
                ) : routeInfo ? (
                  <>
                    <span className="text-[#725c00] font-bold">{routeInfo.distanceKm} km</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <Clock className="w-3 h-3 text-[#725c00]" />
                      ~{routeInfo.durationMin} {language === 'my' ? 'မိနစ်' : 'mins'}
                    </span>
                  </>
                ) : selectedStore.distanceKm !== null ? (
                  <span className="text-[#725c00] font-bold">{selectedStore.distanceKm} km</span>
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
            title="Close Route Direction"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={targetZoom}
        minZoom={10}
        maxBounds={YANGON_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ flex: '1 1 0%', width: '100%' }}
        className="w-full h-full rounded-none overflow-hidden z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter
          center={mapCenter}
          zoom={targetZoom}
          selectedStoreId={activeStoreId}
          hasRealLocation={userLocation.hasRealLocation}
          mobileTab={mobileTab}
        />

        {/* In-App Route Line directly on Leaflet Map */}
        {selectedStore && (
          <Polyline
            positions={
              routeCoordinates.length > 0
                ? routeCoordinates
                : [
                    [userLocation.latitude, userLocation.longitude],
                    [selectedStore.latitude, selectedStore.longitude],
                  ]
            }
            pathOptions={{
              color: '#ba1a1a',
              weight: 5,
              opacity: 0.9,
              dashArray: routeCoordinates.length > 0 ? undefined : '10, 10',
            }}
          />
        )}

        {/* User Location Marker & Radius Circle */}
        {userLocation.hasRealLocation && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserMarkerIcon()}
            >
              <Popup>
                <div className="p-1 font-work-sans text-xs">
                  <span className="font-bold text-[#725c00] block">{t('deviceLocation')}</span>
                  <span className="text-gray-600 font-mono-meta">{t('gpsActive')}</span>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#725c00',
                fillColor: '#ffd200',
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: '6, 6',
              }}
            />
          </>
        )}

        {/* Store Markers */}
        {stores.map((store) => {
          const isSelected = store.id === activeStoreId;
          return (
            <Marker
              key={store.id}
              position={[store.latitude, store.longitude]}
              icon={createStoreMarkerIcon(store.category, isSelected)}
              eventHandlers={{
                click: () => onSelectStore(store),
              }}
            >
              <Popup>
                <div className="p-2 max-w-[250px] font-work-sans">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fff9e6] text-[#725c00] border border-[#ffe07c]">
                      {tCategory(store.category)}
                    </span>
                    {store.distanceKm !== null && (
                      <span className="text-xs font-bold font-mono-meta text-[#725c00] bg-[#ffd200] px-2 py-0.5 rounded border border-[#e5bc00]">
                        {store.distanceKm} {t('km')}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#1a1c1e] mb-1.5">{tStoreName(store.name)}</h4>

                  {store.address && (
                    <p className="text-xs text-gray-700 font-medium mb-2.5 leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                      <span>{tAddress(store.address)}</span>
                    </p>
                  )}

                  {/* In-App Route Direction Trigger Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShowDirection) {
                        onShowDirection(store);
                      } else {
                        onSelectStore(store);
                      }
                    }}
                    className="w-full mt-2 py-2 px-3 bg-[#725c00] hover:bg-[#564500] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Route className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-bold">{t('showDirection')}</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
