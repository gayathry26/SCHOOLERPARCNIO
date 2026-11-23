'use client';

import React from 'react';
import { formatDate } from '@/lib/formatters';
import { Badge } from './Badge';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  category?: string;
  badgeVariant?: 'slate' | 'green' | 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' | 'indigo' | 'purple';
  icon?: React.ReactNode;
  iconBgColor?: string;
  authorName?: string;
  authorAvatar?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface TimelineProps {
  items: TimelineItem[];
  emptyMessage?: string;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  emptyMessage = 'No activity entries recorded.',
  className = '',
}) => {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="relative group">
          {/* Timeline node icon / bullet */}
          <div
            className="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center text-white"
            style={{ backgroundColor: item.iconBgColor || '#086A92' }}
          >
            {item.icon ? (
              <span className="w-2.5 h-2.5 flex items-center justify-center">{item.icon}</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>

          {/* Timeline item card */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#086A92] hover:shadow-2xs transition-all text-xs sm:text-sm space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base">{item.title}</span>
                {item.category && (
                  <Badge variant={item.badgeVariant || 'blue'} size="xs">
                    {item.category}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {formatDate(item.date)}
              </span>
            </div>

            {item.description && (
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{item.description}</p>
            )}

            {(item.authorName || item.action) && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs sm:text-sm">
                {item.authorName ? (
                  <span className="text-slate-500">
                    By <strong className="text-slate-700">{item.authorName}</strong>
                  </span>
                ) : <span />}

                {item.action && (
                  <button
                    onClick={item.action.onClick}
                    className="text-[#086A92] font-semibold hover:underline"
                  >
                    {item.action.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
