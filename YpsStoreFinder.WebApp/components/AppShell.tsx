'use client';

import Link from 'next/link';
import { Bus, Languages, Map, MapPin, Moon, Sun, Monitor, type LucideIcon } from 'lucide-react';
import React, { useRef, useState, useSyncExternalStore } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import AppMark from './AppMark';
import UiButton from './ui/Button';

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
  const preferenceLabel = preference === 'dark'
    ? t('darkTheme')
    : preference === 'light'
      ? t('lightTheme')
      : t('systemTheme');

  return (
    <label className={`relative inline-flex ${compact ? 'h-11 w-11' : 'h-12 w-full'}`}>
      <span className="sr-only">{t('themeSelector')}</span>
      <Icon className={`pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink ${compact ? 'left-1/2 -translate-x-1/2' : 'left-3.5'}`} />
      {!compact && <span className="pointer-events-none absolute left-11 top-1/2 z-10 -translate-y-1/2 text-xs font-semibold text-ink">{preferenceLabel}</span>}
      <select
        value={preference}
        onChange={(event) => setPreference(event.target.value as ThemePreference)}
        className="theme-select ui-button h-full w-full cursor-pointer appearance-none border border-line bg-surface text-transparent shadow-card hover:bg-elevated"
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
    <UiButton
      onClick={toggleLanguage}
      size={compact ? 'icon' : 'lg'}
      className={`${compact ? '' : 'w-full justify-start px-3.5'} gap-2 text-xs shadow-card`}
      aria-label={t('languageToggle')}
    >
      <Languages className="h-4 w-4" />
      <span aria-hidden="true">{compact ? (language === 'my' ? 'EN' : 'MY') : (language === 'my' ? 'English' : 'မြန်မာ')}</span>
    </UiButton>
  );
}

function TransitNavigation({ active }: { active: AppDestination }) {
  const { t } = useLanguage();
  return (
    <nav aria-label={t('navigation')} className="yps-sidebar ui-material hidden h-[100dvh] flex-col overflow-hidden rounded-tr-[24px] border-r px-3 pb-5 pt-3 shadow-[10px_0_32px_rgb(var(--shadow)/0.08)] lg:flex">
      <Link href="/?view=map" className="mb-5 flex min-h-12 items-center gap-3 rounded-[14px] px-1.5" aria-label={t('appTitle')}>
        <AppMark className="h-11 w-11 shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink">YPS Finder</span>
          <span className="font-mono-meta mt-0.5 block text-[9px] font-medium text-muted">YANGON TRANSIT</span>
        </span>
      </Link>
      <p className="ui-eyebrow mb-2 px-3">{t('navigation')}</p>
      <div className="flex w-full flex-1 flex-col gap-1">
        {destinations.map(({ id, href, icon: Icon }) => {
          const isActive = id === active;
          return (
            <Link
              key={id}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`ui-button group relative flex min-h-12 items-center gap-3 border px-3.5 text-xs font-semibold ${
                isActive ? 'border-line bg-elevated text-ink shadow-card' : 'border-transparent text-muted hover:border-line hover:bg-elevated hover:text-ink'
              }`}
            >
              {isActive && <span className="transit-ribbon absolute left-0 top-2.5 h-7 w-1 rounded-r-full" />}
              <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-brand' : ''}`} />
              <span className="truncate">{t(id)}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex w-full flex-col gap-2 border-t border-line/60 pt-3">
        <p className="ui-eyebrow px-3">{t('appearance')}</p>
        <LanguageToggle />
        <ThemeSelector />
      </div>
    </nav>
  );
}

function MobileTopBar({ active }: { active: AppDestination }) {
  const { t } = useLanguage();
  return (
    <header className="ui-material fixed inset-x-0 top-0 z-[950] grid h-16 grid-cols-[44px_minmax(0,1fr)_44px_44px] items-center gap-1 border-b px-2 shadow-card lg:hidden">
      <Link href="/?view=map" className="shrink-0 rounded-[12px]" aria-label={t('appTitle')}>
        <AppMark className="h-11 w-11" />
      </Link>
      <nav aria-label={t('navigation')} className="flex items-center justify-self-center gap-0.5">
        {destinations.map(({ id, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            aria-label={t(id)}
            aria-current={active === id ? 'page' : undefined}
            className={`ui-button inline-flex h-11 w-11 items-center justify-center border ${
              active === id ? 'border-brand/35 bg-brand-soft text-brand shadow-card' : 'border-transparent text-muted hover:border-line hover:bg-elevated hover:text-ink'
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

function subscribeViewport(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getViewportSnapshot() {
  return window.innerHeight;
}

function getViewportServerSnapshot() {
  return 800;
}

function getSnapHeight(snap: SheetSnap, viewportHeight: number) {
  if (snap === 'peek') return 112;
  if (snap === 'mid') return Math.round(viewportHeight * 0.55);
  return Math.round(viewportHeight * 0.88);
}

export default function AppShell({ active, children, explorer, mobileSnap = 'peek', onMobileSnapChange }: AppShellProps) {
  const { t } = useLanguage();
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragStart = useRef<{ y: number; height: number } | null>(null);
  const viewportHeight = useSyncExternalStore(subscribeViewport, getViewportSnapshot, getViewportServerSnapshot);
  const snap = mobileSnap;

  const setNextSnap = (next: SheetSnap) => {
    setDragHeight(null);
    onMobileSnapChange?.(next);
  };

  const nearestSnap = (height: number): SheetSnap => {
    const candidates: Array<[SheetSnap, number]> = [
      ['peek', getSnapHeight('peek', viewportHeight)],
      ['mid', getSnapHeight('mid', viewportHeight)],
      ['full', getSnapHeight('full', viewportHeight)],
    ];
    return candidates.sort((a, b) => Math.abs(a[1] - height) - Math.abs(b[1] - height))[0][0];
  };

  const sheetHeight = dragHeight ?? getSnapHeight(snap, viewportHeight);
  const shellColumns = explorer
    ? 'lg:grid-cols-[232px_380px_minmax(0,1fr)] xl:grid-cols-[244px_400px_minmax(0,1fr)]'
    : 'lg:grid-cols-[232px_minmax(0,1fr)] xl:grid-cols-[244px_minmax(0,1fr)]';

  return (
    <div className={`h-[100dvh] w-full overflow-hidden bg-canvas lg:grid ${shellColumns}`}>
      <a className="skip-link" href="#main-content">{t('skipToContent')}</a>
      <TransitNavigation active={active} />
      <MobileTopBar active={active} />

      {explorer && (
        <aside
          aria-label={t('openExplorer')}
          className="ui-material fixed inset-x-0 bottom-0 z-[900] flex min-h-0 flex-col overflow-hidden rounded-t-[20px] border shadow-soft transition-[height] duration-300 lg:static lg:z-auto lg:!h-[100dvh] lg:rounded-none lg:border-y-0 lg:border-l-0 lg:bg-surface lg:shadow-none lg:backdrop-blur-none"
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
              setDragHeight(Math.max(getSnapHeight('peek', viewportHeight), Math.min(getSnapHeight('full', viewportHeight), next)));
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
