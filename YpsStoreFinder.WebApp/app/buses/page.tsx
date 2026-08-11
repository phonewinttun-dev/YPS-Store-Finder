'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BusLineDto } from '../../types/bus';
import { fetchBusLines } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Bus, CreditCard, ChevronRight, X, RefreshCw, MapPin, ChevronLeft } from 'lucide-react';

const BATCH_SIZE = 20;

export default function BusesPage() {
  const { t, toMmNum } = useLanguage();

  const [allBusLines, setAllBusLines] = useState<BusLineDto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterYpsOnly, setFilterYpsOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);

  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Initial fetch of all YBS bus lines (like GetStoresAsync)
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchBusLines();
        if (isMounted && res.isSuccess && res.data) {
          setAllBusLines(res.data);
        }
      } catch (err) {
        console.error('Error loading YBS bus lines:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter bus lines based on search query and YPS card filter
  const filteredBusLines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allBusLines.filter((bus) => {
      if (filterYpsOnly && !bus.isYpsSupported) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        bus.busNumber?.toLowerCase().includes(query) ||
        bus.outboundTitle?.toLowerCase().includes(query) ||
        bus.returnTitle?.toLowerCase().includes(query)
      );
    });
  }, [allBusLines, searchQuery, filterYpsOnly]);

  // Reset visible items count whenever search query or YPS filter changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, filterYpsOnly]);

  const displayedBusLines = useMemo(() => {
    return filteredBusLines.slice(0, visibleCount);
  }, [filteredBusLines, visibleCount]);

  const hasMore = visibleCount < filteredBusLines.length;

  const loadMoreItems = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredBusLines.length));
    }
  }, [hasMore, filteredBusLines.length]);

  // IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoading, loadMoreItems]);

  return (
    <div className="min-h-screen bg-[#f9f9fc]">
      {/* Header Banner - glass-panel */}
      <div className="sticky top-0 z-10 glass-panel bg-white/88 backdrop-blur-[20px] border-b border-[#e2e2e5] shadow-sm">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center gap-3 mb-3">
            <Link 
              href="/"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <h1 className="text-lg font-extrabold text-gray-800">{t('ybsBusLines')}</h1>
          </div>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="YBS ယာဉ်လိုင်းနံပါတ် သို့မဟုတ် လမ်းကြောင်း ရှာရန်..."
              className="w-full h-11 pl-11 pr-9 rounded-full bg-white border border-[#e2e2e5] hover:border-gray-300 text-xs text-[#1a1c1e] placeholder-gray-400 outline-none focus:outline-none focus:ring-0 focus:border-gray-300 shadow-sm shadow-slate-200/50 focus:shadow-md focus:shadow-slate-200/80 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Combined Filter Buttons Bar (All Bus Lines & YPS Only) */}
          <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-1 px-0.5">
            <button
              onClick={() => setFilterYpsOnly(false)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                !filterYpsOnly
                  ? 'bg-[#725c00] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t('allBusLines')}
            </button>

            <button
              onClick={() => setFilterYpsOnly(true)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                filterYpsOnly
                  ? 'bg-[#725c00] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('ypsOnlyLines')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto p-4 sm:p-5 space-y-4 pb-12">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#725c00]">
            <RefreshCw className="w-8 h-8 animate-spin mb-3" />
            <span className="text-sm font-semibold">
              YBS ယာဉ်လိုင်းများ ရှာဖွေနေသည်...
            </span>
          </div>
        ) : displayedBusLines.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-[#e2e2e5] shadow-sm">
            <Bus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-sm">
              YBS ယာဉ်လိုင်း မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          <>
            {displayedBusLines.map((bus) => (
              <Link
                href={`/buses/${encodeURIComponent(bus.busNumber)}`}
                key={bus.busNumber}
                className="block p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e2e5] hover:border-[#ffe07c] shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* YPS Supported Badge */}
                    {bus.isYpsSupported ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200/80 whitespace-nowrap shrink-0 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                        <span>{t('ypsCardAccepted')}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200/60 whitespace-nowrap shrink-0 flex items-center gap-1">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                        <span>YPS ကဒ် အသုံးပြု၍မရနိုင်ပါ</span>
                      </span>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#725c00] transition-colors shrink-0" />
                </div>

                {/* Title */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#fff9e6] flex items-center justify-center shrink-0 border border-[#ffe07c]">
                    <Bus className="w-4 h-4 text-[#725c00]" />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-800 truncate leading-snug">
                    YBS <span className="font-mono-meta">{toMmNum(bus.busNumber)}</span>
                  </h3>
                </div>

                {bus.outboundTitle && (
                  <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4 flex items-start gap-2 pl-1">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="truncate">{bus.outboundTitle}</span>
                  </p>
                )}

                {/* Dual Route Buttons */}
                <div className="pt-3 border-t border-[#f3f3f6] flex items-center gap-3">
                  <span className="flex-1 h-10 bg-[#725c00] text-white shadow-md text-xs font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all">
                    <span className="inline-flex items-center justify-center gap-1">
                      အသွား <span className="font-mono-meta px-1.5 py-0.5 bg-white/20 rounded-md">({toMmNum(bus.outboundTotalStops)})</span>
                    </span>
                  </span>

                  <span className="flex-1 h-10 bg-white text-gray-700 border border-gray-200 shadow-sm text-xs font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all">
                    <span className="inline-flex items-center justify-center gap-1">
                      အပြန် <span className="font-mono-meta px-1.5 py-0.5 bg-gray-100 rounded-md">({toMmNum(bus.returnTotalStops)})</span>
                    </span>
                  </span>
                </div>
              </Link>
            ))}

            {/* Sentinel element for infinite scroll */}
            {hasMore && (
              <div ref={observerTargetRef} className="py-6 flex justify-center items-center text-[#725c00]">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                <span className="text-xs font-bold">နောက်ထပ် ယာဉ်လိုင်းများ ဆွဲယူနေသည်...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

