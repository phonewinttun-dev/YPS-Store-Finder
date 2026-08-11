'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Bus,
  CreditCard,
  ChevronLeft,
  RefreshCw,
  Navigation,
  Footprints,
} from 'lucide-react';
import { fetchStoreById, fetchNearbyBusStopsForStore } from '../../../services/api';
import { StoreDto } from '../../../types/store';
import { StoreNearbyBusStopsDto } from '../../../types/bus';
import { useLanguage } from '../../../context/LanguageContext';

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, tCategory, tAddress, tStoreName, toMmNum } = useLanguage();

  const [store, setStore] = useState<StoreDto | null>(null);
  const [nearbyStops, setNearbyStops] = useState<StoreNearbyBusStopsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const storeId = Number(id);
        
        const [storeRes, stopsRes] = await Promise.all([
          fetchStoreById(storeId),
          fetchNearbyBusStopsForStore(storeId)
        ]);

        if (storeRes.isSuccess && storeRes.data) {
          setStore(storeRes.data);
        } else {
          setError(storeRes.message || 'Failed to fetch store details');
        }

        if (stopsRes.isSuccess && stopsRes.data) {
          setNearbyStops(stopsRes.data);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9fc] p-6 flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#725c00] mb-4" />
        <p className="text-gray-500">{t('updatingStores')}</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#f9f9fc] p-6 max-w-2xl mx-auto flex flex-col items-center pt-20">
        <Store className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-6">{error || t('noStoresFound')}</p>
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-[#d1c6ab] text-gray-800 text-xs font-bold rounded-lg px-3 py-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9fc] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header / Back */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 border border-[#d1c6ab] text-gray-800 text-xs font-bold rounded-lg px-3 py-1.5 shadow-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Store Detail Card */}
        <div className="bg-white border border-[#e2e2e5] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#fff9e6] text-[#725c00] border border-[#ffe07c] mb-2">
                {tCategory(store.category)}
              </span>
              <h1 className="font-extrabold text-lg text-[#1a1c1e]">
                {tStoreName(store.name)}
              </h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#fff9e6] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-[#725c00]" />
            </div>
          </div>

          {(store.address || store.description) && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              {store.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {tAddress(store.address)}
                  </p>
                </div>
              )}
              {store.description && (
                <div className="flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {store.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nearby Bus Stops Section */}
        {nearbyStops && nearbyStops.nearbyBusStops && nearbyStops.nearbyBusStops.length > 0 && (
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">
              <Bus className="w-4 h-4 text-[#725c00]" />
              {t('nearestBusStops')}
            </h2>
            
            <div className="grid gap-3">
              {nearbyStops.nearbyBusStops.map((stop, idx) => (
                <div key={idx} className="bg-white border border-[#e2e2e5] rounded-xl p-4 shadow-sm space-y-3 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#1a1c1e]">
                        {stop.stopName}
                      </h3>
                      {stop.roadTownship && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          {stop.roadTownship}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {stop.distanceMeters !== undefined && (
                        <span className="inline-flex items-center gap-1 font-mono-meta text-[10px] bg-[#ebf2f8] text-[#1d5fa8] px-2 py-0.5 rounded-md border border-[#7ab0ff]/30">
                          <Navigation className="w-3 h-3" />
                          {toMmNum(stop.distanceMeters)} {t('meters')}
                        </span>
                      )}
                      {stop.walkTimeMinutes !== undefined && stop.walkTimeMinutes > 0 && (
                        <span className="inline-flex items-center gap-1 font-mono-meta text-[10px] bg-[#fff9e6] text-[#725c00] px-2 py-0.5 rounded-md border border-[#ffe07c]">
                          <Footprints className="w-3 h-3" />
                          {toMmNum(stop.walkTimeMinutes)} min
                        </span>
                      )}
                    </div>
                  </div>

                  {stop.servicingBusNumbers && stop.servicingBusNumbers.length > 0 && (
                    <div className="pt-2 border-t border-gray-50 flex flex-wrap gap-1.5">
                      {Array.from(new Set(stop.servicingBusNumbers)).map((busNum, bIdx) => {
                        const isYps = stop.ypsSupportedBusNumbers?.includes(busNum);
                        return (
                          <Link
                            key={`${busNum}-${bIdx}`}
                            href={`/buses/${encodeURIComponent(busNum)}`}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                              isYps 
                                ? 'bg-[#fff9e6] text-[#725c00] border border-[#ffe07c] hover:bg-[#ffe07c]/50'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {toMmNum(busNum)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
