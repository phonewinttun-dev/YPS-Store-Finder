import type { Metadata, Viewport } from 'next';
import { LanguageProvider } from '../context/LanguageContext';
import PwaRegister from '../components/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'YPS Store Finder',
  description: 'Interactive store finder and location tracker for YPS service counters, agents, capital markets, and cinemas in Yangon.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YPS Finder',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1d5fa8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="YPS Finder" />
      </head>
      <body className="antialiased font-sans bg-[#f9f9fc] text-[#1a1c1e] overflow-hidden select-none">
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
