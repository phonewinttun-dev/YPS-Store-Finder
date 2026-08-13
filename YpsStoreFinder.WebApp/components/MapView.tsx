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
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-canvas text-muted" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-bus border-t-transparent" />
        <p className="text-sm font-medium">Loading map…</p>
      </div>
    ),
  }
);

export default function MapView(props: MapViewProps) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      <DynamicMapViewContainer {...props} />
    </div>
  );
}
