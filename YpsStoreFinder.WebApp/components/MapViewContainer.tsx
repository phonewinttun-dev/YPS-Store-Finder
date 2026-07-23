'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StoreDto } from '../types/store';
import { Navigation, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MapViewContainerProps {
  stores: StoreDto[];
  userLocation: { latitude: number; longitude: number; hasRealLocation: boolean };
  radiusKm: number;
  selectedStoreId: number | null;
  onSelectStore: (store: StoreDto) => void;
}

// Custom Leaflet Icons
const createUserMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div class="user-pulse-marker"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const createStoreMarkerIcon = (category: string, isSelected: boolean) => {
  let bgColor = '#1d5fa8'; // Default Transit Blue
  if (category.toLowerCase().includes('kios') || category.toLowerCase().includes('top-up')) {
    bgColor = '#725c00'; // YBS Yellow Dark
  } else if (category.toLowerCase().includes('cinema')) {
    bgColor = '#ba1a1a'; // Error Red
  } else if (category.toLowerCase().includes('agent')) {
    bgColor = '#585f64'; // Tertiary Grey
  }

  const scale = isSelected ? 'scale(1.25)' : 'scale(1)';
  const border = isSelected ? '3px solid #ffd200' : '2px solid #ffffff';

  return L.divIcon({
    className: 'custom-store-pin',
    html: `<div style="
      background-color: ${bgColor};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: ${border};
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transform: ${scale};
      transition: transform 0.2s ease;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to dynamically re-center map when location or selected store changes
function MapRecenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

export default function MapViewContainer({
  stores,
  userLocation,
  radiusKm,
  selectedStoreId,
  onSelectStore,
}: MapViewContainerProps) {
  const { t, tCategory, tAddress } = useLanguage();
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    userLocation.latitude,
    userLocation.longitude,
  ]);

  useEffect(() => {
    if (selectedStoreId) {
      const selected = stores.find((s) => s.id === selectedStoreId);
      if (selected) {
        setMapCenter([selected.latitude, selected.longitude]);
      }
    } else {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [selectedStoreId, userLocation.latitude, userLocation.longitude, stores]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full rounded-2xl overflow-hidden shadow-inner"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={mapCenter} />

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
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.latitude, store.longitude]}
            icon={createStoreMarkerIcon(store.category, store.id === selectedStoreId)}
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
        ))}
      </MapContainer>
    </div>
  );
}
