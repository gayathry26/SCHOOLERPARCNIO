import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'slate' | 'green' | 'emerald' | 'teal' | 'blue' | 'amber' | 'rose' | 'indigo' | 'purple' | 'red' | 'dark-red';
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
    slate: 'bg-[#F5F5F5] text-[#171717] border-[#E5E5E5]',
    red: 'bg-red-50 text-[#990000] border-red-200',
    'dark-red': 'bg-[#990000] text-white border-[#800000]',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    teal: 'bg-red-50 text-[#990000] border-red-200', // Redirected from teal to brand red
    blue: 'bg-red-50 text-[#990000] border-red-200', // Redirected from blue to brand red
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-red-50 text-[#990000] border-red-200',
    indigo: 'bg-red-50 text-[#990000] border-red-200', // Redirected to brand red
    purple: 'bg-red-50 text-[#990000] border-red-200', // Redirected to brand red
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-bold',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
