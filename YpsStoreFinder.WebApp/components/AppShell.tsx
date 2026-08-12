'use client';

import Link from 'next/link';
import { Bus, Languages, Map, MapPin, Moon, Sun, Monitor, type LucideIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import AppMark from './AppMark';

export type AppDestination = 'map' | 'stores' | 'buses';
export type SheetSnap = 'peek' | 'mid' | 'full';

interface AppShellProps {
  active: AppDestination;
  children: React.ReactNode;
  explorer?: React.ReactNode;
  mobileSnap?: SheetSnap;
  onMobileSnapChange?: (snap: SheetSnap) => void;
}

const destinations: Array<{ id: AppDestination; href: string; icon: LucideIcon }> = [
  { id: 'map', href: '/?view=map', icon: Map },
  { id: 'stores', href: '/?view=stores', icon: MapPin },
  { id: 'buses', href: '/buses', icon: Bus },
];

function ThemeSelector({ compact = false }: { compact?: boolean }) {
  const { preference, setPreference } = useTheme();
  const { t } = useLanguage();
  const Icon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;

  return (
    <label className={`relative inline-flex ${compact ? 'h-11 w-11' : 'h-12 w-full'}`}>
      <span className="sr-only">{t('themeSelector')}</span>
      <Icon className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-ink" />
      <select
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
        className="theme-select h-full w-full cursor-pointer appearance-none rounded-full border border-line bg-surface text-transparent shadow-card hover:bg-elevated"
        aria-label={t('themeSelector')}
      >
        <option value="system">{t('systemTheme')}</option>
        <option value="light">{t('lightTheme')}</option>
        <option value="dark">{t('darkTheme')}</option>
      </select>
    </label>
  );
}

function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, toggleLanguage, t } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`${compact ? 'h-11 w-11' : 'h-12 w-full'} inline-flex items-center justify-center gap-1 rounded-full border border-line bg-surface text-[10px] font-bold text-ink shadow-card hover:bg-elevated`}
      aria-label={t('languageToggle')}
    >
      <Languages className="h-4 w-4" />
      <span aria-hidden="true">{language === 'my' ? 'EN' : 'MY'}</span>
    </button>
  );
}

function TransitNavigation({ active }: { active: AppDestination }) {
  const { t } = useLanguage();
  return (
    <nav aria-label={t('navigation')} className="ios-material hidden h-[100dvh] flex-col items-center border-r px-2 py-3 lg:flex">
      <Link href="/?view=map" className="mb-5 rounded-2xl" aria-label={t('appTitle')}>
        <AppMark className="h-14 w-14" />
      </Link>
      <div className="flex w-full flex-1 flex-col gap-2">
        {destinations.map(({ id, href, icon: Icon }) => {
          const isActive = id === active;
          return (
            <Link
              key={id}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition-colors ${
                isActive ? 'bg-brand-soft text-brand shadow-card' : 'text-muted hover:bg-elevated hover:text-ink'
              }`}
            >
              {isActive && <span className="transit-ribbon absolute left-0 top-3 h-8 w-1 rounded-r-full" />}
              <Icon className="h-5 w-5" />
              <span>{t(id)}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex w-full flex-col gap-2">
        <LanguageToggle />
        <ThemeSelector />
      </div>
    </nav>
  );
}

function MobileTopBar({ active }: { active: AppDestination }) {
  const { t } = useLanguage();
  return (
    <header className="ios-material fixed inset-x-0 top-0 z-[950] grid h-16 grid-cols-[44px_minmax(0,1fr)_44px_44px] items-center gap-1 border-b px-2 shadow-card lg:hidden">
      <Link href="/?view=map" className="shrink-0 rounded-2xl" aria-label={t('appTitle')}>
        <AppMark className="h-11 w-11" />
      </Link>
      <nav aria-label={t('navigation')} className="flex items-center justify-self-center gap-0.5">
        {destinations.map(({ id, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            aria-label={t(id)}
            aria-current={active === id ? 'page' : undefined}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
              active === id ? 'bg-brand-soft text-brand shadow-card' : 'text-muted hover:bg-elevated hover:text-ink'
            }`}
          >
            <Icon className="h-5 w-5" />
          </Link>
        ))}
      </nav>
      <LanguageToggle compact />
      <ThemeSelector compact />
    </header>
  );
}

