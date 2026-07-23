'use client';

import React from 'react';
import { StoreDto, CategorySummaryDto, UserLocationState } from '../types/store';
import { Search, Navigation, Locate, MapPin, Compass, AlertCircle, X } from 'lucide-react';

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
}: StoreDrawerProps) {
  return (
    <aside className="w-full lg:w-[420px] bg-white border-r border-[#e2e2e5] flex flex-col h-full shadow-lg shrink-0 overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 border-b border-[#e2e2e5] bg-gradient-to-br from-[#ffffff] to-[#ebf2f8]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ffd200] flex items-center justify-center text-[#1a1c1e] shadow-sm font-bold text-lg">
              YPS
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1a1c1e] leading-tight">YPS Store Finder</h1>
              <p className="text-xs text-gray-500 font-medium">Yangon Transit & Service Locator</p>
            </div>
          </div>

          <span className="text-[11px] font-semibold font-mono-meta bg-[#e2e2e5] text-gray-700 px-2.5 py-1 rounded-full">
            {stores.length} {stores.length === 1 ? 'Store' : 'Stores'}
          </span>
        </div>

        {/* Search Bar - 56px Pill Styled */}
        <div className="relative mt-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stores, kiosks, or addresses..."
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
                <span className="font-semibold text-xs text-[#1a1c1e]">Device Location</span>
                {locationState.isTracking && (
                  <span className="text-[10px] font-bold font-mono-meta text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                {locationState.isTracking
                  ? 'Tracking live coordinates'
                  : 'Turn on GPS to find nearest stores'}
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
            {locationState.isTracking ? 'Stop GPS' : 'Locate Me'}
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
            <span className="font-medium text-gray-600">Search Radius Filter</span>
            <span className="font-bold font-mono-meta text-[#1d5fa8]">{radiusKm} km</span>
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
            All Categories
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
              <span>{cat.category}</span>
              <span className="text-[10px] font-mono-meta bg-white/60 px-1.5 py-0.2 rounded-full">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Store Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f9f9fc]">
        {stores.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No stores found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or radius filter.</p>
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
                    {store.category}
                  </span>

                  {store.distanceKm !== null && (
                    <span className="text-xs font-bold font-mono-meta text-[#725c00] bg-[#ffe07c] px-2 py-0.5 rounded-md shadow-xs">
                      {store.distanceKm} km away
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[#1a1c1e] mb-1 group-hover:text-[#1d5fa8]">
                  {store.name}
                </h3>

                {store.address && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-3 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </p>
                )}

                <div className="flex items-center justify-between pt-2.5 border-t border-[#f3f3f6]">
                  <span className="text-[11px] font-mono-meta text-gray-400">
                    Lat: {store.latitude.toFixed(4)}, Lng: {store.longitude.toFixed(4)}
                  </span>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 bg-[#1d5fa8] hover:bg-[#00417e] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
