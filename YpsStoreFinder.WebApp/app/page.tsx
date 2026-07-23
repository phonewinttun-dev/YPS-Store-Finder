'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MapView from '../components/MapView';
import StoreDrawer from '../components/StoreDrawer';
import { useUserLocation } from '../hooks/useUserLocation';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';
import { StoreDto, CategorySummaryDto, PaginationDto } from '../types/store';
import { fetchStores, searchStores, fetchNearbyStores, fetchCategoriesSummary } from '../services/api';
import { Compass, RefreshCw, Globe } from 'lucide-react';

export default function HomePage() {
  const { locationState, startTracking, stopTracking, activeLocation } = useUserLocation();
  const { language, toggleLanguage, t } = useLanguage();

  const [stores, setStores] = useState<StoreDto[]>([]);
  const [categories, setCategories] = useState<CategorySummaryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNearbyMode, setIsNearbyMode] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Pagination State
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);

  // Debounce search query and radius slider to prevent repetitive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedRadiusKm = useDebounce(radiusKm, 300);

  const { latitude, longitude, hasRealLocation } = activeLocation;

  // Reset to page 1 whenever category, search, or radius filter changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchQuery, selectedCategory, debouncedRadiusKm, isNearbyMode]);

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

  // Main Store Fetching Logic based on Location / Search / Category / Pagination
  const loadStores = useCallback(async () => {
    setIsLoading(true);

    try {
      let res;
      if (debouncedSearchQuery.trim() !== '') {
        res = await searchStores(
          debouncedSearchQuery,
          selectedCategory || undefined,
          pageNumber,
          pageSize
        );
      } else if (hasRealLocation || isNearbyMode) {
        res = await fetchNearbyStores(
          latitude,
          longitude,
          debouncedRadiusKm,
          selectedCategory || undefined,
          pageNumber,
          pageSize
        );
      } else {
        res = await fetchStores(
          selectedCategory || undefined,
          pageNumber,
          pageSize
        );
      }

      if (res.isSuccess && res.data) {
        setStores(res.data);
        setPagination(res.pagination);
        setApiError(null);
      } else {
        setStores([]);
        setPagination(null);
        setApiError(res.message || 'Failed to connect to YPS Store Finder API.');
      }
    } catch (err: any) {
      console.error('Error loading stores:', err);
      setStores([]);
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
    latitude,
    longitude,
    debouncedRadiusKm,
    pageNumber,
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
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setPageNumber(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPageNumber(1);
  };

  const handleRadiusChange = (radius: number) => {
    setRadiusKm(radius);
    setPageNumber(1);
  };

  return (
    <main className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#f9f9fc]">
      {/* Top Mobile Status Header */}
      <div className="lg:hidden p-3 bg-[#1d5fa8] text-white flex items-center justify-between text-xs font-semibold shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#ffd200] text-[#1a1c1e] font-bold flex items-center justify-center text-xs">
            YPS
          </div>
          <span className="truncate max-w-[140px]">{t('appTitle')}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher Button for Mobile */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium text-xs flex items-center gap-1 transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'my' ? 'မြန်မာ' : 'English'}</span>
          </button>

          <button
            onClick={handleToggleLocation}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
              locationState.isTracking ? 'bg-[#ba1a1a] text-white' : 'bg-[#ffd200] text-[#1a1c1e]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {locationState.isTracking ? t('gpsActive') : t('locateMe')}
          </button>
        </div>
      </div>

      {/* Side Store Drawer */}
      <StoreDrawer
        stores={stores}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        radiusKm={radiusKm}
        onRadiusChange={handleRadiusChange}
        locationState={locationState}
        onToggleLocation={handleToggleLocation}
        selectedStoreId={selectedStoreId}
        onSelectStore={(store) => setSelectedStoreId(store.id)}
        isNearbyMode={isNearbyMode}
        onToggleNearbyMode={() => setIsNearbyMode(!isNearbyMode)}
        apiError={apiError}
        onRetry={handleRetry}
        pagination={pagination}
        pageNumber={pageNumber}
        onPageChange={setPageNumber}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNumber(1);
        }}
      />

      {/* Main Map View Area */}
      <section className="flex-1 h-full relative">
        <MapView
          stores={stores}
          userLocation={activeLocation}
          radiusKm={radiusKm}
          selectedStoreId={selectedStoreId}
          onSelectStore={(store) => setSelectedStoreId(store.id)}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute top-4 right-4 z-[500] bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-[#e2e2e5] flex items-center gap-2 text-xs font-medium text-[#1d5fa8]">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('updatingStores')}</span>
          </div>
        )}
      </section>
    </main>
  );
}
