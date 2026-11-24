import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'teal';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#990000] text-white hover:bg-[#800000] focus:ring-[#990000]/40 shadow-xs active:scale-[0.99]',
    teal:
      'bg-[#C00000] text-white hover:bg-[#A00000] focus:ring-[#C00000]/40 shadow-xs active:scale-[0.99]',
    success:
      'bg-[#C00000] text-white hover:bg-[#A00000] focus:ring-[#C00000]/40 shadow-xs active:scale-[0.99]',
    secondary:
      'bg-[#F5F5F5] text-[#171717] hover:bg-[#E5E5E5] focus:ring-[#990000]/20 border border-[#E5E5E5]',
    outline:
      'border border-[#E5E5E5] text-[#171717] bg-white hover:bg-[#F5F5F5] hover:border-[#D4D4D4] focus:ring-[#990000]/20 shadow-2xs',
    danger:
      'bg-[#990000] text-white hover:bg-[#800000] focus:ring-[#990000]/40 shadow-xs',
    ghost:
      'text-[#525252] hover:bg-red-50 hover:text-[#990000] focus:ring-[#990000]/20',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-xs sm:text-sm font-medium gap-1.5',
    md: 'px-4 py-2 text-sm font-semibold gap-2',
    lg: 'px-6 py-3 text-base font-bold gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
