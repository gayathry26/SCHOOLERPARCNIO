'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  WifiOff,
  Wifi,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { flushOfflineAttendance, getOfflineAttendanceCount, isOnline } from '@/lib/offline-sync';

export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);

  useEffect(() => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully, scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });

      // Listen for background sync triggers from SW
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data?.type === 'TRIGGER_OFFLINE_SYNC') {
          console.log('[PWA] Background sync message received, flushing offline drafts...');
          const result = await flushOfflineAttendance();
          if (result.synced > 0) {
            setSyncedCount(result.synced);
            setShowOnlineToast(true);
            setTimeout(() => setShowOnlineToast(false), 5000);
          }
        }
      });
    }

    // 2. Install Prompt Detection
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user has previously dismissed
      const dismissed = localStorage.getItem('edvonest_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode =
      ('standalone' in window.navigator && (window.navigator as any).standalone) ||
      window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isInStandaloneMode) {
      setIsIos(true);
      const dismissedIos = localStorage.getItem('edvonest_ios_dismissed');
      if (!dismissedIos) {
        setShowIosPrompt(true);
      }
    }

    // 4. Online / Offline Monitoring
    setOnlineStatus(navigator.onLine);

    const handleOnline = async () => {
      setOnlineStatus(true);
      // Automatically sync offline items
      const result = await flushOfflineAttendance();
      if (result.synced > 0) {
        setSyncedCount(result.synced);
        setShowOnlineToast(true);
        setTimeout(() => setShowOnlineToast(false), 5000);
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem('edvonest_pwa_dismissed', 'true');
  };

  const handleDismissIos = () => {
    setShowIosPrompt(false);
    localStorage.setItem('edvonest_ios_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Alert Strip */}
      {!onlineStatus && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-between z-50 sticky top-0 shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
            <span className="font-semibold">
              Offline Mode — Viewing cached data. Attendance & actions will sync automatically when reconnected.
            </span>
          </div>
          <span className="bg-amber-700 text-[10.5px] px-2 py-0.5 rounded font-mono font-bold">
            {getOfflineAttendanceCount()} Pending Sync
          </span>
        </div>
      )}

      {/* Online Reconnected Toast */}
      {showOnlineToast && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>Connection Restored! Synced {syncedCount} offline record(s) with server.</span>
        </div>
      )}

      {/* Android / Desktop Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-white border border-[#086A92]/30 rounded-xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#086A92] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Install EdvoNest App</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Fast home screen access & instant alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="bg-[#086A92] hover:bg-[#0F4C68] text-white text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismissInstall}
              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari 'Add to Home Screen' Instructions Banner */}
      {showIosPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-white border border-[#086A92]/30 rounded-xl p-3.5 shadow-2xl text-xs space-y-2 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#086A92]" />
              <span className="font-bold text-slate-900">Install EdvoNest on iPhone/iPad</span>
            </div>
            <button onClick={handleDismissIos} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11.5px] text-slate-600">
            To install: Tap the <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" /> Share button in Safari,
            then scroll and select <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-800" /> &ldquo;Add to Home Screen&rdquo;.
          </p>
        </div>
      )}

      {children}
    </>
  );
};
