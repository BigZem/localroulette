import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { PwaRegister } from '@/components/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'LocalRoulette — Spin Your City', template: '%s | LocalRoulette' },
  description: "Discover amazing places, activities and events near you. Set your preferences, spin the wheel and let LocalRoulette choose your next adventure.",
  applicationName: 'LocalRoulette',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
};
export const viewport: Viewport = { themeColor: '#0b1020', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><SiteHeader/>{children}<SiteFooter/><PwaRegister/></body></html>;
}
