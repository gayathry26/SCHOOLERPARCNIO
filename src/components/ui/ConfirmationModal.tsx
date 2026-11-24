'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  const Icon = isDanger ? AlertCircle : isWarning ? AlertTriangle : CheckCircle2;
  const iconColor = isDanger ? 'text-rose-600 bg-rose-50' : isWarning ? 'text-amber-600 bg-amber-50' : 'text-[#990000] bg-sky-50';
  const confirmBtnClass = isDanger
    ? 'bg-rose-600 hover:bg-rose-700 text-white'
    : isWarning
    ? 'bg-amber-600 hover:bg-amber-700 text-white'
    : 'bg-[#990000] hover:bg-[#800000] text-white';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3.5 pt-1">
          <div className={`p-2.5 rounded-xl shrink-0 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
            <div className="text-slate-600 leading-relaxed">{message}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>

          <Button
            size="sm"
            variant="primary"
            disabled={isLoading}
            onClick={onConfirm}
            className={`${confirmBtnClass} flex items-center gap-1.5`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
