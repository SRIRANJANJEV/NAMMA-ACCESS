import React from 'react';
import { cn } from '@/utils/cn';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical' | 'offline' | 'info';
  trend?: string;
  subValue?: string;
  className?: string;
}

const statusColors = {
  normal: 'text-success-400',
  warning: 'text-warning-400',
  critical: 'text-danger-400',
  offline: 'text-slate-400',
  info: 'text-accent-400',
};

const statusBg = {
  normal: 'bg-success-500/10',
  warning: 'bg-warning-500/10',
  critical: 'bg-danger-500/10',
  offline: 'bg-slate-500/10',
  info: 'bg-accent-500/10',
};

export function StatCard({ label, value, unit, icon, status = 'info', trend, subValue, className }: StatCardProps) {
  return (
    <Card hover className={cn('p-4', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={cn('p-2 rounded-lg', statusBg[status])}>
            <div className={statusColors[status]}>{icon}</div>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-2xl font-bold tabular-nums', statusColors[status])}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {(trend || subValue) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          {trend && <span>{trend}</span>}
          {subValue && <span className="text-slate-600">·</span>}
          {subValue && <span>{subValue}</span>}
        </div>
      )}
    </Card>
  );
}
