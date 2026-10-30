import React from 'react';
import { cn } from '@/utils/cn';
import type { SystemStatus } from '@/types';
import { STATUS_META } from '@/data/constants';

interface StatusIndicatorProps {
  status: SystemStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: boolean;
  pulse?: boolean;
}

const sizeMap = {
  sm: { dot: 'w-2 h-2', text: 'text-xs', ring: 'w-6 h-6' },
  md: { dot: 'w-3 h-3', text: 'text-sm', ring: 'w-10 h-10' },
  lg: { dot: 'w-4 h-4', text: 'text-base', ring: 'w-14 h-14' },
  xl: { dot: 'w-5 h-5', text: 'text-lg', ring: 'w-20 h-20' },
};

export function StatusIndicator({ status, size = 'md', label = true, pulse = true }: StatusIndicatorProps) {
  const meta = STATUS_META[status];
  const sizes = sizeMap[size];

  const dotColor = status === 'normal' ? 'bg-success-400' :
    status === 'warning' ? 'bg-warning-400' :
    status === 'critical' ? 'bg-danger-400' :
    status === 'offline' ? 'bg-slate-500' :
    'bg-primary-400';

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('relative flex items-center justify-center', sizes.ring)}>
        {pulse && status !== 'offline' && (
          <span className={cn('absolute inset-0 rounded-full opacity-20 animate-ping', dotColor)} style={{ animationDuration: '2s' }} />
        )}
        <span className={cn('relative rounded-full', sizes.dot, dotColor, status !== 'offline' && status !== 'normal' && 'animate-pulse')} />
      </div>
      {label && (
        <span className={cn('font-semibold tracking-wide', sizes.text, meta.color)}>
          {meta.label}
        </span>
      )}
    </div>
  );
}
