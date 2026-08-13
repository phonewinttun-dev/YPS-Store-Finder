'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  AlertCircle,
  Bus,
  CheckCircle2,
  ChevronDown,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Store,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchNearbyBusStopsForStore } from '../services/api';
import { StoreNearbyBusStopsDto } from '../types/bus';
import { CategorySummaryDto, PaginationDto, StoreDto, UserLocationState } from '../types/store';
import SearchField from './ui/SearchField';
import StatusBadge from './ui/StatusBadge';

interface StoreDrawerProps {
  stores: StoreDto[];
  categories: CategorySummaryDto[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  locationState: UserLocationState;
  onToggleLocation: () => void;
  selectedStoreId: number | null;
  onSelectStore: (store: StoreDto) => void;
  apiError?: string | null;
  onRetry?: () => void;
  pagination: PaginationDto | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onShowDirection: (store: StoreDto) => void;
  isShowAllStoresMode: boolean;
  onToggleShowAllStores: () => void;
}

export default function StoreDrawer({
  stores,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  locationState,
  onToggleLocation,
  selectedStoreId,
  onSelectStore,
  apiError,
  onRetry,
  pagination,
  isLoading,
  isLoadingMore,
  onLoadMore,
  onShowDirection,
  isShowAllStoresMode,
  onToggleShowAllStores,
}: StoreDrawerProps) {
  const { t, tCategory, tAddress, tStoreName, toMmNum, tStoreCount } = useLanguage();
  const [expandedStops, setExpandedStops] = useState<Record<number, boolean>>({});
  const [busInfo, setBusInfo] = useState<Record<number, StoreNearbyBusStopsDto | null>>({});
  const [loadingBusInfo, setLoadingBusInfo] = useState<Record<number, boolean>>({});

  const toggleStops = async (storeId: number) => {
    const willOpen = !expandedStops[storeId];
    setExpandedStops((current) => ({ ...current, [storeId]: willOpen }));
    if (!willOpen || busInfo[storeId] || loadingBusInfo[storeId]) return;

    setLoadingBusInfo((current) => ({ ...current, [storeId]: true }));
    try {
      const response = await fetchNearbyBusStopsForStore(storeId);
      setBusInfo((current) => ({ ...current, [storeId]: response.isSuccess ? response.data : null }));
    } catch (error) {
      console.error('Error fetching nearby bus stops:', error);
      setBusInfo((current) => ({ ...current, [storeId]: null }));
    } finally {
      setLoadingBusInfo((current) => ({ ...current, [storeId]: false }));
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight <= 180 &&
      pagination?.hasNextPage &&
      !isLoadingMore &&
      !isLoading
    ) {
      onLoadMore();
    }
  };

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden bg-surface" aria-label={t('stores')}>
      <div className="transit-ribbon h-1 w-full shrink-0" />
      <div className="shrink-0 border-b border-line bg-surface px-4 pb-4 pt-3">
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="ui-eyebrow text-store">YPS TRANSIT EXPLORER</p>
            <h1 className="ui-page-title mt-1 text-ink">{t('stores')}</h1>
          </div>
          <StatusBadge tone="store" mono className="min-h-9 max-w-32 justify-center text-center text-xs font-bold leading-relaxed" aria-live="polite">
            {tStoreCount(pagination?.totalCount ?? stores.length)}
          </StatusBadge>
        </div>

        <SearchField
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t('searchPlaceholder')}
          clearLabel={t('close')}
        />

