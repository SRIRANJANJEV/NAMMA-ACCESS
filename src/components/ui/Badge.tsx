import React from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-500/10 text-success-400 border-success-500/20',
  warning: 'bg-warning-500/10 text-warning-400 border-warning-500/20',
  danger: 'bg-danger-500/10 text-danger-400 border-danger-500/20',
  info: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
  neutral: 'bg-surface-300/20 text-slate-400 border-surface-300/30',
  primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-success-400',
  warning: 'bg-warning-400',
  danger: 'bg-danger-400',
  info: 'bg-accent-400',
  neutral: 'bg-slate-400',
  primary: 'bg-primary-400',
};

export function Badge({ variant = 'neutral', size = 'sm', dot = false, pulse = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant], pulse && 'animate-pulse')} />
      )}
      {children}
    </span>
  );
}
