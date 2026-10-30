import React from 'react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500/90 hover:bg-primary-500 text-white border-primary-400/50',
  secondary: 'bg-surface-200/80 hover:bg-surface-300 text-slate-200 border-surface-300/50',
  ghost: 'bg-transparent hover:bg-surface-200/50 text-slate-300 border-transparent',
  danger: 'bg-danger-500/90 hover:bg-danger-500 text-white border-danger-400/50',
  success: 'bg-success-500/90 hover:bg-success-500 text-white border-success-400/50',
  warning: 'bg-warning-500/90 hover:bg-warning-500 text-white border-warning-400/50',
  outline: 'bg-transparent hover:bg-surface-200/30 text-slate-300 border-surface-400/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export function Button({ variant = 'secondary', size = 'md', icon, loading = false, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-primary-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
}
