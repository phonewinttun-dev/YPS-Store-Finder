'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] ServiceWorker registration failed:', error);
          });
      };
      window.addEventListener('load', registerServiceWorker);
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []);

  return null;
}
