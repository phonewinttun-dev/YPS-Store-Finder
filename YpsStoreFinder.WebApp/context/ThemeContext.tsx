'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type FeatureTone = 'brand' | 'store' | 'bus' | 'gps' | 'route' | 'danger';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem('yps_theme');
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : systemTheme();
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const next = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
      setResolvedTheme(next);
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
    };

    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference]);

  const setPreference = (next: ThemePreference) => {
    window.localStorage.setItem('yps_theme', next);
    const nextResolvedTheme = next === 'system' ? systemTheme() : next;
    document.documentElement.dataset.theme = nextResolvedTheme;
    document.documentElement.style.colorScheme = nextResolvedTheme;
    setResolvedTheme(nextResolvedTheme);
    setPreferenceState(next);
  };

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
