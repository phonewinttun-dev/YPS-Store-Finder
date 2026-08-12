'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, CreditCard, MapPin, RefreshCw, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import AppShell from '../../../components/AppShell';
import { useLanguage } from '../../../context/LanguageContext';
import { fetchBusRouteDetail } from '../../../services/api';
import { BusRouteDetailDto } from '../../../types/bus';

export default function BusDetailPage({ params }: { params: Promise<{ busNumber: string }> }) {
  const { busNumber } = use(params);
  const { t, toMmNum } = useLanguage();
  const [routeDetail, setRouteDetail] = useState<BusRouteDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRouteTab, setActiveRouteTab] = useState<'outbound' | 'return'>('outbound');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetchBusRouteDetail(decodeURIComponent(busNumber));
        if (mounted) setRouteDetail(response.isSuccess && response.data ? response.data : null);
      } catch (error) {
        console.error('Error fetching route detail:', error);
        if (mounted) setRouteDetail(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [busNumber]);

  const stops = routeDetail ? (activeRouteTab === 'outbound' ? routeDetail.outboundStops : routeDetail.returnStops) : [];
  const title = routeDetail ? (activeRouteTab === 'outbound' ? routeDetail.outboundTitle || t('outboundRoute') : routeDetail.returnTitle || t('returnRoute')) : '';

  return (
    <AppShell active="buses">
      <div className="min-h-full bg-canvas p-4 pb-16 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/buses" className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-surface px-4 text-xs font-bold text-ink hover:bg-elevated"><ArrowLeft className="h-4 w-4" />{t('backToBuses')}</Link>
          {isLoading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-bus" role="status"><RefreshCw className="h-8 w-8 animate-spin" /><span className="text-sm font-bold">{t('loadingBuses')}</span></div>
          ) : routeDetail ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="h-fit overflow-hidden rounded-3xl border border-line bg-surface shadow-card lg:sticky lg:top-6">
                <div className="transit-ribbon h-1.5" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-meta flex h-16 min-w-16 items-center justify-center rounded-2xl bg-bus-soft px-3 text-2xl font-extrabold text-bus">{toMmNum(routeDetail.busNumber)}</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold ${routeDetail.isYpsSupported ? 'bg-brand-soft text-brand' : 'bg-elevated text-muted'}`}>{routeDetail.isYpsSupported ? <CreditCard className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{routeDetail.isYpsSupported ? t('ypsCardAccepted') : t('ypsCardUnavailable')}</span>
                  </div>
                  <h1 className="mt-4 text-xl font-extrabold text-ink">YBS {toMmNum(routeDetail.busNumber)}</h1>
                  <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bus" />{title}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-elevated p-1.5">
                    {(['outbound', 'return'] as const).map((tab) => <button key={tab} type="button" onClick={() => setActiveRouteTab(tab)} className={`min-h-11 rounded-xl px-2 text-xs font-bold ${activeRouteTab === tab ? 'bg-bus text-white shadow-card' : 'text-muted hover:text-ink'}`} aria-pressed={activeRouteTab === tab}>{t(tab)}</button>)}
                  </div>
                </div>
              </aside>
              <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7" aria-labelledby="route-title">
                <div className="mb-6 flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-route-soft text-route"><ArrowLeftRight className="h-5 w-5" /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-route">{t(activeRouteTab)}</p><h2 id="route-title" className="mt-1 text-lg font-extrabold text-ink">{title}</h2></div></div>
                <ol className="relative ml-2 space-y-5 border-l-2 border-route/25 pl-7">
                  {stops.map((stop, index) => {
                    const order = stop.stopOrder || stop.sequenceOrder || index + 1;
                    return <li key={`${stop.stopName}-${index}`} className="relative min-h-11"><span className="font-mono-meta absolute -left-[42px] top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-route bg-surface text-[9px] font-bold text-route">{toMmNum(order)}</span><p className="text-sm font-extrabold text-ink">{stop.stopName || `${t('busStop')} ${toMmNum(order)}`}</p>{stop.roadTownship && <p className="mt-1 text-xs text-muted">{stop.roadTownship}</p>}</li>;
                  })}
                </ol>
              </section>
            </div>
          ) : <div className="surface-card mt-5 flex min-h-64 items-center justify-center p-8 text-sm font-bold text-muted">{t('noRoute')}</div>}
        </div>
      </div>
    </AppShell>
  );
}
