'use client';

import dynamic from 'next/dynamic';
import { StoreDto } from '../types/store';

interface MapViewProps {
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

const DynamicMapViewContainer = dynamic(
  () => import('./MapViewContainer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-0 bg-[#eeeef0] flex flex-col items-center justify-center text-gray-500 gap-3">
        <div className="w-8 h-8 border-3 border-[#1d5fa8] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Interactive Map...</p>
      </div>
    ),
  }
);

export default function MapView(props: MapViewProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col w-full relative">
      <DynamicMapViewContainer {...props} />
    </div>
  );
}
