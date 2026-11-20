import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'slate' | 'green' | 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' | 'indigo' | 'purple';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'slate',
  size = 'sm',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full border leading-none';

  const variants = {
    slate: 'bg-[#F1F5F7] text-[#4A5D65] border-[#E4EAEC]',
    green: 'bg-[#EAF8EC] text-[#16A34A] border-[#bbf0c5]',
    emerald: 'bg-[#EAF8EC] text-[#16A34A] border-[#bbf0c5]',
    teal: 'bg-[#E0F5F5] text-[#008C91] border-[#b6e8ea]',
    blue: 'bg-[#EAF5F8] text-[#086A92] border-[#c0e3ed]',
    amber: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    rose: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    indigo: 'bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FF]',
    purple: 'bg-[#FAF5FF] text-[#7E22CE] border-[#F3E8FF]',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[9.5px]',
    sm: 'px-2 py-0.5 text-[10.5px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
