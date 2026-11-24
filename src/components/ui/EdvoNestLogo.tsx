import React from 'react';

export interface EdvoNestLogoProps {
  variant?: 'full' | 'compact' | 'icon-only' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const EdvoNestLogo: React.FC<EdvoNestLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  const iconSizes = {
    sm: { w: 32, h: 32 },
    md: { w: 42, h: 42 },
    lg: { w: 56, h: 56 },
    xl: { w: 76, h: 76 },
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const tagSizes = {
    sm: 'text-[9.5px] tracking-[0.16em]',
    md: 'text-[11px] tracking-[0.18em]',
    lg: 'text-xs tracking-[0.2em]',
    xl: 'text-sm tracking-[0.22em]',
  };

  const { w, h } = iconSizes[size];

  // SVG Icon element matching official EdvoNest geometry in Deep Professional Red & Rich Red
  const LogoIcon = (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-all duration-300 drop-shadow-xs"
    >
      <defs>
        {/* Cap Red Gradient */}
        <linearGradient id="edvoCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#990000" />
          <stop offset="60%" stopColor="#C00000" />
          <stop offset="100%" stopColor="#E00000" />
        </linearGradient>

        {/* Head Dark Red Gradient */}
        <linearGradient id="edvoHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C00000" />
          <stop offset="50%" stopColor="#990000" />
          <stop offset="100%" stopColor="#660000" />
        </linearGradient>

        {/* Left Book Wing Gradient */}
        <linearGradient id="edvoLeftWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#990000" />
          <stop offset="50%" stopColor="#C00000" />
          <stop offset="100%" stopColor="#E00000" />
        </linearGradient>

        {/* Right Book Wing Gradient */}
        <linearGradient id="edvoRightWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C00000" />
          <stop offset="50%" stopColor="#990000" />
          <stop offset="100%" stopColor="#800000" />
        </linearGradient>
      </defs>

      {/* 1. Graduation Cap (Top Diamond) */}
      <path
        d="M100 26 L174 54 L100 82 L26 54 Z"
        fill="url(#edvoCapGrad)"
        filter="drop-shadow(0 2px 4px rgba(153,0,0,0.25))"
      />
      {/* Cap Under-Band Neck */}
      <path
        d="M62 68 L100 83 L138 68 L143 78 C143 91 124 101 100 101 C76 101 57 91 57 78 Z"
        fill="#800000"
        opacity="0.95"
      />
      {/* Cap Central Button */}
      <circle cx="100" cy="54" r="4" fill="#FFFFFF" />
      {/* Tassel String & Pendant */}
      <path
        d="M100 54 Q154 62 154 84 L154 98"
        stroke="#990000"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="151" y="96" width="6" height="12" rx="3" fill="#990000" />

      {/* 2. Graduate Head Circle (Center) */}
      <circle cx="100" cy="98" r="18" fill="url(#edvoHeadGrad)" />

      {/* 3. Open Book & Knowledge Wings */}
      <path
        d="M100 172 C96 150 78 120 40 105 C60 118 78 138 85 160 Z"
        fill="#990000"
      />
      <path
        d="M100 172 C104 150 122 120 160 105 C140 118 122 138 115 160 Z"
        fill="#C00000"
      />

      {/* Upper Central Radiating Wings */}
      <path
        d="M100 162 C90 135 65 112 24 116 C48 102 78 108 96 142 Z"
        fill="url(#edvoLeftWingGrad)"
      />
      <path
        d="M100 162 C110 135 135 112 176 116 C152 102 122 108 104 142 Z"
        fill="url(#edvoRightWingGrad)"
      />

      {/* Lower Main Book Pages */}
      <path
        d="M100 176 C72 152 42 144 8 152 C28 132 64 128 98 160 Z"
        fill="#800000"
      />
      <path
        d="M100 176 C128 152 158 144 192 152 C172 132 136 128 102 160 Z"
        fill="url(#edvoRightWingGrad)"
      />

      {/* Center V-Point Stem */}
      <path
        d="M96 160 L100 180 L104 160 Z"
        fill="#990000"
      />
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white border border-[#E5E5E5] shadow-2xs select-none hover:border-[#990000]/40 transition-all ${className}`}
      >
        <div className="p-1 rounded-lg bg-red-50 border border-red-100 shrink-0">
          {LogoIcon}
        </div>
        <div className="flex flex-col justify-center">
          <div className={`font-black ${textSizes[size]} tracking-tight leading-none flex items-baseline`}>
            <span className="text-[#990000]">Edvo</span>
            <span className="text-[#171717]">Nest</span>
          </div>
          {showTagline && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#990000]" />
              <span className={`font-bold ${tagSizes[size]} text-[#525252] uppercase`}>
                LEARN • GROW • SUCCEED
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {LogoIcon}
      <div className="flex flex-col justify-center">
        {/* Brand Name */}
        <div className={`font-black ${textSizes[size]} tracking-tight leading-none flex items-baseline`}>
          <span className="text-[#990000]">Edvo</span>
          <span className="text-[#171717]">Nest</span>
        </div>

        {/* Tagline */}
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#990000]" />
            <span className={`font-bold ${tagSizes[size]} text-[#525252] uppercase`}>
              LEARN • GROW • SUCCEED
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
