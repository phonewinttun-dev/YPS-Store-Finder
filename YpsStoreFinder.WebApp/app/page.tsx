'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppShell, { type SheetSnap } from '../components/AppShell';
import GpsPermissionDialog from '../components/GpsPermissionDialog';
import MapView from '../components/MapView';
import StoreDrawer from '../components/StoreDrawer';
import TacticalStatusStrip from '../components/TacticalStatusStrip';
import { useLanguage } from '../context/LanguageContext';
import { useDebounce } from '../hooks/useDebounce';
import {
  useCategoriesSummary,
  useNearbyStores,
  useSearchStores,
  useStores,
} from '../hooks/useStoreQueries';
import { useUserLocation } from '../hooks/useUserLocation';
import { fetchNearbyStores, searchStores } from '../services/api';
import { distanceBetweenKm } from '../services/routing';
import { PaginationDto, StoreDto } from '../types/store';

function HomeExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const view = requestedView === 'stores' ? 'stores' : 'map';
  const { locationState, startTracking, stopTracking, activeLocation } = useUserLocation();
  const { t } = useLanguage();

  const [stores, setStores] = useState<StoreDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [activeDirectionStoreId, setActiveDirectionStoreId] = useState<number | null>(null);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [isShowAllStoresMode, setIsShowAllStoresMode] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showGpsModal, setShowGpsModal] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>(view === 'stores' ? 'mid' : 'peek');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const autoNearestKeyRef = useRef<string | null>(null);

  const radiusKm = 2;
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { latitude, longitude, hasRealLocation } = activeLocation;

  useEffect(() => {
    if (requestedView && requestedView !== 'map' && requestedView !== 'stores') {
      router.replace('/?view=map', { scroll: false });
    }
  }, [requestedView, router]);

  const { data: categoriesResponse, refetch: refetchCategories } = useCategoriesSummary();
  const categories = categoriesResponse?.isSuccess && categoriesResponse.data ? categoriesResponse.data : [];
  const isSearchActive = debouncedSearchQuery.trim() !== '';
  const isNearbyActive = (hasRealLocation || isNearbyMode) && !isShowAllStoresMode && !isSearchActive;
  const isShowAllActive = !isSearchActive && !isNearbyActive;

  const mapSearchQuery = useSearchStores(debouncedSearchQuery, selectedCategory, 1, 1000, isSearchActive);
  const mapNearbyQuery = useNearbyStores(latitude, longitude, radiusKm, 0.3, selectedCategory, 1, 1000, isNearbyActive);
  const mapAllStoresQuery = useStores(selectedCategory);
  const listSearchQuery = useSearchStores(debouncedSearchQuery, selectedCategory, pageNumber, pageSize, isSearchActive);
  const listNearbyQuery = useNearbyStores(latitude, longitude, radiusKm, 0.3, selectedCategory, pageNumber, pageSize, isNearbyActive);
  const listAllStoresQuery = useSearchStores('', selectedCategory, pageNumber, pageSize, isShowAllActive);

  const activeListQuery = isSearchActive ? listSearchQuery : isNearbyActive ? listNearbyQuery : listAllStoresQuery;
  const activeMapQuery = isSearchActive ? mapSearchQuery : isNearbyActive ? mapNearbyQuery : mapAllStoresQuery;
  const isLoading = activeListQuery.isLoading;
  const isSystemLoading = isLoading || activeMapQuery.isLoading;

  const allMapStores = useMemo(
    () => activeMapQuery.data?.isSuccess && activeMapQuery.data.data ? activeMapQuery.data.data : [],
    [activeMapQuery.data]
  );
  const fullStoreCatalog = useMemo(
    () => mapAllStoresQuery.data?.isSuccess && mapAllStoresQuery.data.data ? mapAllStoresQuery.data.data : [],
    [mapAllStoresQuery.data]
  );
  const nearestStore = useMemo(() => {
    if (!hasRealLocation || fullStoreCatalog.length === 0) return null;
    return fullStoreCatalog.reduce<StoreDto | null>((nearest, store) => {
      if (!Number.isFinite(store.latitude) || !Number.isFinite(store.longitude)) return nearest;
      if (!nearest) return store;
      return distanceBetweenKm(activeLocation, store) < distanceBetweenKm(activeLocation, nearest) ? store : nearest;
    }, null);
  }, [activeLocation, fullStoreCatalog, hasRealLocation]);
  const displayedMapStores = useMemo(() => {
    if (!nearestStore || allMapStores.some((store) => store.id === nearestStore.id)) return allMapStores;
    return [...allMapStores, nearestStore];
  }, [allMapStores, nearestStore]);

  /* eslint-disable react-hooks/set-state-in-effect -- A fresh GPS fix intentionally selects and opens the closest-store route comparison. */
  useEffect(() => {
    if (!hasRealLocation || !isNearbyActive || !nearestStore) return;
    const key = `${latitude.toFixed(4)}:${longitude.toFixed(4)}:${selectedCategory ?? 'all'}`;
    if (autoNearestKeyRef.current === key) return;
    autoNearestKeyRef.current = key;
    if (selectedStoreId !== null || activeDirectionStoreId !== null) return;
    setSelectedStoreId(nearestStore.id);
    setActiveDirectionStoreId(nearestStore.id);
    setSheetSnap('peek');
  }, [activeDirectionStoreId, hasRealLocation, isNearbyActive, latitude, longitude, nearestStore, selectedCategory, selectedStoreId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- Query results synchronize the accumulated infinite-scroll list. */
  useEffect(() => {
    const response = activeListQuery.data;
    if (!response) return;
    if (response.isSuccess && response.data) {
      setStores((current) => {
        if (pageNumber === 1) return response.data;
        const existing = new Set(current.map((store) => store.id));
        return [...current, ...response.data.filter((store) => !existing.has(store.id))];
      });
      setPagination(response.pagination ?? null);
      setApiError(null);
    } else {
      if (pageNumber === 1) setStores([]);
      setPagination(null);
      setApiError(response.message || 'Failed to connect to the YPS Store Finder API.');
    }
  }, [activeListQuery.data, pageNumber]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const loadMoreStores = useCallback(async () => {
    if (isLoadingMore || isLoading || !pagination?.hasNextPage) return;
    const nextPage = pageNumber + 1;
    setIsLoadingMore(true);
    try {
      const response = isSearchActive
        ? await searchStores(debouncedSearchQuery, selectedCategory || undefined, nextPage, pageSize)
        : isNearbyActive
          ? await fetchNearbyStores(latitude, longitude, radiusKm, 0.3, selectedCategory || undefined, nextPage, pageSize)
          : await searchStores('', selectedCategory || undefined, nextPage, pageSize);
      if (response.isSuccess && response.data) {
        setStores((current) => {
          const existing = new Set(current.map((store) => store.id));
          return [...current, ...response.data.filter((store) => !existing.has(store.id))];
        });
        setPagination(response.pagination);
        setPageNumber(nextPage);
      }
    } catch (error) {
      console.error('Error loading more stores:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [debouncedSearchQuery, isLoading, isLoadingMore, isNearbyActive, isSearchActive, latitude, longitude, pageNumber, pageSize, pagination, selectedCategory]);

  const handleToggleLocation = () => {
    setPageNumber(1);
    if (locationState.isTracking) {
      stopTracking();
      autoNearestKeyRef.current = null;
      setIsNearbyMode(false);
      setIsShowAllStoresMode(true);
    } else {
      autoNearestKeyRef.current = null;
      setSelectedStoreId(null);
      setActiveDirectionStoreId(null);
      startTracking();
      setIsNearbyMode(true);
      setIsShowAllStoresMode(false);
      setSheetSnap('peek');
      router.replace('/?view=map', { scroll: false });
    }
  };

  const handleSelectStore = (store: StoreDto) => {
    if (selectedStoreId === store.id) {
      setSelectedStoreId(null);
      setActiveDirectionStoreId(null);
      return;
    }
    setSelectedStoreId(store.id);
    setSheetSnap('mid');
  };

  const handleShowDirection = (store: StoreDto) => {
    if (activeDirectionStoreId === store.id) {
      setActiveDirectionStoreId(null);
      setSelectedStoreId(null);
      return;
    }
    setSelectedStoreId(store.id);
    setActiveDirectionStoreId(store.id);
    setSheetSnap('peek');
    if (!hasRealLocation) setShowGpsModal(true);
  };

  const effectiveSheetSnap: SheetSnap = selectedStoreId
    ? sheetSnap
    : view === 'stores'
      ? sheetSnap === 'full' ? 'full' : 'mid'
      : 'peek';

  const explorer = (
    <StoreDrawer
      stores={stores}
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={(category) => { setSelectedCategory(category); setPageNumber(1); }}
      searchQuery={searchQuery}
      onSearchChange={(query) => { setSearchQuery(query); setPageNumber(1); }}
      locationState={locationState}
      onToggleLocation={handleToggleLocation}
      selectedStoreId={selectedStoreId}
      onSelectStore={handleSelectStore}
      apiError={apiError}
      onRetry={() => { refetchCategories(); activeListQuery.refetch(); activeMapQuery.refetch(); }}
      pagination={pagination}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMoreStores}
      onShowDirection={handleShowDirection}
      isShowAllStoresMode={isShowAllStoresMode}
      onToggleShowAllStores={() => { setIsShowAllStoresMode((current) => !current); setPageNumber(1); }}
    />
  );

  return (
    <>
      <AppShell
        active={view}
        explorer={explorer}
        mobileSnap={effectiveSheetSnap}
        onMobileSnapChange={(next) => {
          setSheetSnap(next);
          const nextView = next === 'peek' ? 'map' : 'stores';
          if (!selectedStoreId && nextView !== view) router.replace(`/?view=${nextView}`, { scroll: false });
        }}
      >
        <section aria-label={t('map')} className="hud-map-stage relative h-full min-h-0 overflow-hidden" data-scanning={isSystemLoading ? 'true' : 'false'}>
          <MapView
            stores={displayedMapStores}
            userLocation={activeLocation}
            radiusKm={radiusKm}
            selectedStoreId={selectedStoreId}
            onSelectStore={handleSelectStore}
            onShowDirection={handleShowDirection}
            onCloseDirection={() => { setActiveDirectionStoreId(null); setSelectedStoreId(null); }}
            onRequestEnableGps={() => setShowGpsModal(true)}
            activeDirectionStoreId={activeDirectionStoreId}
            nearestStoreId={nearestStore?.id ?? null}
          />
          <div className="hud-map-chrome" aria-hidden="true">
            <span className="hud-corner hud-corner-tl" />
            <span className="hud-corner hud-corner-tr" />
            <span className="hud-corner hud-corner-bl" />
            <span className="hud-corner hud-corner-br" />
          </div>
          <TacticalStatusStrip
            isLoading={isSystemLoading}
            hasError={Boolean(apiError)}
            gpsActive={locationState.isTracking && hasRealLocation}
            visibleStoreCount={displayedMapStores.length}
            hasSelection={selectedStoreId !== null}
            hasActiveRoute={activeDirectionStoreId !== null}
          />
        </section>
      </AppShell>
      <GpsPermissionDialog
        open={showGpsModal}
        onClose={() => setShowGpsModal(false)}
        onConfirm={() => { setShowGpsModal(false); handleToggleLocation(); }}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="hud-boot-screen flex h-[100dvh] items-center justify-center bg-canvas text-brand"><RefreshCw className="h-7 w-7 animate-spin" /></div>}>
      <HomeExplorer />
    </Suspense>
  );
}
