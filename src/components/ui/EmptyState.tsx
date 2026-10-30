import React from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 p-3 rounded-2xl bg-surface-200/50 text-slate-500">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      {description && (
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-400 rounded-full animate-spin" />
      <p className="mt-3 text-sm text-slate-400">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-3 p-3 rounded-2xl bg-danger-500/10 text-danger-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm text-slate-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm text-primary-400 hover:text-primary-300">
          Try again
        </button>
      )}
    </div>
  );
}
