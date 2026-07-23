'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MapView from '../components/MapView';
import StoreDrawer from '../components/StoreDrawer';
import { useUserLocation } from '../hooks/useUserLocation';
import { StoreDto, CategorySummaryDto } from '../types/store';
import { fetchStores, searchStores, fetchNearbyStores, fetchCategoriesSummary } from '../services/api';
import { Compass, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const { locationState, startTracking, stopTracking, activeLocation } = useUserLocation();

  const [stores, setStores] = useState<StoreDto[]>([]);
  const [categories, setCategories] = useState<CategorySummaryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNearbyMode, setIsNearbyMode] = useState<boolean>(false);

  // Load initial Categories Summary
  useEffect(() => {
    async function loadCategories() {
      const res = await fetchCategoriesSummary();
      if (res.isSuccess && res.data) {
        setCategories(res.data);
      }
    }
    loadCategories();
  }, []);

  // Main Store Fetching Logic based on Location / Search / Category
  const loadStores = useCallback(async () => {
    setIsLoading(true);

    try {
      if (searchQuery.trim() !== '') {
        const res = await searchStores(searchQuery, selectedCategory || undefined);
        if (res.isSuccess && res.data) {
          setStores(res.data);
        }
      } else if (activeLocation.hasRealLocation || isNearbyMode) {
        const res = await fetchNearbyStores(
          activeLocation.latitude,
          activeLocation.longitude,
          radiusKm,
          selectedCategory || undefined
        );
        if (res.isSuccess && res.data) {
          setStores(res.data);
        }
      } else {
        const res = await fetchStores(selectedCategory || undefined);
        if (res.isSuccess && res.data) {
          setStores(res.data);
        }
      }
    } catch (err) {
      console.error('Error loading stores:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, activeLocation, isNearbyMode, radiusKm]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleToggleLocation = () => {
    if (locationState.isTracking) {
      stopTracking();
      setIsNearbyMode(false);
    } else {
      startTracking();
      setIsNearbyMode(true);
    }
  };

  return (
    <main className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#f9f9fc]">
      {/* Top Mobile Status Header */}
      <div className="lg:hidden p-3 bg-[#1d5fa8] text-white flex items-center justify-between text-xs font-semibold shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#ffd200] text-[#1a1c1e] font-bold flex items-center justify-center text-xs">
            YPS
          </div>
          <span>YPS Store Finder</span>
        </div>

        <button
          onClick={handleToggleLocation}
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
            locationState.isTracking ? 'bg-[#ba1a1a] text-white' : 'bg-[#ffd200] text-[#1a1c1e]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          {locationState.isTracking ? 'GPS Active' : 'Locate Me'}
        </button>
      </div>

      {/* Side Store Drawer */}
      <StoreDrawer
        stores={stores}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        locationState={locationState}
        onToggleLocation={handleToggleLocation}
        selectedStoreId={selectedStoreId}
        onSelectStore={(store) => setSelectedStoreId(store.id)}
        isNearbyMode={isNearbyMode}
        onToggleNearbyMode={() => setIsNearbyMode(!isNearbyMode)}
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
            <span>Updating Stores...</span>
          </div>
        )}
      </section>
    </main>
  );
}
