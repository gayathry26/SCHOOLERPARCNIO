'use client';

import React from 'react';

export interface ChartTooltipEntry {
  label: string;
  value: string | number;
  color?: string;
  subtext?: string;
}

export interface ChartTooltipProps {
  title?: string;
  entries: ChartTooltipEntry[];
  delta?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  title,
  entries,
  delta,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-xs min-w-[150px] space-y-1.5 pointer-events-none transition-all duration-150 animate-in fade-in-50 zoom-in-95 ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800">
          <span className="font-bold text-[11px] text-slate-300 uppercase tracking-wider">{title}</span>
          {delta && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                delta.isPositive ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
              }`}
            >
              {delta.value}
            </span>
          )}
        </div>
      )}

      <div className="space-y-1">
        {entries.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              {entry.color && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
              )}
              <span className="text-slate-400 truncate">{entry.label}</span>
            </div>
            <span className="font-bold text-white shrink-0">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
