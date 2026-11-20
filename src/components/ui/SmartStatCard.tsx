'use client';

import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface SmartStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    label?: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  progress?: {
    value: number; // 0 to 100
    targetLabel?: string;
    color?: string;
  };
  variant?: 'ocean' | 'emerald' | 'amber' | 'purple' | 'rose' | 'slate';
  onClick?: () => void;
  className?: string;
}

const THEME_STYLES: Record<
  string,
  { iconBg: string; iconColor: string; barBg: string; borderHover: string }
> = {
  ocean: {
    iconBg: 'bg-[#EAF5F8]',
    iconColor: 'text-[#086A92]',
    barBg: 'bg-[#086A92]',
    borderHover: 'hover:border-[#086A92]',
  },
  emerald: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    barBg: 'bg-emerald-600',
    borderHover: 'hover:border-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    barBg: 'bg-amber-500',
    borderHover: 'hover:border-amber-500',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-700',
    barBg: 'bg-purple-600',
    borderHover: 'hover:border-purple-500',
  },
  rose: {
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-700',
    barBg: 'bg-rose-600',
    borderHover: 'hover:border-rose-500',
  },
  slate: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    barBg: 'bg-slate-600',
    borderHover: 'hover:border-slate-400',
  },
};

export const SmartStatCard: React.FC<SmartStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  progress,
  variant = 'ocean',
  onClick,
  className = '',
}) => {
  const theme = THEME_STYLES[variant] || THEME_STYLES.ocean;

  return (
    <Card
      hoverEffect={Boolean(onClick)}
      className={`p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
        onClick ? `cursor-pointer ${theme.borderHover}` : ''
      } ${className}`}
      onClick={onClick}
    >
      <div>
        {/* Top row: Title and Icon */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase line-clamp-1">
            {title}
          </span>
          {icon && (
            <div className={`p-2.5 rounded-xl shrink-0 ${theme.iconBg} ${theme.iconColor}`}>
              {icon}
            </div>
          )}
        </div>

        {/* Metric Value */}
        <div className="mt-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
            {value}
          </span>
        </div>
      </div>

      {/* Progress Bar (if provided) */}
      {progress && (
        <div className="mt-3 space-y-1">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress.color || theme.barBg}`}
              style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
            />
          </div>
          {progress.targetLabel && (
            <span className="text-[10px] text-slate-400 font-medium block">
              {progress.targetLabel}
            </span>
          )}
        </div>
      )}

      {/* Footer: Trend and Subtitle */}
      {(trend || subtitle) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
          {subtitle && (
            <span className="text-slate-500 text-[11px] font-medium truncate">{subtitle}</span>
          )}

          {trend && (
            <div
              className={`inline-flex items-center gap-1 font-bold text-[11px] px-1.5 py-0.5 rounded-md shrink-0 ${
                trend.isNeutral
                  ? 'bg-slate-100 text-slate-600'
                  : trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {trend.isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              )}
              <span>{trend.value}</span>
              {trend.label && <span className="font-normal text-[10px] opacity-80">{trend.label}</span>}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
