import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YPS Store Finder - Live Transit & Service Locator',
  description: 'Interactive store finder and location tracker for Yangon YPS service kiosks, agents, capital markets, and cinemas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-[#f9f9fc] text-[#1a1c1e] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
