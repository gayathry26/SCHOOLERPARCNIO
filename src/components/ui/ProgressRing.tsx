'use client';

import React from 'react';

export interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // diameter in px (default 80)
  strokeWidth?: number; // stroke thickness in px (default 8)
  variant?: 'emerald' | 'ocean' | 'purple' | 'amber' | 'rose' | 'slate';
  showLabel?: boolean;
  label?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

const VARIANT_COLORS: Record<string, { stroke: string; track: string; text: string }> = {
  emerald: { stroke: '#16A34A', track: '#EAF8EC', text: 'text-emerald-700' },
  ocean: { stroke: '#990000', track: '#FEF2F2', text: 'text-[#990000]' },
  purple: { stroke: '#7C3AED', track: '#FAF5FF', text: 'text-purple-700' },
  amber: { stroke: '#D97706', track: '#FEF3C7', text: 'text-amber-700' },
  rose: { stroke: '#DC2626', track: '#FEE2E2', text: 'text-rose-700' },
  slate: { stroke: '#64748B', track: '#F1F5F7', text: 'text-slate-700' },
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 7,
  variant = 'ocean',
  showLabel = true,
  label,
  subtitle,
  className = '',
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.ocean;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.track}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
            {label !== undefined ? (
              label
            ) : (
              <span className={`text-xs sm:text-sm font-black tracking-tight ${colors.text}`}>
                {Math.round(normalizedProgress)}%
              </span>
            )}
          </div>
        )}
      </div>

      {subtitle && (
        <span className="text-[11px] font-semibold text-slate-500 mt-1.5 text-center block">
          {subtitle}
        </span>
      )}
    </div>
  );
};
