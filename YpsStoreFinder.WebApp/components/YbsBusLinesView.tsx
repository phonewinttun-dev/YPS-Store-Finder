import React, { useState, useMemo } from 'react';
import { BusRouteDetailDto } from '../types/bus';
import { useBusLines, useBusRouteDetail } from '../hooks/useStoreQueries';
import { useLanguage } from '../context/LanguageContext';
import { Search, Bus, CreditCard, ChevronRight, ArrowLeftRight, MapPin, RefreshCw, X, CheckCircle2, Navigation } from 'lucide-react';

interface YbsBusLinesViewProps {
  onSelectBusLineRoute?: (routeDetail: BusRouteDetailDto) => void;
}

export default function YbsBusLinesView({ onSelectBusLineRoute }: YbsBusLinesViewProps) {
  const { t, toMmNum } = useLanguage();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterYpsOnly, setFilterYpsOnly] = useState<boolean>(false);
  const [selectedBusNumber, setSelectedBusNumber] = useState<string | null>(null);
  const [activeRouteTab, setActiveRouteTab] = useState<'outbound' | 'return'>('outbound');

  const { data: busLinesRes, isLoading, refetch } = useBusLines();
  const allBusLines = busLinesRes?.isSuccess && busLinesRes.data ? busLinesRes.data : [];

  const { data: routeDetailRes, isLoading: isLoadingRoute } = useBusRouteDetail(selectedBusNumber);
  const routeDetail = routeDetailRes?.isSuccess && routeDetailRes.data ? routeDetailRes.data : null;

  const busLines = useMemo(() => {
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

  // Notify parent component when route detail query resolves
  React.useEffect(() => {
    if (routeDetail && onSelectBusLineRoute) {
      onSelectBusLineRoute(routeDetail);
    }
  }, [routeDetail, onSelectBusLineRoute]);

  const handleSelectBusLine = (busNumber: string) => {
    setSelectedBusNumber(busNumber);
  };

  const handleBackToList = () => {
    setSelectedBusNumber(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9fc] border-r border-[#e2e2e5] shadow-lg">
      {/* Header Banner - Clean Search & Filter Buttons Container */}
      <div className="p-3.5 sm:p-4 border-b border-[#e2e2e5] bg-[#f9f9fc]">
        {!selectedBusNumber && (
          <>
            {/* Search Input */}
            <div className="relative mb-2.5">
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
            <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-2.5 pt-1 px-0.5">
              <button
                onClick={() => setFilterYpsOnly(false)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  !filterYpsOnly
                    ? 'bg-[#725c00] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t('allBusLines')}
              </button>

              <button
                onClick={() => setFilterYpsOnly(true)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  filterYpsOnly
                    ? 'bg-[#725c00] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
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
            <span>ယာဉ်လိုင်းများ စာရင်းသို့ ပြန်သွားရန်</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 pb-24 sm:pb-28 bg-[#f9f9fc] space-y-4">
        {selectedBusNumber ? (
          /* Route Detail View */
          isLoadingRoute ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#725c00]">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs font-semibold">
                လမ်းကြောင်း အချက်အလက်များ ယူနေသည်...
              </span>
            </div>
          ) : routeDetail ? (
            <div className="space-y-4">
              {/* Reusable Bus Card at Top of Detail View */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e2e5] shadow-sm shadow-slate-900/5 transition-all duration-200 outline-none">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {routeDetail.isYpsSupported ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200/80 whitespace-nowrap shrink-0 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-gray-500" />
                        <span>{t('ypsCardAccepted')}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200/60 whitespace-nowrap shrink-0 flex items-center gap-1">
                        <X className="w-3 h-3 text-gray-400" />
                        <span>YPS ကဒ် အသုံးပြု၍မရနိုင်ပါ</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title with Clean Inline Bus Icon */}
                <div className="flex items-center gap-2 mb-2">
                  <Bus className="w-5 h-5 text-[#725c00] shrink-0" />
                  <h3 className="font-extrabold text-base text-gray-700 truncate leading-snug">
                    YBS {toMmNum(routeDetail.busNumber)}
                  </h3>
                </div>

                {routeDetail.outboundTitle && (
                  <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3.5 flex items-start gap-1.5 pl-0.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {activeRouteTab === 'outbound'
                        ? routeDetail.outboundTitle || t('outboundRoute')
                        : routeDetail.returnTitle || t('returnRoute')}
                    </span>
                  </p>
                )}

                {/* Dual Route Action Buttons as Reusable Tab Toggles */}
                <div className="pt-3 border-t border-[#f3f3f6] flex items-center gap-2">
                  <button
                    onClick={() => setActiveRouteTab('outbound')}
                    className={`flex-1 h-9 text-[11px] font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all cursor-pointer ${
                      activeRouteTab === 'outbound'
                        ? 'bg-[#725c00] text-white shadow-sm shadow-amber-950/30 hover:shadow-md hover:shadow-amber-950/40'
                        : 'bg-white text-gray-700 border border-gray-200 shadow-sm shadow-slate-900/10 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center leading-normal -translate-y-0.5">
                      အသွား ({toMmNum(routeDetail.outboundStops.length)})
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveRouteTab('return')}
                    className={`flex-1 h-9 text-[11px] font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all cursor-pointer ${
                      activeRouteTab === 'return'
                        ? 'bg-[#725c00] text-white shadow-sm shadow-amber-950/30 hover:shadow-md hover:shadow-amber-950/40'
                        : 'bg-white text-gray-700 border border-gray-200 shadow-sm shadow-slate-900/10 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center leading-normal -translate-y-0.5">
                      အပြန် ({toMmNum(routeDetail.returnStops.length)})
                    </span>
                  </button>
                </div>
              </div>

              {/* Stops Timeline List with Perfectly Centered Line & Circle Dots */}
              <div className="bg-white border border-[#e2e2e5] rounded-2xl p-4 sm:p-5 shadow-sm shadow-slate-900/5">
                <h4 className="text-xs font-bold text-gray-600 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-[#725c00]" />
                  <span>
                    {activeRouteTab === 'outbound'
                      ? routeDetail.outboundTitle || t('outboundRoute')
                      : routeDetail.returnTitle || t('returnRoute')}
                  </span>
                </h4>

                <div className="relative pl-7 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ffe07c]">
                  {(activeRouteTab === 'outbound' ? routeDetail.outboundStops : routeDetail.returnStops).map(
                    (stop, idx) => {
                      const orderNum = stop.stopOrder || stop.sequenceOrder || (idx + 1);
                      return (
                        <div key={idx} className="relative flex items-center justify-between gap-3 min-h-[32px]">
                          <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#725c00] shadow-2xs z-10" />
                          <div className="flex-1 pr-2">
                            <p className="text-xs font-bold text-[#1a1c1e] leading-tight">{stop.stopName || `မှတ်တိုင် ${toMmNum(orderNum)}`}</p>
                            {stop.roadTownship && (
                              <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">{stop.roadTownship}</p>
                            )}
                          </div>
                          {/* Clean stop order number badge */}
                          <span className="text-[10px] font-mono-meta bg-[#fff9e6] text-[#725c00] px-2 py-0.5 rounded-md border border-[#ffe07c] font-bold whitespace-nowrap shrink-0">
                            {toMmNum(orderNum)}
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
              <p className="text-xs font-semibold">လမ်းကြောင်း အချက်အလက် မရှိပါ</p>
            </div>
          )
        ) : /* Bus Lines List View */
        isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#725c00]">
            <RefreshCw className="w-7 h-7 animate-spin mb-2" />
            <span className="text-xs font-semibold">
              YBS ယာဉ်လိုင်းများ ရှာဖွေနေသည်...
            </span>
          </div>
        ) : busLines.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Bus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-xs">
              YBS ယာဉ်လိုင်း မတွေ့ရှိပါ
            </p>
          </div>
        ) : (
          busLines.map((bus, idx) => (
            <div
              key={bus.routeId ? `${bus.busNumber}-${bus.routeId}` : `${bus.busNumber}-${idx}`}
              onClick={() => handleSelectBusLine(bus.busNumber)}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e2e5] hover:border-gray-300 shadow-sm shadow-slate-900/5 hover:shadow-md hover:shadow-slate-900/10 transition-all duration-200 cursor-pointer outline-none group"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* YPS Supported Badge - Soft Gray Pill */}
                  {bus.isYpsSupported ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200/80 whitespace-nowrap shrink-0 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-gray-500" />
                      <span>{t('ypsCardAccepted')}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200/60 whitespace-nowrap shrink-0 flex items-center gap-1">
                      <X className="w-3 h-3 text-gray-400" />
                      <span>YPS ကဒ် အသုံးပြု၍မရနိုင်ပါ</span>
                    </span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#725c00] transition-colors shrink-0" />
              </div>

              {/* Title with Clean Inline Bus Icon (No Sub-Container Box Model) */}
              <div className="flex items-center gap-2 mb-2">
                <Bus className="w-5 h-5 text-[#725c00] shrink-0" />
                <h3 className="font-extrabold text-base text-gray-700 truncate leading-snug">
                  YBS {toMmNum(bus.busNumber)}
                </h3>
              </div>

              {bus.outboundTitle && (
                <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3.5 flex items-start gap-1.5 pl-0.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="truncate">{bus.outboundTitle}</span>
                </p>
              )}

              {/* Dual Route Buttons Side-by-Side with Compact Labels */}
              <div className="pt-3 border-t border-[#f3f3f6] flex items-center gap-2">
                {/* Outbound Route Button */}
                <span className="flex-1 h-9 bg-[#725c00] text-white shadow-sm shadow-amber-950/30 hover:shadow-md hover:shadow-amber-950/40 text-[11px] font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all">
                  <span className="inline-flex items-center justify-center leading-normal -translate-y-0.5">
                    အသွား ({toMmNum(bus.outboundTotalStops)})
                  </span>
                </span>

                {/* Return Route Button */}
                <span className="flex-1 h-9 bg-white text-gray-700 border border-gray-200 shadow-sm shadow-slate-900/10 hover:shadow-md hover:shadow-slate-900/15 text-[11px] font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all">
                  <span className="inline-flex items-center justify-center leading-normal -translate-y-0.5">
                    အပြန် ({toMmNum(bus.returnTotalStops)})
                  </span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
