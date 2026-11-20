'use client';

import React from 'react';
import { formatDate } from '@/lib/formatters';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface ActivityFeedItem {
  id: string;
  actorName: string;
  actorAvatar?: string | null;
  actorRole?: string;
  action: string;
  target?: string;
  description?: string;
  timestamp: Date | string;
  category?: string;
  badgeVariant?: 'slate' | 'green' | 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' | 'indigo' | 'purple';
  icon?: React.ReactNode;
  link?: string;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  emptyMessage = 'No recent activities recorded.',
  maxItems,
  className = '',
}) => {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  if (displayItems.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`divide-y divide-slate-100 ${className}`}>
      {displayItems.map((item) => (
        <div
          key={item.id}
          className="py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors rounded-xl px-2"
        >
          <Avatar
            src={item.actorAvatar}
            name={item.actorName}
            size="sm"
            shape="circle"
          />

          <div className="min-w-0 flex-1 space-y-0.5 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-slate-800 leading-snug">
                <strong className="font-bold text-slate-900">{item.actorName}</strong>{' '}
                <span className="text-slate-600">{item.action}</span>{' '}
                {item.target && <strong className="text-slate-900 font-semibold">{item.target}</strong>}
              </p>

              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {formatDate(item.timestamp, 'dd MMM, hh:mm a')}
              </span>
            </div>

            {item.description && (
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              {item.category && (
                <Badge variant={item.badgeVariant || 'blue'} size="xs">
                  {item.category}
                </Badge>
              )}
              {item.actorRole && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.actorRole.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