        <div className="custom-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              onSelectCategory(null);
              if (!isShowAllStoresMode) onToggleShowAllStores();
            }}
            className={`ui-button min-h-11 shrink-0 border px-4 text-xs font-semibold ${
              selectedCategory === null && isShowAllStoresMode
                ? 'bg-brand-soft text-brand ring-1 ring-brand/30'
                : 'border border-line bg-surface text-muted hover:bg-elevated hover:text-ink'
            }`}
          >
            {t('allCategories')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isShowAllStoresMode || !locationState.isTracking) onToggleLocation();
              else onToggleShowAllStores();
            }}
            className={`ui-button flex min-h-11 shrink-0 items-center gap-2 border px-4 text-xs font-semibold ${
              locationState.isTracking && !isShowAllStoresMode
                ? 'bg-gps-soft text-gps ring-1 ring-gps/30'
                : 'border border-line bg-surface text-muted hover:bg-elevated hover:text-ink'
            }`}
          >
            <LocateFixed className="h-4 w-4" />
            {t('nearby')} · <span className="font-mono-meta">{toMmNum(2)} km</span>
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.category}
              onClick={() => onSelectCategory(category.category)}
              className={`ui-button flex min-h-11 shrink-0 items-center gap-2 border px-4 text-xs font-semibold ${
                selectedCategory === category.category
                  ? 'bg-store-soft text-store ring-1 ring-store/30'
                  : 'border border-line bg-surface text-muted hover:bg-elevated hover:text-ink'
              }`}
            >
              {tCategory(category.category)}
              <span className="font-mono-meta rounded-lg bg-surface/70 px-1.5 py-1 text-[10px]">{toMmNum(category.count)}</span>
            </button>
          ))}
        </div>

        {locationState.error && (
          <div className="mt-3 flex items-start gap-2 rounded-[18px] border border-danger/35 bg-danger-soft p-3 text-xs font-semibold text-danger" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t(locationState.error)}</span>
          </div>
        )}
      </div>

      <div onScroll={handleScroll} className="custom-scrollbar scrollable-panel min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-canvas p-2.5 pb-24 sm:p-3">
        {apiError && (
          <div className="ui-card border-danger/35 bg-danger-soft p-4 text-danger" role="alert">
            <div className="flex items-center gap-2 text-sm font-bold">
              <AlertCircle className="h-4 w-4" />
              {t('apiErrorTitle')}
            </div>
            <p className="mt-2 text-xs leading-relaxed">{apiError}</p>
            {onRetry && (
              <button type="button" onClick={onRetry} className="ui-button mt-3 inline-flex min-h-11 items-center gap-2 bg-danger-action px-4 text-xs font-bold text-white">
                <RefreshCw className="h-4 w-4" /> {t('retryConnection')}
              </button>
            )}
          </div>
        )}

        {isLoading && stores.length === 0 && (
          <div className="space-y-3" role="status" aria-live="polite">
            <span className="sr-only">{t('updatingStores')}</span>
            {[0, 1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-3xl border border-line bg-elevated" />)}
          </div>
        )}

        {!isLoading && !apiError && stores.length === 0 && (
          <div className="surface-card flex flex-col items-center px-5 py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-store-soft text-store"><Store className="h-6 w-6" /></div>
            <h2 className="text-sm font-bold text-ink">{t('noStoresFound')}</h2>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted">{t('noStoresSub')}</p>
          </div>
        )}

        {stores.map((store) => {
          const selected = selectedStoreId === store.id;
          const stops = busInfo[store.id]?.nearbyBusStops ?? [];
          return (
            <article key={store.id} className={`ui-card ui-interactive-card overflow-hidden ${selected ? 'border-store ring-2 ring-store/20' : 'hover:border-store/60'}`}>
              <button type="button" onClick={() => onSelectStore(store)} className="block min-h-11 w-full p-4 text-left" aria-expanded={selected}>
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-store-soft text-store"><MapPin className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-store">{tCategory(store.category)}</span>
                      {store.distanceKm !== null && <span className="font-mono-meta shrink-0 text-[10px] font-bold text-gps">{toMmNum(store.distanceKm)} {t('km')}</span>}
                    </span>
                    <span className="block text-sm font-bold leading-snug text-ink">{tStoreName(store.name)}</span>
                    {store.address && <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-muted">{tAddress(store.address)}</span>}
                  </span>
                  <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted transition-transform ${selected ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {selected && (
                <div className="border-t border-line bg-elevated/60 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => onShowDirection(store)} className="ui-button inline-flex min-h-11 items-center justify-center gap-2 bg-route-action text-xs font-bold text-white hover:bg-route-action/90">
                      <Navigation className="h-4 w-4" /> {t('showDirection')}
                    </button>
                    <Link href={`/stores/${store.id}`} className="ui-button inline-flex min-h-11 items-center justify-center gap-2 border border-line bg-surface text-xs font-bold text-ink hover:bg-elevated">
                      <Store className="h-4 w-4" /> {t('storeDetails')}
                    </Link>
                  </div>
                  <button type="button" onClick={() => toggleStops(store.id)} className="ui-button mt-2 flex min-h-11 w-full items-center justify-between bg-bus-soft px-3 text-xs font-bold text-bus" aria-expanded={!!expandedStops[store.id]}>
                    <span className="flex items-center gap-2"><Bus className="h-4 w-4" /> {t('showBusStops')}</span>
                    {loadingBusInfo[store.id] ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ChevronDown className={`h-4 w-4 transition-transform ${expandedStops[store.id] ? 'rotate-180' : ''}`} />}
                  </button>
                  {expandedStops[store.id] && !loadingBusInfo[store.id] && (
                    <div className="mt-2 space-y-2">
                      {stops.map((stop, index) => (
                        <div key={`${stop.stopName}-${index}`} className="rounded-[16px] border border-bus/35 bg-surface p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div><p className="text-xs font-bold text-ink">{stop.stopName}</p>{stop.roadTownship && <p className="mt-1 text-[10px] text-muted">{stop.roadTownship}</p>}</div>
                            {stop.distanceMeters !== undefined && <span className="font-mono-meta shrink-0 rounded-lg bg-gps-soft px-2 py-1 text-[10px] font-bold text-gps">{toMmNum(stop.distanceMeters)} {t('meters')}</span>}
                          </div>
                          {!!stop.servicingBusNumbers?.length && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {Array.from(new Set(stop.servicingBusNumbers)).map((number) => (
                                <Link key={number} href={`/buses/${encodeURIComponent(number)}`} className="font-mono-meta inline-flex min-h-11 min-w-11 items-center justify-center rounded-[13px] bg-bus-soft px-2 text-[10px] font-bold text-bus">{toMmNum(number)}</Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {stops.length === 0 && <p className="rounded-2xl bg-surface p-3 text-xs text-muted">{t('nearestBusStops')}: —</p>}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {isLoadingMore && <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-store" role="status"><RefreshCw className="h-4 w-4 animate-spin" /> {t('updatingStores')}</div>}
        {pagination && !pagination.hasNextPage && stores.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs font-bold text-gps"><CheckCircle2 className="h-4 w-4" /> {t('allStoresShown')}</div>
        )}
      </div>
    </section>
  );
}
