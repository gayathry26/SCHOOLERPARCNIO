import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaProvider } from '@/components/pwa/PwaProvider';

export const viewport: Viewport = {
  themeColor: '#990000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'EDVONEST — Modern School Management ERP',
  description: 'Enterprise School Management ERP for modern Indian schools. Centralized admissions, academics, attendance, fees, exams, HR, transport, library, and reporting.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EdvoNest',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192.svg',
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/apple-touch-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EdvoNest" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <PwaProvider>
          {children}
        </PwaProvider>
      </body>
    </html>
  );
}
