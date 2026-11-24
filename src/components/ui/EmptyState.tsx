'use client';

import React from 'react';
import { Button } from './Button';
import { Illustration, IllustrationVariant } from './Illustration';

export interface EmptyStateProps {
  illustration?: IllustrationVariant;
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white border border-[#E5E5E5] rounded-2xl ${className}`}
    >
      {/* Visual illustration or icon */}
      {illustration ? (
        <div className="mb-4">
          <Illustration variant={illustration} size={130} />
        </div>
      ) : icon ? (
        <div className="p-3.5 bg-[#FEF2F2] text-[#990000] rounded-2xl mb-3 flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <div className="mb-4">
          <Illustration variant="no-search" size={120} />
        </div>
      )}

      {/* Typography */}
      <h3 className="text-sm sm:text-base font-bold text-[#171717] mb-1.5">{title}</h3>
      <p className="text-xs text-[#737373] max-w-sm mb-5 leading-relaxed">{description}</p>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" size="sm" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
