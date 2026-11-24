'use client';

import React, { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  house?: string;
  className?: string;
  badge?: React.ReactNode;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl font-black',
};

const STATUS_COLOR_MAP = {
  online: 'bg-[#35B84A] border-white',
  offline: 'bg-slate-400 border-white',
  away: 'bg-amber-400 border-white',
  busy: 'bg-rose-500 border-white',
};

const HOUSE_RING_MAP: Record<string, string> = {
  emerald: 'ring-2 ring-emerald-500 ring-offset-2',
  ruby: 'ring-2 ring-rose-500 ring-offset-2',
  sapphire: 'ring-2 ring-blue-500 ring-offset-2',
  topaz: 'ring-2 ring-amber-500 ring-offset-2',
};

const GRADIENTS = [
  'from-[#990000] to-[#C00000]',
  'from-[#800000] to-[#990000]',
  'from-[#171717] to-[#990000]',
  'from-[#B45309] to-[#D97706]',
  'from-[#4F46E5] to-[#7C3AED]',
  'from-[#0D9488] to-[#10B981]',
];

function getInitials(name: string): string {
  if (!name || !name.trim()) return 'EN';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  house,
  className = '',
  badge,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const initials = getInitials(name);
  const gradient = getGradient(name);

  const houseRing = house ? HOUSE_RING_MAP[house.toLowerCase()] || '' : '';

  const hasImage = !!src && !imageFailed;

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      <div
        className={`${sizeClass} ${shapeClass} ${houseRing} relative overflow-hidden flex items-center justify-center font-bold text-white shadow-2xs transition-transform duration-200 hover:scale-105`}
        title={name}
      >
        {hasImage ? (
          <img
            src={src!}
            alt={alt || name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center tracking-tight shadow-inner`}
          >
            <span>{initials}</span>
          </div>
        )}
      </div>

      {/* Online / Activity Status Dot */}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${STATUS_COLOR_MAP[status]}`}
          title={`Status: ${status}`}
        />
      )}

      {/* Custom badge (e.g. verified or role icon) */}
      {badge && (
        <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
          {badge}
        </div>
      )}
    </div>
  );
};