function getSnapHeight(snap: SheetSnap) {
  if (typeof window === 'undefined') return snap === 'peek' ? 112 : snap === 'mid' ? 440 : 704;
  if (snap === 'peek') return 112;
  if (snap === 'mid') return Math.round(window.innerHeight * 0.55);
  return Math.round(window.innerHeight * 0.88);
}

export default function AppShell({ active, children, explorer, mobileSnap = 'peek', onMobileSnapChange }: AppShellProps) {
  const { t } = useLanguage();
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragStart = useRef<{ y: number; height: number } | null>(null);
  const snap = mobileSnap;

  const setNextSnap = (next: SheetSnap) => {
    setDragHeight(null);
    onMobileSnapChange?.(next);
  };

  const nearestSnap = (height: number): SheetSnap => {
    const candidates: Array<[SheetSnap, number]> = [
      ['peek', getSnapHeight('peek')],
      ['mid', getSnapHeight('mid')],
      ['full', getSnapHeight('full')],
    ];
    return candidates.sort((a, b) => Math.abs(a[1] - height) - Math.abs(b[1] - height))[0][0];
  };

  const sheetHeight = dragHeight ?? getSnapHeight(snap);
  const shellColumns = explorer ? 'lg:grid-cols-[80px_400px_minmax(0,1fr)] xl:grid-cols-[80px_420px_minmax(0,1fr)]' : 'lg:grid-cols-[80px_minmax(0,1fr)]';

  return (
    <div className={`h-[100dvh] w-full overflow-hidden bg-canvas lg:grid ${shellColumns}`}>
      <a className="skip-link" href="#main-content">{t('skipToContent')}</a>
      <TransitNavigation active={active} />
      <MobileTopBar active={active} />

      {explorer && (
        <aside
          aria-label={t('openExplorer')}
          className="ios-material fixed inset-x-0 bottom-0 z-[900] flex min-h-0 flex-col overflow-hidden rounded-t-[28px] border shadow-soft transition-[height] duration-300 lg:static lg:z-auto lg:!h-[100dvh] lg:rounded-none lg:border-y-0 lg:border-l-0 lg:bg-surface lg:shadow-none lg:backdrop-blur-none"
          style={{ height: sheetHeight }}
        >
          <button
            type="button"
            className="flex min-h-11 w-full shrink-0 touch-none items-center justify-center bg-transparent lg:hidden"
            aria-label={t('explorerHandle')}
            aria-expanded={snap !== 'peek'}
            onPointerDown={(event) => {
              dragStart.current = { y: event.clientY, height: sheetHeight };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!dragStart.current) return;
              const next = dragStart.current.height + (dragStart.current.y - event.clientY);
              setDragHeight(Math.max(getSnapHeight('peek'), Math.min(getSnapHeight('full'), next)));
            }}
            onPointerUp={(event) => {
              if (!dragStart.current) return;
              event.currentTarget.releasePointerCapture(event.pointerId);
              setNextSnap(nearestSnap(dragHeight ?? sheetHeight));
              dragStart.current = null;
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setNextSnap(snap === 'peek' ? 'mid' : 'full');
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                setNextSnap(snap === 'full' ? 'mid' : 'peek');
              } else if (event.key === 'Home') {
                event.preventDefault();
                setNextSnap('peek');
              } else if (event.key === 'End') {
                event.preventDefault();
                setNextSnap('full');
              }
            }}
          >
            <span className="h-1.5 w-9 rounded-full bg-muted/55" />
          </button>
          <div className="min-h-0 flex-1">{explorer}</div>
        </aside>
      )}

      <main id="main-content" className={`mt-16 h-[calc(100dvh-4rem)] min-h-0 overflow-auto bg-canvas lg:mt-0 lg:h-[100dvh] ${explorer ? '' : 'lg:col-start-2'}`}>
        {children}
      </main>
    </div>
  );
}
