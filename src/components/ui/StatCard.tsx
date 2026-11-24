import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  change?: string | { value: string; isPositive: boolean };
  trend?:
    | {
        value: string;
        isPositive: boolean;
      }
    | 'up'
    | 'down'
    | 'neutral'
    | string;
  variant?: 'blue' | 'teal' | 'green' | 'amber' | 'rose' | 'slate' | 'emerald' | 'indigo' | 'purple' | string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  trend,
  variant = 'blue',
}) => {
  const displaySubtitle = subtitle || (typeof change === 'string' ? change : undefined);
  const trendObj =
    typeof trend === 'object' && trend !== null && 'value' in trend
      ? trend
      : typeof change === 'object' && change !== null && 'value' in change
      ? change
      : null;
  const iconVariants: Record<string, string> = {
    red: 'bg-[#FEF2F2] text-[#990000]',
    'dark-red': 'bg-[#FEF2F2] text-[#800000]',
    blue: 'bg-[#FEF2F2] text-[#990000]',
    teal: 'bg-[#FEF2F2] text-[#C00000]',
    green: 'bg-[#EAF8EC] text-[#35B84A]',
    emerald: 'bg-[#EAF8EC] text-[#35B84A]',
    indigo: 'bg-[#FEF2F2] text-[#990000]',
    amber: 'bg-[#FEF3C7] text-[#D97706]',
    rose: 'bg-[#FEE2E2] text-[#DC2626]',
    slate: 'bg-[#F1F5F7] text-[#737373]',
  };

  return (
    <Card hoverEffect className="relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-semibold text-[#737373] tracking-wide">{title}</p>
          <p className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">{value}</p>
          {displaySubtitle && <p className="text-xs text-[#737373] leading-snug">{displaySubtitle}</p>}
        </div>
        <div className={clsx('p-2.5 rounded-xl shrink-0 flex items-center justify-center', iconVariants[variant] || iconVariants.blue)}>
          {icon}
        </div>
      </div>

      {trendObj && (
        <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] flex items-center gap-1.5 text-xs font-medium">
          {trendObj.isPositive ? (
            <span className="flex items-center text-[#16A34A] font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trendObj.value}
            </span>
          ) : (
            <span className="flex items-center text-[#DC2626] font-bold">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trendObj.value}
            </span>
          )}
          <span className="text-[#737373] font-normal">vs previous month</span>
        </div>
      )}
    </Card>
  );
};
