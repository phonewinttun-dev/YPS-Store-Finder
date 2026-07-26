'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MapView from '../components/MapView';
import StoreDrawer from '../components/StoreDrawer';
import { useUserLocation } from '../hooks/useUserLocation';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';
import { StoreDto, CategorySummaryDto, PaginationDto } from '../types/store';
import { fetchStores, searchStores, fetchNearbyStores, fetchCategoriesSummary } from '../services/api';
import { Compass, RefreshCw, Globe, Map, List, Layers } from 'lucide-react';

export default function HomePage() {
  const { locationState, startTracking, stopTracking, activeLocation } = useUserLocation();
  const { language, toggleLanguage, t } = useLanguage();

  const [stores, setStores] = useState<StoreDto[]>([]);
  const [allMapStores, setAllMapStores] = useState<StoreDto[]>([]);
  const [categories, setCategories] = useState<CategorySummaryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [activeDirectionStoreId, setActiveDirectionStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNearbyMode, setIsNearbyMode] = useState<boolean>(false);
  const [isShowAllStoresMode, setIsShowAllStoresMode] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showGpsModal, setShowGpsModal] = useState<boolean>(false);

  // Mobile View Tab State ('map' or 'list')
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  // Pagination & Infinite Scroll State
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Fixed 2.0 km auto-radius for GPS nearby mode
  const radiusKm = 2.0;

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { latitude, longitude, hasRealLocation } = activeLocation;

  // Load Categories Summary
  const loadCategories = useCallback(async () => {
    const res = await fetchCategoriesSummary();
    if (res.isSuccess && res.data) {
      setCategories(res.data);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Main Store Fetching Logic
  const loadStores = useCallback(async () => {
    setIsLoading(true);
    setPageNumber(1);

    try {
      if (debouncedSearchQuery.trim() !== '') {
        const [mapRes, res] = await Promise.all([
          searchStores(debouncedSearchQuery, selectedCategory || undefined, 1, 1000),
          searchStores(debouncedSearchQuery, selectedCategory || undefined, 1, pageSize)
        ]);
        if (mapRes.isSuccess && mapRes.data) setAllMapStores(mapRes.data);
        if (res.isSuccess && res.data) {
          setStores(res.data);
          setPagination(res.pagination);
          setApiError(null);
        } else {
          setStores([]);
          setPagination(null);
          setApiError(res.message || 'Failed to connect to YPS Store Finder API.');
        }
      } else if ((hasRealLocation || isNearbyMode) && !isShowAllStoresMode) {
        // Automatic 2km Nearby Store Filter when GPS is active
        const [mapRes, res] = await Promise.all([
          fetchNearbyStores(latitude, longitude, radiusKm, 0.3, selectedCategory || undefined, 1, 1000),
          fetchNearbyStores(latitude, longitude, radiusKm, 0.3, selectedCategory || undefined, 1, pageSize),
        ]);
        if (mapRes.isSuccess && mapRes.data) setAllMapStores(mapRes.data);
        if (res.isSuccess && res.data) {
          setStores(res.data);
          setPagination(res.pagination);
          setApiError(null);
        } else {
          setStores([]);
          setPagination(null);
          setApiError(res.message || 'Failed to connect to YPS Store Finder API.');
        }
      } else {
        // Option 2: Show All Stores Mode (No GPS 2km restriction)
        const [mapRes, res] = await Promise.all([
          fetchStores(selectedCategory || undefined),
          searchStores('', selectedCategory || undefined, 1, pageSize),
        ]);
        if (mapRes.isSuccess && mapRes.data) setAllMapStores(mapRes.data);
        if (res.isSuccess && res.data) {
          setStores(res.data);
          setPagination(res.pagination);
          setApiError(null);
        } else {
          setStores([]);
          setPagination(null);
          setApiError(res.message || 'Failed to connect to YPS Store Finder API.');
        }
      }
    } catch (err: any) {
      console.error('Error loading stores:', err);
      setStores([]);
      setAllMapStores([]);
      setPagination(null);
      setApiError(err?.message || 'Error loading stores from server.');
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearchQuery,
    selectedCategory,
    hasRealLocation,
    isNearbyMode,
    isShowAllStoresMode,
    latitude,
    longitude,
    radiusKm,
    pageSize,
  ]);

  const loadMoreStores = useCallback(async () => {
    if (isLoadingMore || isLoading || !pagination?.hasNextPage) return;

    const nextPage = pageNumber + 1;
    setIsLoadingMore(true);

    try {
      if (debouncedSearchQuery.trim() !== '') {
        const res = await searchStores(
          debouncedSearchQuery,
          selectedCategory || undefined,
          nextPage,
          pageSize
        );
        if (res.isSuccess && res.data) {
          setStores((prev) => [...prev, ...res.data]);
          setPagination(res.pagination);
          setPageNumber(nextPage);
        }
      } else if ((hasRealLocation || isNearbyMode) && !isShowAllStoresMode) {
        const res = await fetchNearbyStores(
          latitude,
          longitude,
          radiusKm,
          0.3,
          selectedCategory || undefined,
          nextPage,
          pageSize
        );
        if (res.isSuccess && res.data) {
          setStores((prev) => [...prev, ...res.data]);
          setPagination(res.pagination);
          setPageNumber(nextPage);
        }
      } else {
        const res = await searchStores(
          '',
          selectedCategory || undefined,
          nextPage,
          pageSize
        );
        if (res.isSuccess && res.data) {
          setStores((prev) => [...prev, ...res.data]);
          setPagination(res.pagination);
          setPageNumber(nextPage);
        }
      }
    } catch (err) {
      console.error('Error loading more stores:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    isLoading,
    pagination,
    pageNumber,
    debouncedSearchQuery,
    selectedCategory,
    hasRealLocation,
    isNearbyMode,
    isShowAllStoresMode,
    latitude,
    longitude,
    radiusKm,
    pageSize,
  ]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleRetry = useCallback(() => {
    loadCategories();
    loadStores();
  }, [loadCategories, loadStores]);

  const handleToggleLocation = () => {
    if (locationState.isTracking) {
      stopTracking();
      setIsNearbyMode(false);
    } else {
      startTracking();
      setIsNearbyMode(true);
      setIsShowAllStoresMode(false); // Default to automatic 2km nearby stores
    }
  };

  const handleToggleShowAllStores = () => {
    setIsShowAllStoresMode((prev) => !prev);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectStore = (store: StoreDto) => {
    setSelectedStoreId(store.id);
    if (window.innerWidth < 1024) {
      setMobileTab('map');
    }
  };

  const handleShowDirection = (store: StoreDto) => {
    setSelectedStoreId(store.id);
    setActiveDirectionStoreId(store.id);

    if (!hasRealLocation) {
      setShowGpsModal(true);
    }

    if (window.innerWidth < 1024) {
      setMobileTab('map');
    }
  };

  return (
    <main className="flex flex-col lg:flex-row h-[100dvh] w-screen overflow-hidden bg-[#f9f9fc] relative">
      {/* Top Mobile Header Banner - YPS Gold Styling */}
      <div className="lg:hidden p-3 bg-[#ffd200] text-[#1a1c1e] flex items-center justify-between text-xs font-semibold shrink-0 gap-2 shadow-sm z-30 border-b border-[#e5bc00]">
        <div className="flex items-center gap-2">
          <img
            src="/yps_logo.jpg"
            alt="YPS Logo"
            className="w-7 h-7 rounded-lg object-cover shadow-xs border border-[#d1c6ab]"
          />
          <span className="truncate max-w-[150px] font-extrabold text-sm">{t('appTitle')}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-full bg-white hover:bg-gray-100 text-[#1a1c1e] font-bold text-xs flex items-center gap-1.5 transition-all border border-[#d1c6ab] cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'မြန်မာ' : 'English'}</span>
          </button>

          <button
            onClick={handleToggleLocation}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              locationState.isTracking ? 'bg-[#ba1a1a] text-white shadow-xs' : 'bg-[#725c00] text-white shadow-xs'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {locationState.isTracking ? t('gpsActive') : t('locateMe')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
        <div
          className={`w-full lg:w-[420px] h-full ${
            mobileTab === 'list' ? 'block' : 'hidden lg:block'
          }`}
        >
          <StoreDrawer
            stores={stores}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            locationState={locationState}
            onToggleLocation={handleToggleLocation}
            selectedStoreId={selectedStoreId}
            onSelectStore={handleSelectStore}
            isNearbyMode={isNearbyMode}
            onToggleNearbyMode={() => setIsNearbyMode(!isNearbyMode)}
            apiError={apiError}
            onRetry={handleRetry}
            pagination={pagination}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreStores}
            onShowDirection={handleShowDirection}
            isShowAllStoresMode={isShowAllStoresMode}
            onToggleShowAllStores={handleToggleShowAllStores}
          />
        </div>

        <section
          className={`flex-1 h-full relative ${
            mobileTab === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          <MapView
            stores={allMapStores}
            userLocation={activeLocation}
            radiusKm={radiusKm}
            selectedStoreId={selectedStoreId}
            onSelectStore={(store) => setSelectedStoreId(store.id)}
            onRequestEnableGps={() => setShowGpsModal(true)}
            activeDirectionStoreId={activeDirectionStoreId}
          />

          {isLoading && (
            <div className="absolute top-4 right-4 z-[500] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-[#ffe07c] flex items-center gap-2 text-xs font-bold text-[#725c00]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#725c00]" />
              <span>{t('updatingStores')}</span>
            </div>
          )}
        </section>
      </div>

      {/* Enable GPS Modal Dialog Prompt */}
      {showGpsModal && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#e2e2e5] animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-[#fff9e6] text-[#725c00] border border-[#ffe07c] flex items-center justify-center mb-4 mx-auto">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-center text-[#1a1c1e] mb-2">
              {t('enableGpsTitle')}
            </h3>
            <p className="text-xs text-center text-gray-600 mb-6 leading-relaxed">
              {t('enableGpsMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowGpsModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setShowGpsModal(false);
                  handleToggleLocation();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#ffd200] hover:bg-[#ffe07c] text-[#1a1c1e] border border-[#e5bc00] text-xs font-extrabold transition-all shadow-sm cursor-pointer"
              >
                {t('enableGpsBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Mobile Action Toggle Bar - YPS Gold Styling */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-[#d1c6ab] flex items-center gap-1">
        <button
          onClick={() => setMobileTab('map')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'map'
              ? 'bg-[#725c00] text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>{language === 'my' ? 'မြေပုံ' : 'Map View'}</span>
        </button>

        <button
          onClick={() => setMobileTab('list')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            mobileTab === 'list'
              ? 'bg-[#725c00] text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <List className="w-4 h-4" />
          <span>{language === 'my' ? 'ဆိုင်များ' : 'Stores'}</span>
        </button>
      </div>
    </main>
  );
}
