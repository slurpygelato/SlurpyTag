import { Amatic_SC, Patrick_Hand } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import "./globals.css";
import PWARegister from '@/components/PWARegister';

// Configurazione Amatic SC per i titoli
const amatic = Amatic_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-amatic',
});

// Configurazione Patrick Hand per il corpo del testo
const patrick = Patrick_Hand({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-patrick',
});

// Metadata per PWA
export const metadata: Metadata = {
  title: 'Slurpy Tag',
  description: 'La medaglietta digitale per il tuo cane',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Slurpy Tag',
  },
  formatDetection: {
    telephone: false,
  },
};

// Viewport e theme color
export const viewport: Viewport = {
  themeColor: '#FF8CB8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${amatic.variable} ${patrick.variable}`}>
      <head>
        {/* PWA iOS Support */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-patrick antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}