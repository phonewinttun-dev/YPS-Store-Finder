'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './ThemeContext';
import { SoundProvider } from './SoundContext';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes default stale time
            gcTime: 30 * 60 * 1000,    // 30 minutes garbage collection time
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <SoundProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}
