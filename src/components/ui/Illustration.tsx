'use client';

import React from 'react';

export type IllustrationVariant =
  | 'no-students'
  | 'no-homework'
  | 'no-transactions'
  | 'no-events'
  | 'no-books'
  | 'no-bus'
  | 'no-notifications'
  | 'no-search'
  | 'achievement-trophy'
  | 'campus-welcome'
  | 'ai-tutor';

export interface IllustrationProps {
  variant: IllustrationVariant;
  size?: number | string;
  className?: string;
}

export const Illustration: React.FC<IllustrationProps> = ({
  variant,
  size = 140,
  className = '',
}) => {
  const width = size;
  const height = size;

  switch (variant) {
    case 'no-students':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          {/* Ambient soft glow */}
          <circle cx="80" cy="80" r="64" fill="#FEF2F2" />
          <circle cx="80" cy="80" r="48" fill="#D4ECF2" opacity="0.6" />
          {/* Desk / Base platform */}
          <path
            d="M32 114C32 111.791 33.7909 110 36 110H124C126.209 110 128 111.791 128 114V116H32V114Z"
            fill="#171717"
          />
          <rect x="46" y="116" width="6" height="18" rx="2" fill="#737373" />
          <rect x="108" y="116" width="6" height="18" rx="2" fill="#737373" />
          {/* Open Notebook */}
          <path
            d="M50 102C50 99.7909 51.7909 98 54 98H78V106H50V102Z"
            fill="#FFFFFF"
            stroke="#990000"
            strokeWidth="2"
          />
          <path
            d="M82 98H106C108.209 98 110 99.7909 110 102V106H82V98Z"
            fill="#FFFFFF"
            stroke="#990000"
            strokeWidth="2"
          />
          {/* Graduation Cap */}
          <path
            d="M80 50L116 66L80 82L44 66L80 50Z"
            fill="#990000"
          />
          <path
            d="M80 82V98C80 101.314 74.6274 104 68 104C61.3726 104 56 101.314 56 98V82"
            stroke="#C00000"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Cap tassel */}
          <path d="M106 70V86" stroke="#35B84A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="106" cy="88" r="3" fill="#35B84A" />
          {/* Sparkling Stars */}
          <path d="M124 52L125.5 56.5L130 58L125.5 59.5L124 64L122.5 59.5L118 58L122.5 56.5L124 52Z" fill="#D97706" />
          <path d="M38 72L39 75L42 76L39 77L38 80L37 77L34 76L37 75L38 72Z" fill="#35B84A" />
        </svg>
      );

    case 'no-homework':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#EAF8EC" />
          {/* Clipboard board */}
          <rect x="44" y="38" width="72" height="92" rx="10" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="3" />
          {/* Clipboard Top Clip */}
          <rect x="62" y="30" width="36" height="14" rx="4" fill="#990000" />
          <circle cx="80" cy="37" r="2.5" fill="#FFFFFF" />
          {/* Form / Task Lines */}
          <rect x="66" y="58" width="36" height="5" rx="2.5" fill="#E5E5E5" />
          <rect x="66" y="74" width="40" height="5" rx="2.5" fill="#E5E5E5" />
          <rect x="66" y="90" width="28" height="5" rx="2.5" fill="#E5E5E5" />
          {/* Big Checkmark */}
          <circle cx="54" cy="60.5" r="5" fill="#35B84A" />
          <path d="M52 60.5L53.5 62L56.5 59" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="54" cy="76.5" r="5" fill="#35B84A" />
          <path d="M52 76.5L53.5 78L56.5 75" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="54" cy="92.5" r="5" fill="#E5E5E5" />
          {/* Floating Pencil */}
          <path
            d="M110 102L126 118L122 122L106 106L110 102Z"
            fill="#D97706"
          />
          <path d="M106 106L102 110L103 105L106 106Z" fill="#171717" />
          <circle cx="125" cy="50" r="3" fill="#35B84A" />
        </svg>
      );

    case 'no-transactions':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#FEF3C7" opacity="0.6" />
          {/* Ledger Receipt Paper */}
          <path
            d="M48 40C48 37.7909 49.7909 36 52 36H108C110.209 36 112 37.7909 112 40V124L104 118L96 124L88 118L80 124L72 118L64 124L56 118L48 124V40Z"
            fill="#FFFFFF"
            stroke="#E5E5E5"
            strokeWidth="3"
          />
          {/* Receipt Lines */}
          <rect x="60" y="52" width="40" height="5" rx="2.5" fill="#990000" opacity="0.8" />
          <rect x="60" y="66" width="30" height="4" rx="2" fill="#E5E5E5" />
          <rect x="60" y="76" width="36" height="4" rx="2" fill="#E5E5E5" />
          <rect x="60" y="86" width="24" height="4" rx="2" fill="#E5E5E5" />
          {/* Stamp / Rupee Badge */}
          <circle cx="94" cy="98" r="16" fill="#35B84A" />
          <path
            d="M89 93H99M89 97H99M93 93V103M93 103C96 103 98 101.5 98 99"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'no-events':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#FEF2F2" />
          {/* Calendar Body */}
          <rect x="42" y="44" width="76" height="80" rx="12" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="3" />
          {/* Calendar Header Bar */}
          <path
            d="M42 56C42 49.3726 47.3726 44 54 44H106C112.627 44 118 49.3726 118 56V66H42V56Z"
            fill="#990000"
          />
          {/* Binder Rings */}
          <rect x="56" y="36" width="6" height="14" rx="3" fill="#171717" />
          <rect x="98" y="36" width="6" height="14" rx="3" fill="#171717" />
          {/* Grid dots */}
          <circle cx="58" cy="80" r="3.5" fill="#E5E5E5" />
          <circle cx="74" cy="80" r="3.5" fill="#E5E5E5" />
          <circle cx="90" cy="80" r="3.5" fill="#E5E5E5" />
          <circle cx="104" cy="80" r="3.5" fill="#E5E5E5" />
          <circle cx="58" cy="96" r="3.5" fill="#E5E5E5" />
          <circle cx="74" cy="96" r="3.5" fill="#35B84A" />
          <circle cx="90" cy="96" r="3.5" fill="#E5E5E5" />
          <circle cx="104" cy="96" r="3.5" fill="#E5E5E5" />
          {/* Ribbon Star */}
          <path
            d="M74 96L75.5 92L79 93L76.5 96L78.5 99.5L75 98L73.5 101.5L73 97.5L69.5 96L73 94.5L74 96Z"
            fill="#35B84A"
          />
        </svg>
      );

    case 'no-books':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#EAF8EC" />
          {/* Shelf Line */}
          <rect x="30" y="112" width="100" height="6" rx="3" fill="#171717" />
          {/* Book 1 (Blue) */}
          <rect x="42" y="60" width="16" height="52" rx="3" fill="#990000" />
          <rect x="45" y="68" width="10" height="2" fill="#FFFFFF" opacity="0.8" />
          {/* Book 2 (Teal) */}
          <rect x="62" y="50" width="18" height="62" rx="3" fill="#C00000" />
          <rect x="65" y="60" width="12" height="3" fill="#FFFFFF" opacity="0.8" />
          {/* Book 3 (Green) */}
          <rect x="84" y="68" width="14" height="44" rx="3" fill="#35B84A" />
          {/* Leaning Book (Amber) */}
          <g transform="rotate(18 104 112)">
            <rect x="100" y="58" width="14" height="54" rx="3" fill="#D97706" />
          </g>
          {/* Bookmark ribbon */}
          <path d="M70 50V36L74 40L78 36V50" fill="#D97706" />
        </svg>
      );

    case 'no-bus':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#FEF3C7" opacity="0.6" />
          {/* Road */}
          <path d="M26 122H134" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
          <path d="M46 122H60M74 122H88M102 122H116" stroke="#FFFFFF" strokeWidth="2" />
          {/* Bus Body */}
          <rect x="36" y="56" width="88" height="52" rx="10" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          {/* Roof Line */}
          <rect x="44" y="50" width="72" height="6" rx="3" fill="#D97706" />
          {/* Windows */}
          <rect x="44" y="64" width="18" height="18" rx="3" fill="#FEF2F2" stroke="#990000" strokeWidth="1.5" />
          <rect x="68" y="64" width="18" height="18" rx="3" fill="#FEF2F2" stroke="#990000" strokeWidth="1.5" />
          <rect x="92" y="64" width="22" height="18" rx="3" fill="#FEF2F2" stroke="#990000" strokeWidth="1.5" />
          {/* Bus Wheels */}
          <circle cx="56" cy="110" r="10" fill="#171717" />
          <circle cx="56" cy="110" r="4" fill="#E5E5E5" />
          <circle cx="104" cy="110" r="10" fill="#171717" />
          <circle cx="104" cy="110" r="4" fill="#E5E5E5" />
          {/* GPS Pin */}
          <path
            d="M80 24C73.3726 24 68 29.3726 68 36C68 44 80 54 80 54C80 54 92 44 92 36C92 29.3726 86.6274 24 80 24Z"
            fill="#35B84A"
          />
          <circle cx="80" cy="35" r="4" fill="#FFFFFF" />
        </svg>
      );

    case 'no-notifications':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#FEF2F2" />
          {/* Sound waves */}
          <path d="M42 66C38 72 38 88 42 94" stroke="#C00000" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          <path d="M118 66C122 72 122 88 118 94" stroke="#C00000" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          {/* Bell Body */}
          <path
            d="M80 42C67.8497 42 58 51.8497 58 64V88L50 96V100H110V96L102 88V64C102 51.8497 92.1503 42 80 42Z"
            fill="#990000"
          />
          {/* Bell Top Knob */}
          <circle cx="80" cy="38" r="4" fill="#C00000" />
          {/* Clapper */}
          <path
            d="M72 104C72 108.418 75.5817 112 80 112C84.4183 112 88 108.418 88 104H72Z"
            fill="#35B84A"
          />
          {/* Little green notification dot */}
          <circle cx="102" cy="46" r="6" fill="#35B84A" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );

    case 'no-search':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#F5F5F5" />
          <rect x="42" y="38" width="76" height="90" rx="8" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="2.5" />
          <rect x="54" y="52" width="52" height="4" rx="2" fill="#E5E5E5" />
          <rect x="54" y="64" width="44" height="4" rx="2" fill="#E5E5E5" />
          <rect x="54" y="76" width="36" height="4" rx="2" fill="#E5E5E5" />
          {/* Large Magnifying Glass */}
          <circle cx="94" cy="94" r="24" fill="#FEF2F2" stroke="#990000" strokeWidth="4" />
          <path d="M112 112L132 132" stroke="#990000" strokeWidth="5" strokeLinecap="round" />
          {/* Sparkles */}
          <path d="M88 88L90 92L94 94L90 96L88 100L86 96L82 94L86 92L88 88Z" fill="#35B84A" />
        </svg>
      );

    case 'achievement-trophy':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#FEF3C7" opacity="0.6" />
          {/* Trophy Cup */}
          <path
            d="M52 46H108V74C108 89.464 95.464 102 80 102C64.536 102 52 89.464 52 74V46Z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="3"
          />
          {/* Handles */}
          <path
            d="M52 52H38C34 52 32 55 32 60C32 72 40 78 52 78"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M108 52H122C126 52 128 55 128 60C128 72 120 78 108 78"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Stem & Base */}
          <rect x="74" y="102" width="12" height="14" fill="#D97706" />
          <path
            d="M56 116C56 114 58 112 60 112H100C102 112 104 114 104 116V124H56V116Z"
            fill="#171717"
          />
          {/* Star Emblem */}
          <path
            d="M80 62L82.5 69.5L90 70L84.5 74.5L86.5 82L80 77.5L73.5 82L75.5 74.5L70 70L77.5 69.5L80 62Z"
            fill="#FFFFFF"
          />
          {/* Green Emerald Ribbon */}
          <path d="M72 124V134L80 128L88 134V124H72Z" fill="#35B84A" />
        </svg>
      );

    case 'campus-welcome':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#FEF2F2" />
          {/* Ground */}
          <path d="M24 126H136" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
          {/* Main Central Tower */}
          <rect x="64" y="54" width="32" height="72" fill="#990000" rx="2" />
          {/* Clock face */}
          <circle cx="80" cy="72" r="7" fill="#FFFFFF" />
          <path d="M80 68V72H83" stroke="#990000" strokeWidth="1.5" strokeLinecap="round" />
          {/* Spire / Roof */}
          <path d="M60 54L80 32L100 54H60Z" fill="#C00000" />
          {/* Flag */}
          <path d="M80 32V24H90L86 28L90 32H80" fill="#35B84A" stroke="#35B84A" strokeWidth="1.5" />
          {/* Left Wing */}
          <rect x="36" y="80" width="28" height="46" fill="#D4ECF2" stroke="#990000" strokeWidth="2" />
          <rect x="42" y="88" width="6" height="8" rx="1" fill="#990000" />
          <rect x="52" y="88" width="6" height="8" rx="1" fill="#990000" />
          <rect x="42" y="104" width="6" height="8" rx="1" fill="#990000" />
          <rect x="52" y="104" width="6" height="8" rx="1" fill="#990000" />
          {/* Right Wing */}
          <rect x="96" y="80" width="28" height="46" fill="#D4ECF2" stroke="#990000" strokeWidth="2" />
          <rect x="102" y="88" width="6" height="8" rx="1" fill="#990000" />
          <rect x="112" y="88" width="6" height="8" rx="1" fill="#990000" />
          <rect x="102" y="104" width="6" height="8" rx="1" fill="#990000" />
          <rect x="112" y="104" width="6" height="8" rx="1" fill="#990000" />
          {/* Main Entrance Door */}
          <path d="M74 126V112C74 109.791 75.7909 108 78 108H82C84.2091 108 86 109.791 86 112V126H74Z" fill="#171717" />
        </svg>
      );

    case 'ai-tutor':
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 ${className}`}
        >
          <circle cx="80" cy="80" r="64" fill="#EAF8EC" />
          {/* Open Book */}
          <path
            d="M38 102C48 98 68 96 80 102C92 96 112 98 122 102V68C112 64 92 62 80 68C68 62 48 64 38 68V102Z"
            fill="#FFFFFF"
            stroke="#990000"
            strokeWidth="3"
          />
          <path d="M80 68V102" stroke="#990000" strokeWidth="2.5" />
          {/* AI Glowing Spark */}
          <path
            d="M80 26L84 42L100 46L84 50L80 66L76 50L60 46L76 42L80 26Z"
            fill="#35B84A"
          />
          <circle cx="80" cy="46" r="3" fill="#FFFFFF" />
          {/* Little Stars */}
          <circle cx="56" cy="38" r="2.5" fill="#D97706" />
          <circle cx="106" cy="40" r="2" fill="#C00000" />
        </svg>
      );

    default:
      return null;
  }
};
