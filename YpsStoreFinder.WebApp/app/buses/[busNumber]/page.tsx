'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Bus, CreditCard, ChevronRight, ArrowLeftRight, MapPin, RefreshCw, X } from 'lucide-react';
import { fetchBusRouteDetail } from '../../../services/api';
import { BusRouteDetailDto } from '../../../types/bus';
import { useLanguage } from '../../../context/LanguageContext';

export default function BusDetailPage({ params }: { params: Promise<{ busNumber: string }> }) {
  const { busNumber } = use(params);
  const { t, toMmNum } = useLanguage();
  
  const [routeDetail, setRouteDetail] = useState<BusRouteDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRouteTab, setActiveRouteTab] = useState<'outbound' | 'return'>('outbound');

  useEffect(() => {
    const loadRouteDetail = async () => {
      setIsLoading(true);
      try {
        const decodedBusNumber = decodeURIComponent(busNumber);
        const res = await fetchBusRouteDetail(decodedBusNumber);
        if (res.isSuccess && res.data) {
          setRouteDetail(res.data);
        } else {
          setRouteDetail(null);
        }
      } catch (err) {
        console.error('Error fetching route detail:', err);
        setRouteDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRouteDetail();
  }, [busNumber]);

  return (
    <div className="min-h-screen bg-[#f9f9fc]">
      <div className="max-w-2xl mx-auto p-4 sm:p-5 pb-24 space-y-4">
        {/* Top Navigation */}
        <div className="mb-4">
          <Link
            href="/buses"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-[#d1c6ab] text-gray-800 text-xs font-bold transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>ယာဉ်လိုင်းများ စာရင်းသို့ ပြန်သွားရန်</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#725c00]">
            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-semibold">
              လမ်းကြောင်း အချက်အလက်များ ယူနေသည်...
            </span>
          </div>
        ) : routeDetail ? (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e2e5] shadow-sm">
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

              <div className="flex items-center gap-2 mb-2">
                <Bus className="w-5 h-5 text-[#725c00] shrink-0" />
                <h3 className="font-extrabold text-base text-gray-700 truncate leading-snug">
                  YBS <span className="font-mono-meta">{toMmNum(routeDetail.busNumber)}</span>
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

              <div className="pt-3 border-t border-[#f3f3f6] flex items-center gap-2">
                <button
                  onClick={() => setActiveRouteTab('outbound')}
                  className={`flex-1 h-9 text-[11px] font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all cursor-pointer ${
                    activeRouteTab === 'outbound'
                      ? 'bg-[#725c00] text-white shadow-sm shadow-amber-950/30'
                      : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                  }`}
                >
                  <span className="inline-flex items-center justify-center leading-normal -translate-y-0.5">
                    {t('outbound')}
                  </span>
                </button>

                <button
                  onClick={() => setActiveRouteTab('return')}
                  className={`flex-1 h-9 text-[11px] font-bold rounded-xl flex items-center justify-center text-center whitespace-nowrap px-2 transition-all cursor-pointer ${
                    activeRouteTab === 'return'
                      ? 'bg-[#725c00] text-white shadow-sm shadow-amber-950/30'
                      : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                  }`}
                >
                  <span className="inline-flex items-center justify-center leading-normal -translate-y-0.5">
                    {t('return')}
                  </span>
                </button>
              </div>
            </div>

            {/* Stops Timeline */}
            <div className="bg-white border border-[#e2e2e5] rounded-2xl p-4 sm:p-5 shadow-sm">
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
          <div className="py-8 text-center text-gray-500 bg-white border border-[#e2e2e5] rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold">လမ်းကြောင်း အချက်အလက် မရှိပါ</p>
          </div>
        )}
      </div>
    </div>
  );
}
