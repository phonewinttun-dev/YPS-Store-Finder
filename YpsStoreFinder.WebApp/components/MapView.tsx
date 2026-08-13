'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '../context/LanguageContext';
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
  nearestStoreId?: number | null;
  mobileTab?: 'map' | 'list';
}

function MapLoading() {
  const { t } = useLanguage();
  return (
    <div className="hud-grid flex h-full min-h-0 w-full flex-col items-center justify-center gap-4 bg-canvas text-muted" role="status">
      <div className="hud-radar-loader" aria-hidden="true"><span /></div>
      <p className="hud-streaming-text text-sm font-semibold text-brand">{t('loadingMap')}</p>
    </div>
  );
}

const DynamicMapViewContainer = dynamic(
  () => import('./MapViewContainer'),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function MapView(props: MapViewProps) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      <DynamicMapViewContainer {...props} />
    </div>
  );
}
