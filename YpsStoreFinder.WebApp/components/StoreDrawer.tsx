'use client';

import React, { useState } from 'react';
import { StoreDto, CategorySummaryDto, UserLocationState, PaginationDto } from '../types/store';
import { StoreNearbyBusStopsDto } from '../types/bus';
import YbsBusLinesView from './YbsBusLinesView';
import { fetchNearbyBusStopsForStore } from '../services/api';
import { Search, Navigation, Locate, MapPin, Compass, AlertCircle, X, RefreshCw, Globe, Bus, Route, CreditCard, CheckCircle2, Layers, Store } from 'lucide-react';
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
  const { language, toggleLanguage, t, tCategory, tAddress, tStoreName } = useLanguage();

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
    <aside className="w-full lg:w-[420px] bg-white border-r border-[#e2e2e5] flex flex-col flex-1 min-h-0 shadow-lg shrink-0 overflow-hidden">
      {/* Top Navigation Switcher Bar - Sliding Pill Indicator Transition */}
      <div className="px-3.5 pt-3 pb-1 bg-[#f9f9fc] shrink-0">
        <div className="relative flex items-center p-1 bg-gray-200/70 rounded-2xl w-full select-none">
          {/* Sliding Background Active Pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${
              activeSidebarTab === 'stores' ? 'left-1' : 'left-[calc(50%+2px)]'
            }`}
          />

          <button
            onClick={() => setActiveSidebarTab('stores')}
            className={`relative z-10 flex-1 h-9 text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer ${
              activeSidebarTab === 'stores' ? 'text-[#1a1c1e]' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className={`w-4 h-4 transition-all duration-300 ${activeSidebarTab === 'stores' ? 'text-[#725c00] scale-110' : 'text-gray-400'}`} />
            <span>Stores</span>
          </button>

          <button
            onClick={() => setActiveSidebarTab('buses')}
            className={`relative z-10 flex-1 h-9 text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer ${
              activeSidebarTab === 'buses' ? 'text-[#1a1c1e]' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bus className={`w-4 h-4 transition-all duration-300 ${activeSidebarTab === 'buses' ? 'text-[#725c00] scale-110' : 'text-gray-400'}`} />
            <span>YBS Bus Lines</span>
          </button>
        </div>
      </div>

      {activeSidebarTab === 'buses' ? (
        <YbsBusLinesView />
      ) : (
        <>
          {/* Header Banner - Clean Search & Filter Buttons Container */}
          <div className="px-3.5 pt-2 pb-3.5 border-b border-[#e2e2e5] bg-[#f9f9fc]">
            {/* Search Bar Input */}
            <div className="relative mb-2.5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-11 pl-11 pr-10 rounded-full bg-white border border-[#e2e2e5] hover:border-gray-300 text-xs text-[#1a1c1e] placeholder-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-gray-300 shadow-sm shadow-slate-200/50 focus:shadow-md focus:shadow-slate-200/80 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Combined Filter Buttons Bar (All Categories, Nearby 2km, and Category Pills) */}
            <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-2.5 pt-1 px-0.5">
              {/* 1. All Categories Button */}
              <button
                onClick={() => {
                  onSelectCategory(null);
                  if (!isShowAllStoresMode) onToggleShowAllStores();
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === null && isShowAllStoresMode
                    ? 'bg-[#725c00] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t('allCategories')}
              </button>

              {/* 2. Single Nearby (2km) Button - Styled exactly like filter buttons */}
              <button
                onClick={() => {
                  if (isShowAllStoresMode || !locationState.isTracking) {
                    onToggleLocation();
                  } else {
                    onToggleShowAllStores();
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  locationState.isTracking && !isShowAllStoresMode
                    ? 'bg-[#725c00] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${locationState.isTracking ? 'animate-spin' : ''}`} />
                <span>
                  {language === 'my' ? 'အနီးဆုံး (2km)' : 'Nearby (2km)'}
                </span>
              </button>

              {/* 3. Category Filter Buttons */}
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => onSelectCategory(cat.category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedCategory === cat.category
                      ? 'bg-[#725c00] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{tCategory(cat.category)}</span>
                  <span className={`text-[10px] font-mono-meta px-1.5 py-0.2 rounded-full transition-colors ${
                    selectedCategory === cat.category
                      ? 'bg-white/25 text-white border border-white/40 font-extrabold'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Location Error Warning */}
            {locationState.error && (
              <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{t(locationState.error)}</span>
              </div>
            )}
          </div>

          {/* Store Cards List */}
          <div
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar scrollable-panel p-4 sm:p-5 pb-24 sm:pb-28 space-y-4 bg-[#f9f9fc]"
          >
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{t('apiErrorTitle')}</span>
                </div>
                <p className="text-[11px] text-red-600 leading-relaxed">{apiError}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="mt-1 self-start px-3 py-1.5 bg-[#725c00] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm outline-none"
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
                    className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 outline-none ${
                      isSelected
                        ? 'bg-white border border-gray-300 shadow-sm'
                        : 'bg-white border border-[#e2e2e5] hover:border-gray-300 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Small Soft Gray Category Badge */}
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200/80 whitespace-nowrap shrink-0">
                          {tCategory(store.category)}
                        </span>

                        {store.distanceKm !== null && (
                          <span className="text-[10px] font-extrabold font-mono-meta text-[#725c00] bg-[#fff9e6] px-2 py-0.5 rounded-md border border-[#ffe07c] whitespace-nowrap shrink-0">
                            {store.distanceKm}km
                          </span>
                        )}
                      </div>

                      {/* Labeled 'View Map' Text Pill Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStore(store);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer outline-none border whitespace-nowrap shrink-0 ${
                          isSelected
                            ? 'bg-[#725c00] text-white border-[#725c00] shadow-sm shadow-[#725c00]/20'
                            : 'bg-[#fff9e6] hover:bg-[#fff3cc] text-[#725c00] border-[#ffe07c] shadow-xs shadow-amber-500/10'
                        }`}
                        title={language === 'my' ? 'မြေပုံပေါ်တွင် ကြည့်မည်' : 'View on Map'}
                      >
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{language === 'my' ? 'မြေပုံ' : 'View Map'}</span>
                      </button>
                    </div>

                    {/* Store Title with Clean Inline Store Icon */}
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-5 h-5 text-[#725c00] shrink-0" />
                      <h3 className="font-bold text-base text-gray-700 truncate leading-snug">
                        {tStoreName(store.name)}
                      </h3>
                    </div>

                    {store.address && (
                      <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3 flex items-start gap-1.5 pl-0.5">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{tAddress(store.address)}</span>
                      </p>
                    )}

                    {store.nearestBusStops && store.nearestBusStops.length > 0 && (
                      <div className="mb-3.5 pl-0.5">
                        <p className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5 text-[#725c00]" />
                          <span>{language === 'my' ? 'အနီးဆုံး ဘတ်စ်ကားမှတ်တိုင်များ' : 'Nearest Bus Stops'}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {store.nearestBusStops.map((stop, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-[#fff9e6] text-[#725c00] border border-[#ffe07c]/80 shadow-xs"
                            >
                              {language === 'my' ? stop.mm : stop.en}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons Container */}
                    <div className="flex items-center gap-2 pt-3.5 border-t border-[#f3f3f6]">
                      {/* Button 1: Show Direction (လမ်းကြောင်း) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowDirection(store);
                        }}
                        className="flex-1 h-9 px-2.5 bg-[#725c00] hover:bg-[#564500] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#725c00]/20 hover:shadow-lg hover:shadow-[#725c00]/25 cursor-pointer outline-none active:scale-[0.98] whitespace-nowrap"
                        title={language === 'my' ? 'လမ်းကြောင်း' : 'Show Direction'}
                      >
                        <Route className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">{language === 'my' ? 'လမ်းကြောင်း' : 'Show Direction'}</span>
                      </button>

                      {/* Button 2: Show Bus Lines (ကားလိုင်းများ) */}
                      <button
                        onClick={(e) => handleToggleBusLines(e, store)}
                        className={`flex-1 h-9 px-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border outline-none active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                          busData
                            ? 'bg-[#fff9e6] text-[#725c00] border-[#ffe07c] shadow-sm shadow-[#ffe07c]/50'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm shadow-gray-200/60 hover:shadow-md hover:shadow-gray-200/80'
                        }`}
                        title={language === 'my' ? 'ကားလိုင်းများ' : 'Show Bus Lines'}
                      >
                        <Bus className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">{language === 'my' ? 'ကားလိုင်းများ' : 'Show Bus Lines'}</span>
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
