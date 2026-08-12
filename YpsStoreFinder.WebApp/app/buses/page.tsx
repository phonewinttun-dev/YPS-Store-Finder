'use client';

import Link from 'next/link';
import { Bus, ChevronRight, CreditCard, MapPin, RefreshCw, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppShell from '../../components/AppShell';
import { useLanguage } from '../../context/LanguageContext';
import { fetchBusLines, searchBusLines } from '../../services/api';
import { BusLineDto } from '../../types/bus';

const BATCH_SIZE = 20;

export default function BusesPage() {
  const { t, toMmNum } = useLanguage();
  const [allBusLines, setAllBusLines] = useState<BusLineDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYpsOnly, setFilterYpsOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const query = searchQuery.trim();
        const response = query ? await searchBusLines(query, 1, 100) : await fetchBusLines();
        if (mounted) setAllBusLines(response.isSuccess && response.data ? response.data : []);
      } catch (error) {
        console.error('Error loading YBS bus lines:', error);
        if (mounted) setAllBusLines([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }, 300);
    return () => { mounted = false; window.clearTimeout(timer); };
  }, [searchQuery]);

  const filteredBusLines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allBusLines.filter((bus) => {
      if (filterYpsOnly && !bus.isYpsSupported) return false;
      if (!query) return true;
      return bus.busNumber?.toLowerCase().includes(query) || bus.outboundTitle?.toLowerCase().includes(query) || bus.returnTitle?.toLowerCase().includes(query);
    });
  }, [allBusLines, filterYpsOnly, searchQuery]);

  const displayed = filteredBusLines.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBusLines.length;
  const loadMore = useCallback(() => setVisibleCount((count) => Math.min(count + BATCH_SIZE, filteredBusLines.length)), [filteredBusLines.length]);

  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasMore || isLoading) return;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: '120px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <AppShell active="buses">
      <div className="min-h-full bg-canvas">
        <header className="ios-material sticky top-0 z-20 border-b shadow-card">
          <div className="transit-ribbon h-1" />
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="ios-section-label text-bus">YANGON BUS EXPLORER</p>
                <h1 className="ios-large-title mt-1 text-ink">{t('ybsBusLines')}</h1>
              </div>
              <span className="font-mono-meta rounded-full bg-bus-soft px-3 py-2 text-xs font-bold text-bus" aria-live="polite">{toMmNum(filteredBusLines.length)} {t('resultCount')}</span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input type="search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setVisibleCount(BATCH_SIZE); }} placeholder={t('searchBusPlaceholder')} aria-label={t('searchBusPlaceholder')} className="ios-search-field pl-11 pr-12" />
                {searchQuery && <button type="button" onClick={() => { setSearchQuery(''); setVisibleCount(BATCH_SIZE); }} className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink" aria-label={t('close')}><X className="h-4 w-4" /></button>}
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <button type="button" onClick={() => { setFilterYpsOnly(false); setVisibleCount(BATCH_SIZE); }} className={`min-h-12 shrink-0 rounded-full px-5 text-xs font-bold ${!filterYpsOnly ? 'bg-bus-action text-white shadow-card' : 'border border-line bg-surface text-muted hover:bg-elevated'}`}>{t('allBusLines')}</button>
                <button type="button" onClick={() => { setFilterYpsOnly(true); setVisibleCount(BATCH_SIZE); }} className={`flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-xs font-bold ${filterYpsOnly ? 'bg-brand-soft text-brand ring-1 ring-brand/30' : 'border border-line bg-surface text-muted hover:bg-elevated'}`}><CreditCard className="h-4 w-4" />{t('ypsOnlyLines')}</button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-3 p-4 pb-16 sm:grid-cols-2 sm:p-8 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex min-h-64 flex-col items-center justify-center gap-3 text-bus" role="status"><RefreshCw className="h-8 w-8 animate-spin" /><span className="text-sm font-bold">{t('loadingBuses')}</span></div>
          ) : displayed.length === 0 ? (
            <div className="surface-card col-span-full flex min-h-64 flex-col items-center justify-center text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-bus-soft text-bus"><Bus className="h-6 w-6" /></span><p className="text-sm font-bold text-ink">{t('noBuses')}</p></div>
          ) : displayed.map((bus, index) => (
            <Link href={`/buses/${encodeURIComponent(bus.busNumber)}`} key={bus.routeId ? `${bus.busNumber}-${bus.routeId}-${index}` : `${bus.busNumber}-${index}`} className="ios-grouped-card group flex min-h-56 flex-col p-5 transition hover:border-bus">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono-meta flex h-14 min-w-14 items-center justify-center rounded-[16px] bg-bus-soft px-3 text-xl font-bold text-bus">{toMmNum(bus.busNumber)}</span>
                <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-bus" />
              </div>
              <h2 className="mt-4 text-sm font-bold text-ink">YBS {toMmNum(bus.busNumber)}</h2>
              {bus.outboundTitle && <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bus" /><span className="line-clamp-2">{bus.outboundTitle}</span></p>}
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold ${bus.isYpsSupported ? 'bg-brand-soft text-brand' : 'bg-elevated text-muted'}`}><CreditCard className="h-3.5 w-3.5" />{bus.isYpsSupported ? t('ypsCardAccepted') : t('ypsCardUnavailable')}</span>
                <span className="text-xs font-bold text-bus">{t('storeDetails')}</span>
              </div>
            </Link>
          ))}
          {hasMore && <div ref={observerTargetRef} className="col-span-full flex items-center justify-center gap-2 py-6 text-xs font-bold text-bus" role="status"><RefreshCw className="h-4 w-4 animate-spin" />{t('loadingMoreBuses')}</div>}
        </div>
      </div>
    </AppShell>
  );
}
