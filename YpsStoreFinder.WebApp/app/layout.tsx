import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Myanmar } from 'next/font/google';
import { LanguageProvider } from '../context/LanguageContext';
import AppProviders from '../context/AppProviders';
import PwaRegister from '../components/PwaRegister';
import './globals.css';

const notoMyanmar = Noto_Sans_Myanmar({
  variable: '--font-myanmar',
  subsets: ['myanmar'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'YPS Store Finder',
  description: 'Find YPS stores, nearby YBS stops, and bus routes across Yangon.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'YPS Finder' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/brand/yps-finder-mark.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const themeBootScript = `
  (() => {
    try {
      const preference = localStorage.getItem('yps_theme') || 'system';
      const theme = preference === 'system'
        ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : preference;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (_) {}
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="my" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="application-name" content="YPS Finder" />
      </head>
      <body className={`${notoMyanmar.variable} antialiased`}>
        <AppProviders>
          <LanguageProvider>{children}</LanguageProvider>
        </AppProviders>
        <PwaRegister />
      </body>
    </html>
  );
}
