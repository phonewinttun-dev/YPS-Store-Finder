'use client';

import React from 'react';
import { StoreDto, CategorySummaryDto, UserLocationState, PaginationDto } from '../types/store';
import { Search, Navigation, Locate, MapPin, Compass, AlertCircle, X, RefreshCw, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StoreDrawerProps {
  stores: StoreDto[];
  categories: CategorySummaryDto[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  locationState: UserLocationState;
  onToggleLocation: () => void;
  selectedStoreId: number | null;
  onSelectStore: (store: StoreDto) => void;
  isNearbyMode: boolean;
  onToggleNearbyMode: () => void;
  apiError?: string | null;
  onRetry?: () => void;
  pagination: PaginationDto | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export default function StoreDrawer({
  stores,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  radiusKm,
  onRadiusChange,
  locationState,
  onToggleLocation,
  selectedStoreId,
  onSelectStore,
  isNearbyMode,
  onToggleNearbyMode,
  apiError,
  onRetry,
  pagination,
  isLoading,
  isLoadingMore,
  onLoadMore,
}: StoreDrawerProps) {
  const { language, toggleLanguage, t, tCategory, tAddress } = useLanguage();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 180;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight <= threshold &&
      pagination?.hasNextPage &&
      !isLoadingMore &&
      !isLoading
    ) {
      onLoadMore();
    }
  };

  return (
    <aside className="w-full lg:w-[420px] bg-white border-r border-[#e2e2e5] flex flex-col h-full shadow-lg shrink-0 overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-[#e2e2e5] bg-gradient-to-br from-[#ffffff] to-[#ebf2f8]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/yps_logo.jpg"
              alt="YPS Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-[#e2e2e5]"
            />
            <div>
              <h1 className="font-bold text-base sm:text-lg text-[#1a1c1e] leading-tight">{t('appTitle')}</h1>
              <p className="text-xs text-gray-500 font-medium">{t('appSubtitle')}</p>
            </div>
          </div>

          {/* Language Switcher Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full bg-[#1d5fa8]/10 hover:bg-[#1d5fa8]/20 text-[#1d5fa8] transition-all font-semibold text-xs flex items-center gap-1.5 border border-[#1d5fa8]/20 shadow-xs cursor-pointer"
            title="Switch Language / ဘာသာစကား ပြောင်းရန်"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'မြန်မာ' : 'English'}</span>
          </button>
        </div>

        {/* Search Bar & Store Counter */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-semibold font-mono-meta bg-[#e2e2e5] text-gray-700 px-2.5 py-1 rounded-full">
            {stores.length} / {pagination?.totalCount ?? stores.length} {t('stores')}
          </span>
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full h-12 pl-12 pr-10 rounded-full bg-[#f9f9fc] border border-[#d1c6ab] text-sm text-[#1a1c1e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d5fa8] shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Device Location Tracker Card */}
      <div className="p-4 bg-[#f9f9fc] border-b border-[#e2e2e5]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              locationState.isTracking ? 'bg-[#1d5fa8] text-white shadow-md' : 'bg-[#e8e8ea] text-gray-600'
            }`}>
              <Locate className={`w-5 h-5 ${locationState.isTracking ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[#1a1c1e]">{t('deviceLocation')}</span>
                {locationState.isTracking && (
                  <span className="text-[10px] font-bold font-mono-meta text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {t('gpsActive')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                {locationState.isTracking
                  ? t('deviceLocationActive')
                  : t('deviceLocationInactive')}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleLocation}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              locationState.isTracking
                ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white'
                : 'bg-[#ffd200] hover:bg-[#ffe07c] text-[#1a1c1e]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {locationState.isTracking ? t('stopGps') : t('locateMe')}
          </button>
        </div>

        {/* Location Error Warning */}
        {locationState.error && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{locationState.error}</span>
          </div>
        )}

        {/* Radius Filter Slider */}
        <div className="mt-4 pt-3 border-t border-[#e2e2e5]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-medium text-gray-600">{t('searchRadiusFilter')}</span>
            <span className="font-bold font-mono-meta text-[#1d5fa8]">{radiusKm} {t('km')}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#e2e2e5] rounded-lg appearance-none cursor-pointer accent-[#1d5fa8]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-3 border-b border-[#e2e2e5] bg-white overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-[#1d5fa8] text-white shadow-sm'
                : 'bg-[#f3f3f6] text-gray-700 hover:bg-[#e2e2e5]'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => onSelectCategory(cat.category)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.category
                  ? 'bg-[#1d5fa8] text-white shadow-sm'
                  : 'bg-[#ebf2f8] text-[#1d5fa8] hover:bg-[#d0d7dd]'
              }`}
            >
              <span>{tCategory(cat.category)}</span>
              <span className="text-[10px] font-mono-meta bg-white/60 px-1.5 py-0.2 rounded-full">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Store Cards List (with Infinite Scroll onScroll handler) */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f9f9fc]"
      >
        {apiError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{t('apiErrorTitle')}</span>
            </div>
            <p className="text-[11px] text-red-600 leading-relaxed">{apiError}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-1 self-start px-3 py-1.5 bg-[#1d5fa8] hover:bg-[#00417e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('retryConnection')}
              </button>
            )}
          </div>
        )}

        {stores.length === 0 && !isLoading ? (
          <div className="py-12 text-center text-gray-500">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">{t('noStoresFound')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('noStoresSub')}</p>
          </div>
        ) : (
          stores.map((store) => {
            const isSelected = store.id === selectedStoreId;
            return (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#1d5fa8] ring-2 ring-[#7ab0ff] shadow-md'
                    : 'bg-white border-[#e2e2e5] hover:border-[#1d5fa8] hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ebf2f8] text-[#1d5fa8]">
                    {tCategory(store.category)}
                  </span>

                  {store.distanceKm !== null && (
                    <span className="text-xs font-bold font-mono-meta text-[#725c00] bg-[#ffe07c] px-2 py-0.5 rounded-md shadow-xs">
                      {store.distanceKm} {t('kmAway')}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[#1a1c1e] mb-1 group-hover:text-[#1d5fa8]">
                  {store.name}
                </h3>

                {store.address && (
                  <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{tAddress(store.address)}</span>
                  </p>
                )}

                <div className="flex items-center justify-between pt-2.5 border-t border-[#f3f3f6]">
                  <span className="text-[11px] font-mono-meta text-gray-400">
                    {t('lat')}: {store.latitude.toFixed(4)}, {t('lng')}: {store.longitude.toFixed(4)}
                  </span>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 bg-[#1d5fa8] hover:bg-[#00417e] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {t('directions')}
                  </a>
                </div>
              </div>
            );
          })
        )}

        {/* Loading More Indicator (Infinite Scroll Spinner) */}
        {isLoadingMore && (
          <div className="p-3 bg-white border border-[#e2e2e5] rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold text-[#1d5fa8] shadow-xs animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-[#1d5fa8]" />
            <span>{t('loadingMore')}</span>
          </div>
        )}

        {/* Caught Up / End of Feed Indicator */}
        {pagination && !pagination.hasNextPage && stores.length > 0 && (
          <div className="py-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#e2e2e5]/60 text-gray-600 text-xs font-medium font-mono-meta border border-[#d1c6ab]/40 shadow-2xs">
              <span className="text-emerald-600 font-bold">✓</span> {t('caughtUp')}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

