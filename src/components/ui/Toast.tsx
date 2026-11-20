'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  durationMs?: number;
}

export const showToast = (message: string, type: ToastType = 'success', durationMs: number = 4000) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('edvonest-toast', {
        detail: { id: `toast-${Date.now()}-${Math.random()}`, message, type, durationMs },
      })
    );
  }
};

const TOAST_ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; text: string; iconColor: string }> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    iconColor: 'text-emerald-600',
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    text: 'text-rose-900',
    iconColor: 'text-rose-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    iconColor: 'text-amber-600',
  },
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-900',
    iconColor: 'text-[#086A92]',
  },
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleNewToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        const item = customEvent.detail;
        setToasts((prev) => [...prev, item]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== item.id));
        }, item.durationMs || 4000);
      }
    };

    window.addEventListener('edvonest-toast', handleNewToast);
    return () => window.removeEventListener('edvonest-toast', handleNewToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const type = toast.type || 'success';
        const Icon = TOAST_ICONS[type] || CheckCircle2;
        const styles = TOAST_STYLES[type] || TOAST_STYLES.success;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 fade-in duration-200 ${styles.bg} ${styles.border} ${styles.text}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${styles.iconColor}`} />
              <span className="truncate leading-snug">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md hover:bg-black/5 opacity-70 hover:opacity-100 transition shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
