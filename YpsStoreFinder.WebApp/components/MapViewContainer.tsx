'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StoreDto } from '../types/store';
import { Navigation, MapPin, Route, Bus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MapViewContainerProps {
  stores: StoreDto[];
  userLocation: { latitude: number; longitude: number; hasRealLocation: boolean };
  radiusKm: number;
  selectedStoreId: number | null;
  onSelectStore: (store: StoreDto) => void;
  onRequestEnableGps?: () => void;
  activeDirectionStoreId?: number | null;
}

// Custom Leaflet User Location Pulse Icon
const createUserMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div class="user-pulse-marker"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Vector SVG Category Icons (No Emojis)
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

  const bgColor = isSelected ? '#ffd200' : '#1d5fa8';
  const iconColor = isSelected ? '#1a1c1e' : '#ffffff';
  const border = isSelected ? '3px solid #ffffff' : '2px solid #ffffff';
  const scale = isSelected ? 'scale(1.35)' : 'scale(1)';
  const boxShadow = isSelected
    ? '0 0 16px rgba(255, 210, 0, 0.9), 0 4px 12px rgba(0,0,0,0.3)'
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

function MapRecenter({ center, zoom, selectedStoreId }: { center: [number, number]; zoom?: number; selectedStoreId: number | null }) {
  const map = useMap();
  const prevStoreIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedStoreId !== prevStoreIdRef.current) {
      prevStoreIdRef.current = selectedStoreId;
      if (center && center[0] !== 0 && center[1] !== 0) {
        map.setView(center, zoom || 15);
      }
    }
  }, [center, zoom, map, selectedStoreId]);
  return null;
}

export default function MapViewContainer({
  stores,
  userLocation,
  radiusKm,
  selectedStoreId,
  onSelectStore,
  onRequestEnableGps,
  activeDirectionStoreId,
}: MapViewContainerProps) {
  const { t, tCategory, tAddress } = useLanguage();

  const activeStoreId = activeDirectionStoreId || selectedStoreId;
  const selectedStore = activeStoreId
    ? stores.find((s) => s.id === activeStoreId) || null
    : null;

  const mapCenter: [number, number] = selectedStore
    ? [selectedStore.latitude, selectedStore.longitude]
    : [userLocation.latitude, userLocation.longitude];

  const targetZoom = selectedStore ? 16 : 14;

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={mapCenter}
        zoom={targetZoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-2xl overflow-hidden shadow-inner"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={mapCenter} zoom={targetZoom} selectedStoreId={activeStoreId} />

        {/* Direction Path Route Line between User's Location and Selected Store */}
        {selectedStore && (
          <Polyline
            positions={[
              [userLocation.latitude, userLocation.longitude],
              [selectedStore.latitude, selectedStore.longitude],
            ]}
            pathOptions={{
              color: '#ba1a1a',
              weight: 5,
              dashArray: '10, 10',
              opacity: 0.9,
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
                  <span className="font-semibold text-[#1d5fa8] block">{t('deviceLocation')}</span>
                  <span className="text-gray-600 font-mono-meta">{t('gpsActive')}</span>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#1d5fa8',
                fillColor: '#7ab0ff',
                fillOpacity: 0.12,
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
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#ebf2f8] text-[#1d5fa8]">
                      {tCategory(store.category)}
                    </span>
                    {store.distanceKm !== null && (
                      <span className="text-xs font-semibold font-mono-meta text-[#725c00] bg-[#ffe07c] px-2 py-0.5 rounded">
                        {store.distanceKm} {t('km')}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#1a1c1e] mb-1.5">{store.name}</h4>

                  {store.address && (
                    <p className="text-xs text-gray-700 font-medium mb-2.5 leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                      <span>{tAddress(store.address)}</span>
                    </p>
                  )}

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-2 py-2 px-3 bg-[#1d5fa8] hover:bg-[#00417e] !text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 !text-white" />
                    <span className="!text-white font-bold">{t('directions')}</span>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
