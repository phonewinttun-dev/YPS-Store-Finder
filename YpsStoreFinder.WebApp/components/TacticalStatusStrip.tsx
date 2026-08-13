'use client';

import { Activity, Crosshair, RadioTower, Store } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TacticalStatusStripProps {
  isLoading: boolean;
  hasError: boolean;
  gpsActive: boolean;
  visibleStoreCount: number;
  hasSelection: boolean;
  hasActiveRoute: boolean;
}

export default function TacticalStatusStrip({
  isLoading,
  hasError,
  gpsActive,
  visibleStoreCount,
  hasSelection,
  hasActiveRoute,
}: TacticalStatusStripProps) {
  const { t, toMmNum } = useLanguage();
  const phase = hasError
    ? t('connectionUnavailable')
    : isLoading
      ? t('syncingStores')
      : hasActiveRoute
        ? t('routeActive')
        : hasSelection
          ? t('storeSelected')
          : t('mapReady');

  return (
    <section
      className={`hud-status-monitor absolute right-3 top-3 z-[500] w-[min(354px,calc(100%-1.5rem))] ${hasSelection ? 'hidden 2xl:block' : ''}`}
      aria-label={t('systemStatus')}
      role="status"
      aria-live="polite"
      data-state={hasError ? 'error' : isLoading ? 'busy' : 'ready'}
    >
      <div className="hud-status-heading">
        <span className="flex min-w-0 items-center gap-2">
          <Activity className="hud-status-heading-icon h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('systemStatus')}</span>
        </span>
        <span className="truncate text-right text-ink">{phase}</span>
      </div>
      <div className="grid grid-cols-3">
        <div className="hud-status-cell">
          <RadioTower className="h-4 w-4 text-bus" aria-hidden="true" />
          <span>
            <span className="hud-status-label">{t('dataLink')}</span>
            <strong>{hasError ? t('offline') : isLoading ? t('syncing') : t('online')}</strong>
          </span>
        </div>
        <div className="hud-status-cell">
          <Crosshair className="h-4 w-4 text-gps" aria-hidden="true" />
          <span>
            <span className="hud-status-label">{t('position')}</span>
            <strong>{gpsActive ? t('gpsOn') : t('manualPosition')}</strong>
          </span>
        </div>
        <div className="hud-status-cell">
          <Store className="h-4 w-4 text-store" aria-hidden="true" />
          <span>
            <span className="hud-status-label">{t('visibleStores')}</span>
            <strong className="font-mono-meta">{toMmNum(visibleStoreCount)}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
