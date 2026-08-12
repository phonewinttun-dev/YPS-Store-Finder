'use client';

import Link from 'next/link';
import { ArrowLeft, Bus, CreditCard, Footprints, MapPin, Navigation, RefreshCw, Store } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import AppShell from '../../../components/AppShell';
import { useLanguage } from '../../../context/LanguageContext';
import { fetchNearbyBusStopsForStore, fetchStoreById } from '../../../services/api';
import { StoreNearbyBusStopsDto } from '../../../types/bus';
import { StoreDto } from '../../../types/store';
import { buttonStyles } from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, tAddress, tCategory, tStoreName, toMmNum } = useLanguage();
  const [store, setStore] = useState<StoreDto | null>(null);
  const [nearbyStops, setNearbyStops] = useState<StoreNearbyBusStopsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const storeId = Number(id);
        const [storeResponse, stopsResponse] = await Promise.all([fetchStoreById(storeId), fetchNearbyBusStopsForStore(storeId)]);
        if (!mounted) return;
        if (storeResponse.isSuccess && storeResponse.data) setStore(storeResponse.data);
        else setError(storeResponse.message || t('noStoresFound'));
        if (stopsResponse.isSuccess && stopsResponse.data) setNearbyStops(stopsResponse.data);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : t('apiErrorTitle'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, t]);

  const directionsHref = store ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}` : '#';

  return (
    <AppShell active="stores">
      <div className="ui-dot-grid min-h-full p-4 pb-16 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/?view=stores" className={buttonStyles({ size: 'sm' })}><ArrowLeft className="h-4 w-4" />{t('back')}</Link>
          {loading ? (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-store" role="status"><RefreshCw className="h-8 w-8 animate-spin" /><span className="text-sm font-bold">{t('updatingStores')}</span></div>
          ) : error || !store ? (
            <div className="surface-card mt-5 flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger"><Store className="h-6 w-6" /></span><p className="text-sm font-bold text-muted">{error || t('noStoresFound')}</p></div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <article className="ui-card overflow-hidden">
                <div className="transit-ribbon h-1" />
                <div className="p-5 sm:p-8">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-store-soft text-store"><Store className="h-6 w-6" /></span>
                    <div className="min-w-0"><StatusBadge tone="store" className="uppercase tracking-wider">{tCategory(store.category)}</StatusBadge><h1 className="ui-page-title mt-3 text-ink">{tStoreName(store.name)}</h1></div>
                  </div>
                  <div className="mt-6 space-y-4 border-t border-line pt-6">
                    {store.address && <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-store-soft text-store"><MapPin className="h-4 w-4" /></span><div><p className="ui-eyebrow">Address</p><p className="mt-1 text-sm leading-relaxed text-ink">{tAddress(store.address)}</p></div></div>}
                    {store.description && <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-soft text-brand"><CreditCard className="h-4 w-4" /></span><p className="pt-2 text-sm leading-relaxed text-muted">{store.description}</p></div>}
                  </div>
                  <a href={directionsHref} target="_blank" rel="noreferrer" className={buttonStyles({ tone: 'route', variant: 'solid', size: 'lg', className: 'mt-7 w-full' })}><Navigation className="h-4 w-4" />{t('showDirection')}</a>
                </div>
              </article>

              <section aria-labelledby="nearby-stops-title">
                <div className="mb-3 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-bus-soft text-bus"><Bus className="h-5 w-5" /></span><div><p className="ui-eyebrow text-bus">YBS CONNECTIONS</p><h2 id="nearby-stops-title" className="text-base font-bold text-ink">{t('nearestBusStops')}</h2></div></div>
                <div className="space-y-3">
                  {nearbyStops?.nearbyBusStops?.length ? nearbyStops.nearbyBusStops.map((stop, index) => (
                    <article key={`${stop.stopName}-${index}`} className="ui-card ui-interactive-card p-4">
                      <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-ink">{stop.stopName}</h3>{stop.roadTownship && <p className="mt-1 text-xs text-muted">{stop.roadTownship}</p>}</div><div className="flex shrink-0 flex-col items-end gap-1.5">{stop.distanceMeters !== undefined && <span className="font-mono-meta inline-flex items-center gap-1 rounded-full bg-gps-soft px-2 py-1 text-[10px] font-bold text-gps"><Navigation className="h-3 w-3" />{toMmNum(stop.distanceMeters)} {t('meters')}</span>}{stop.walkTimeMinutes !== undefined && stop.walkTimeMinutes > 0 && <span className="font-mono-meta inline-flex items-center gap-1 rounded-full bg-route-soft px-2 py-1 text-[10px] font-bold text-route"><Footprints className="h-3 w-3" />{toMmNum(stop.walkTimeMinutes)} {t('minutes')}</span>}</div></div>
                      {!!stop.servicingBusNumbers?.length && <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">{Array.from(new Set(stop.servicingBusNumbers)).map((number) => <Link key={number} href={`/buses/${encodeURIComponent(number)}`} className={`font-mono-meta inline-flex min-h-11 min-w-11 items-center justify-center rounded-[13px] px-2 text-[10px] font-bold ${stop.ypsSupportedBusNumbers?.includes(number) ? 'bg-brand-soft text-brand' : 'bg-bus-soft text-bus'}`}>{toMmNum(number)}</Link>)}</div>}
                    </article>
                  )) : <div className="surface-card p-5 text-sm text-muted">{t('nearestBusStops')}: —</div>}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
