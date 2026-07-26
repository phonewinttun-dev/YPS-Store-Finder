'use client';

import React, { useState } from 'react';
import { StoreDto, CategorySummaryDto, UserLocationState, PaginationDto } from '../types/store';
import { StoreNearbyBusStopsDto } from '../types/bus';
import YbsBusLinesView from './YbsBusLinesView';
import { fetchNearbyBusStopsForStore } from '../services/api';
import { Search, Navigation, Locate, MapPin, Compass, AlertCircle, X, RefreshCw, Globe, Bus, Route, CreditCard, CheckCircle2, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
  isNearbyMode: boolean;
  onToggleNearbyMode: () => void;
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
  isNearbyMode,
  onToggleNearbyMode,
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
  const { language, toggleLanguage, t, tCategory, tAddress } = useLanguage();

  // Sidebar Tab Switcher State ('stores' | 'buses')
  const [activeSidebarTab, setActiveSidebarTab] = useState<'stores' | 'buses'>('stores');

  // Nearby Bus Lines State per Store
  const [expandedStoreBusInfo, setExpandedStoreBusInfo] = useState<Record<number, StoreNearbyBusStopsDto | null>>({});
  const [loadingBusInfo, setLoadingBusInfo] = useState<Record<number, boolean>>({});

  const handleToggleBusLines = async (e: React.MouseEvent, store: StoreDto) => {
    e.stopPropagation();

    if (expandedStoreBusInfo[store.id]) {
      setExpandedStoreBusInfo((prev) => {
        const copy = { ...prev };
        delete copy[store.id];
        return copy;
      });
      return;
    }

    setLoadingBusInfo((prev) => ({ ...prev, [store.id]: true }));
    try {
      const res = await fetchNearbyBusStopsForStore(store.id);
      if (res.isSuccess && res.data) {
        setExpandedStoreBusInfo((prev) => ({ ...prev, [store.id]: res.data }));
      }
    } catch (err) {
      console.error('Error fetching nearby bus stops:', err);
    } finally {
      setLoadingBusInfo((prev) => ({ ...prev, [store.id]: false }));
    }
  };

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
      {/* Top Navigation Switcher Bar - YPS Gold Header */}
      <div className="p-2 bg-[#ffd200] border-b border-[#e5bc00] flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-1 bg-black/10 p-1 rounded-xl w-full">
          <button
            onClick={() => setActiveSidebarTab('stores')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSidebarTab === 'stores'
                ? 'bg-white text-[#1a1c1e] shadow-sm border border-[#e5bc00]'
                : 'text-[#4d4632] hover:text-[#1a1c1e] hover:bg-white/40'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t('stores')}</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab('buses')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSidebarTab === 'buses'
                ? 'bg-white text-[#1a1c1e] shadow-sm border border-[#e5bc00]'
                : 'text-[#4d4632] hover:text-[#1a1c1e] hover:bg-white/40'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>{t('ybsBusLines')}</span>
          </button>
        </div>
      </div>

      {activeSidebarTab === 'buses' ? (
        <YbsBusLinesView />
      ) : (
        <>
          {/* Header Banner */}
          <div className="p-4 sm:p-5 border-b border-[#e2e2e5] bg-gradient-to-br from-[#ffffff] via-[#fff9e6] to-[#ffe07c]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/yps_logo.jpg"
                  alt="YPS Logo"
                  className="w-10 h-10 rounded-xl object-cover shadow-sm border border-[#d1c6ab]"
                />
                <div>
                  <h1 className="font-bold text-base sm:text-lg text-[#1a1c1e] leading-tight">{t('appTitle')}</h1>
                  <p className="text-xs text-gray-600 font-medium">{t('appSubtitle')}</p>
                </div>
              </div>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-full bg-[#ffd200] hover:bg-[#ffe07c] text-[#1a1c1e] transition-all font-bold text-xs flex items-center gap-1.5 border border-[#e5bc00] shadow-xs cursor-pointer"
                title="Switch Language / ဘာသာစကား ပြောင်းရန်"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'my' ? 'မြန်မာ' : 'English'}</span>
              </button>
            </div>

            {/* Store Counter & Mode Indicator */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold font-mono-meta bg-[#e2e2e5] text-gray-700 px-2.5 py-1 rounded-full">
                {stores.length} / {pagination?.totalCount ?? stores.length} {t('stores')}
              </span>

              {locationState.isTracking && !isShowAllStoresMode && (
                <span className="text-[10px] font-bold text-[#725c00] bg-[#ffe07c] px-2.5 py-1 rounded-full border border-[#e5bc00]">
                  2 km Nearby
                </span>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-12 pl-12 pr-10 rounded-full bg-white border border-[#d1c6ab] text-sm text-[#1a1c1e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#725c00] shadow-sm transition-all"
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

          {/* Device Location Tracker & Store Mode Options */}
          <div className="p-3.5 bg-[#f9f9fc] border-b border-[#e2e2e5] space-y-2.5">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  locationState.isTracking ? 'bg-[#ffd200] text-[#1a1c1e] shadow-xs' : 'bg-[#e8e8ea] text-gray-600'
                }`}>
                  <Locate className={`w-3.5 h-3.5 ${locationState.isTracking ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[11px] text-[#1a1c1e]">{t('deviceLocation')}</span>
                    {locationState.isTracking && (
                      <span className="text-[9px] font-bold font-mono-meta text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded">
                        {t('gpsActive')}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {locationState.isTracking
                      ? t('deviceLocationActive')
                      : t('deviceLocationInactive')}
                  </p>
                </div>
              </div>

              {/* Option 1: GPS Button */}
              <button
                onClick={onToggleLocation}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer ${
                  locationState.isTracking
                    ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white'
                    : 'bg-[#ffd200] hover:bg-[#ffe07c] text-[#1a1c1e] border border-[#e5bc00]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                {locationState.isTracking ? t('stopGps') : t('locateMe')}
              </button>
            </div>

            {/* Option 2: "Show all stores" ("ဆိုင်အားလုံးကိုကြည့်မယ်") Button */}
            <div className="pt-2 border-t border-[#e2e2e5]">
              <button
                onClick={onToggleShowAllStores}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                  isShowAllStoresMode
                    ? 'bg-[#725c00] text-white border-[#725c00] shadow-sm'
                    : 'bg-[#fff9e6] hover:bg-[#ffe07c]/60 text-[#725c00] border-[#ffe07c]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('showAllStores')}</span>
              </button>
            </div>

            {/* Location Error Warning */}
            {locationState.error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{t(locationState.error)}</span>
              </div>
            )}
          </div>

          {/* Category Pills */}
          <div className="px-4 py-3 border-b border-[#e2e2e5] bg-white overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              <button
                onClick={() => onSelectCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-[#725c00] text-white shadow-sm'
                    : 'bg-[#f3f3f6] text-gray-700 hover:bg-[#e2e2e5]'
                }`}
              >
                {t('allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => onSelectCategory(cat.category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedCategory === cat.category
                      ? 'bg-[#725c00] text-white shadow-sm'
                      : 'bg-[#fff9e6] text-[#725c00] border border-[#ffe07c] hover:bg-[#ffe07c]/50'
                  }`}
                >
                  <span>{tCategory(cat.category)}</span>
                  <span className="text-[10px] font-mono-meta bg-white/80 px-1.5 py-0.2 rounded-full border">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Store Cards List */}
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
                    className="mt-1 self-start px-3 py-1.5 bg-[#725c00] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
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
                const busData = expandedStoreBusInfo[store.id];
                const isBusLoading = loadingBusInfo[store.id];

                return (
                  <div
                    key={store.id}
                    onClick={() => onSelectStore(store)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#725c00] ring-2 ring-[#ffd200] shadow-md'
                        : 'bg-white border-[#e2e2e5] hover:border-[#ffd200] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fff9e6] text-[#725c00] border border-[#ffe07c]">
                        {tCategory(store.category)}
                      </span>

                      {store.distanceKm !== null && (
                        <span className="text-xs font-extrabold font-mono-meta text-[#725c00] bg-[#ffd200] px-2.5 py-0.5 rounded-md shadow-2xs border border-[#e5bc00]">
                          {store.distanceKm} {t('kmAway')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-[#1a1c1e] mb-1 group-hover:text-[#725c00]">
                      {store.name}
                    </h3>

                    {store.address && (
                      <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{tAddress(store.address)}</span>
                      </p>
                    )}

                    {/* Action Buttons Container */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-[#f3f3f6]">
                      {/* Button 1: Show Direction (လမ်းကြောင်းကြည့်ရန်) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowDirection(store);
                        }}
                        className="flex-1 py-2 px-3 bg-[#725c00] hover:bg-[#564500] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title={t('showDirection')}
                      >
                        <Route className="w-3.5 h-3.5" />
                        <span>{t('showDirection')}</span>
                      </button>

                      {/* Button 2: Show Bus Lines (ရောက်နိုင်သော ယာဉ်လိုင်းများကြည့်ရန်) */}
                      <button
                        onClick={(e) => handleToggleBusLines(e, store)}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border shadow-2xs cursor-pointer ${
                          busData
                            ? 'bg-[#ffd200] text-[#1a1c1e] border-[#e5bc00]'
                            : 'bg-[#fff9e6] hover:bg-[#ffe07c] text-[#725c00] border-[#ffe07c]'
                        }`}
                        title={t('showBusLines')}
                      >
                        <Bus className="w-3.5 h-3.5" />
                        <span>{t('showBusLines')}</span>
                      </button>
                    </div>

                    {/* Nearby Bus Lines Expandable View */}
                    {isBusLoading && (
                      <div className="mt-3 p-3 bg-[#fff9e6] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-[#725c00]">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#725c00]" />
                        <span>{language === 'my' ? 'ယာဉ်လိုင်းများ ရှာဖွေနေသည်...' : 'Finding nearby bus lines...'}</span>
                      </div>
                    )}

                    {busData && !isBusLoading && (
                      <div className="mt-3 p-3 bg-[#fff9e6]/70 border border-[#ffe07c] rounded-xl text-xs space-y-2.5 animate-in fade-in duration-200">
                        <h4 className="font-bold text-[#725c00] text-[11px] uppercase tracking-wider flex items-center justify-between">
                          <span>{t('nearbyBusStops')}</span>
                          <span className="text-[10px] font-mono-meta bg-white px-1.5 py-0.2 rounded border border-[#ffe07c] font-bold">
                            {busData.nearbyBusStops.length} STOPS
                          </span>
                        </h4>

                        {busData.nearbyBusStops.length === 0 ? (
                          <p className="text-[11px] text-gray-600 italic">
                            {language === 'my' ? 'အနီးတွင် တိုက်ရိုက် ကားမှတ်တိုင် မတွေ့ရှိပါ' : 'No direct bus stops found near this store address.'}
                          </p>
                        ) : (
                          busData.nearbyBusStops.map((stop, sIdx) => (
                            <div key={sIdx} className="p-2.5 bg-white border border-[#ffe07c] rounded-lg shadow-2xs">
                              <div className="flex items-center justify-between font-bold text-[#1a1c1e] text-xs">
                                <span>{stop.stopName}</span>
                                {stop.roadTownship && (
                                  <span className="text-[10px] text-gray-500 font-medium">{stop.roadTownship}</span>
                                )}
                              </div>

                              <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] text-gray-500 font-semibold">{t('servicingLines')}:</span>
                                {stop.servicingBusNumbers.map((busNum) => {
                                  const isYps = stop.ypsSupportedBusNumbers.includes(busNum);
                                  return (
                                    <span
                                      key={busNum}
                                      className={`text-[10px] font-mono-meta font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                                        isYps
                                          ? 'bg-[#ffd200] text-[#1a1c1e] border border-[#e5bc00]'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      YBS {busNum}
                                      {isYps && <CheckCircle2 className="w-2.5 h-2.5 text-[#725c00] inline" />}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="mt-2 text-right">
                      <span className="text-[10px] font-mono-meta text-gray-400">
                        {t('lat')}: {store.latitude.toFixed(4)}, {t('lng')}: {store.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="p-3 bg-white border border-[#ffe07c] rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold text-[#725c00] shadow-xs animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-[#725c00]" />
                <span>{t('loadingMore')}</span>
              </div>
            )}

            {/* End of Feed Indicator */}
            {pagination && !pagination.hasNextPage && stores.length > 0 && (
              <div className="py-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fff9e6] text-[#725c00] text-xs font-bold font-mono-meta border border-[#ffe07c] shadow-2xs">
                  <span className="text-[#725c00] font-bold">✓</span> {t('caughtUp')}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
