'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BusLineDto, BusRouteDetailDto } from '../types/bus';
import { fetchBusLines, fetchYpsBusLines, fetchBusRouteDetail } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Search, Bus, CreditCard, ChevronRight, ArrowLeftRight, MapPin, RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface YbsBusLinesViewProps {
  onSelectBusLineRoute?: (routeDetail: BusRouteDetailDto) => void;
}

export default function YbsBusLinesView({ onSelectBusLineRoute }: YbsBusLinesViewProps) {
  const { t, language } = useLanguage();

  const [busLines, setBusLines] = useState<BusLineDto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterYpsOnly, setFilterYpsOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBusNumber, setSelectedBusNumber] = useState<string | null>(null);
  const [routeDetail, setRouteDetail] = useState<BusRouteDetailDto | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [activeRouteTab, setActiveRouteTab] = useState<'outbound' | 'return'>('outbound');

  const loadBusLines = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = filterYpsOnly
        ? await fetchYpsBusLines(searchQuery, 1, 50)
        : await fetchBusLines(searchQuery, 1, 50);

      if (res.isSuccess && res.data) {
        setBusLines(res.data);
      } else {
        setBusLines([]);
      }
    } catch (err) {
      console.error('Error loading YBS bus lines:', err);
      setBusLines([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filterYpsOnly]);

  useEffect(() => {
    loadBusLines();
  }, [loadBusLines]);

  const handleSelectBusLine = async (busNumber: string) => {
    setSelectedBusNumber(busNumber);
    setIsLoadingRoute(true);
    try {
      const res = await fetchBusRouteDetail(busNumber);
      if (res.isSuccess && res.data) {
        setRouteDetail(res.data);
        if (onSelectBusLineRoute) {
          onSelectBusLineRoute(res.data);
        }
      } else {
        setRouteDetail(null);
      }
    } catch (err) {
      console.error('Error fetching route detail:', err);
      setRouteDetail(null);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleBackToList = () => {
    setSelectedBusNumber(null);
    setRouteDetail(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9fc] border-r border-[#e2e2e5] shadow-lg">
      {/* YPS Gold Header Banner */}
      <div className="p-4 sm:p-5 border-b border-[#d1c6ab] bg-gradient-to-br from-[#ffffff] via-[#fff9e6] to-[#ffe07c]/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffd200] text-[#1a1c1e] flex items-center justify-center shadow-md border border-[#e5bc00]">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#1a1c1e] leading-tight">
              {t('ybsBusLines')}
            </h2>
            <p className="text-xs text-gray-600 font-medium">
              {language === 'my' ? 'YBS ဘတ်စ်ကား လိုင်းများနှင့် မှတ်တိုင်များ' : 'Yangon Bus Service (YBS) Routes'}
            </p>
          </div>
        </div>

        {!selectedBusNumber && (
          <>
            {/* Search Input */}
            <div className="relative mt-2 mb-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'my' ? 'YBS ယာဉ်လိုင်းနံပါတ် သို့မဟုတ် လမ်းကြောင်း ရှာရန်...' : 'Search bus line number or route...'}
                className="w-full h-11 pl-11 pr-9 rounded-full bg-white border border-[#d1c6ab] text-xs text-[#1a1c1e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#725c00] shadow-sm transition-all"
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

            {/* Filter Toggle Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterYpsOnly(false)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  !filterYpsOnly
                    ? 'bg-[#725c00] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t('allBusLines')}
              </button>

              <button
                onClick={() => setFilterYpsOnly(true)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  filterYpsOnly
                    ? 'bg-[#ffd200] text-[#1a1c1e] border border-[#e5bc00] shadow-sm'
                    : 'bg-[#fff9e6] text-[#725c00] border border-[#ffe07c] hover:bg-[#ffe07c]/50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{t('ypsOnlyLines')}</span>
              </button>
            </div>
          </>
        )}

        {selectedBusNumber && (
          <button
            onClick={handleBackToList}
            className="mt-1 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-[#d1c6ab] text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>{language === 'my' ? 'ယာဉ်လိုင်းများ စာရင်းသို့ ပြန်သွားရန်' : 'Back to Bus Lines List'}</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f9f9fc] space-y-3">
        {selectedBusNumber ? (
          /* Route Detail View */
          isLoadingRoute ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#725c00]">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs font-semibold">
                {language === 'my' ? 'လမ်းကြောင်း အချက်အလက်များ ယူနေသည်...' : 'Loading route details...'}
              </span>
            </div>
          ) : routeDetail ? (
            <div className="space-y-4">
              {/* Bus Line Title Banner */}
              <div className="p-4 bg-white border border-[#e2e2e5] rounded-2xl shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-base font-extrabold text-[#1a1c1e] bg-[#ffd200] px-3.5 py-1 rounded-xl border border-[#e5bc00]">
                    YBS {routeDetail.busNumber}
                  </span>
                  {routeDetail.isYpsSupported && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#725c00] bg-[#fff9e6] px-2.5 py-1 rounded-full border border-[#ffe07c]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#725c00]" />
                      {t('ypsCardAccepted')}
                    </span>
                  )}
                </div>

                {/* Route Direction Selector Tabs */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#f3f3f6]">
                  <button
                    onClick={() => setActiveRouteTab('outbound')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeRouteTab === 'outbound'
                        ? 'bg-[#725c00] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('outboundRoute')} ({routeDetail.outboundStops.length})
                  </button>
                  <button
                    onClick={() => setActiveRouteTab('return')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeRouteTab === 'return'
                        ? 'bg-[#725c00] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('returnRoute')} ({routeDetail.returnStops.length})
                  </button>
                </div>
              </div>

              {/* Stops List without # symbol */}
              <div className="bg-white border border-[#e2e2e5] rounded-2xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-[#725c00]" />
                  <span>
                    {activeRouteTab === 'outbound'
                      ? routeDetail.outboundTitle || t('outboundRoute')
                      : routeDetail.returnTitle || t('returnRoute')}
                  </span>
                </h4>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ffe07c]">
                  {(activeRouteTab === 'outbound' ? routeDetail.outboundStops : routeDetail.returnStops).map(
                    (stop, idx) => {
                      const orderNum = stop.stopOrder || stop.sequenceOrder || (idx + 1);
                      return (
                        <div key={idx} className="relative flex items-start justify-between gap-2">
                          <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#725c00] shadow-xs" />
                          <div>
                            <p className="text-xs font-bold text-[#1a1c1e]">{stop.stopName || `Stop ${orderNum}`}</p>
                            {stop.roadTownship && (
                              <p className="text-[11px] text-gray-500 font-medium">{stop.roadTownship}</p>
                            )}
                          </div>
                          {/* Clean stop order number without # sign */}
                          <span className="text-[10px] font-mono-meta bg-[#fff9e6] text-[#725c00] px-2 py-0.5 rounded-md border border-[#ffe07c] font-bold">
                            {orderNum}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="text-xs font-semibold">{language === 'my' ? 'လမ်းကြောင်း အချက်အလက် မရှိပါ' : 'No route details available.'}</p>
            </div>
          )
        ) : /* Bus Lines List View */
        isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#725c00]">
            <RefreshCw className="w-7 h-7 animate-spin mb-2" />
            <span className="text-xs font-semibold">
              {language === 'my' ? 'YBS ယာဉ်လိုင်းများ ရှာဖွေနေသည်...' : 'Fetching YBS bus lines...'}
            </span>
          </div>
        ) : busLines.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Bus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-xs">
              {language === 'my' ? 'YBS ယာဉ်လိုင်း မတွေ့ရှိပါ' : 'No YBS bus lines found.'}
            </p>
          </div>
        ) : (
          busLines.map((bus) => (
            <div
              key={bus.busNumber}
              onClick={() => handleSelectBusLine(bus.busNumber)}
              className="p-4 rounded-xl border border-[#e2e2e5] bg-white hover:border-[#ffd200] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-[#1a1c1e] bg-[#ffd200] px-3 py-1 rounded-lg border border-[#e5bc00]">
                    YBS {bus.busNumber}
                  </span>
                  {bus.isYpsSupported && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#725c00] bg-[#fff9e6] px-2 py-0.5 rounded-md border border-[#ffe07c]">
                      <CreditCard className="w-3 h-3 text-[#725c00]" />
                      {t('ypsCardAccepted')}
                    </span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#725c00] transition-colors" />
              </div>

              {bus.outboundTitle && (
                <p className="text-xs text-gray-700 font-medium leading-relaxed flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{bus.outboundTitle}</span>
                </p>
              )}

              <div className="mt-2.5 pt-2 border-t border-[#f3f3f6] flex items-center justify-between text-[11px] font-mono-meta text-gray-500">
                <span>{t('outboundRoute')}: {bus.outboundTotalStops} stops</span>
                <span>{t('returnRoute')}: {bus.returnTotalStops} stops</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
