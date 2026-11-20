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
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#086A92] text-white hover:bg-[#065575] focus:ring-[#086A92]/40 shadow-xs active:scale-[0.99]',
    teal:
      'bg-[#008C91] text-white hover:bg-[#007377] focus:ring-[#008C91]/40 shadow-xs active:scale-[0.99]',
    success:
      'bg-[#35B84A] text-white hover:bg-[#2da040] focus:ring-[#35B84A]/40 shadow-xs active:scale-[0.99]',
    secondary:
      'bg-[#EAF5F8] text-[#086A92] hover:bg-[#d8ecf2] focus:ring-[#086A92]/30',
    outline:
      'border border-[#E4EAEC] text-[#17313A] bg-white hover:bg-[#F7FAFA] hover:border-[#cbd7da] focus:ring-[#086A92]/20 shadow-2xs',
    danger:
      'bg-[#DC2626] text-white hover:bg-[#b91c1c] focus:ring-[#DC2626]/40 shadow-xs',
    ghost:
      'text-[#6B7C83] hover:bg-[#EAF5F8] hover:text-[#086A92] focus:ring-[#086A92]/20',
  };

  const sizes = {
    xs: 'px-2 py-1 text-[11px] gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs font-semibold gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold gap-2.5',
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
