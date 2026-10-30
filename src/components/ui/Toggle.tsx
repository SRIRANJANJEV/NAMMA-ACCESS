import React from 'react';
import { cn } from '@/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, size = 'md', disabled }: ToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center justify-between gap-3">
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="text-sm font-medium text-slate-200">{label}</p>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          'focus-visible:ring-2 focus-visible:ring-primary-500/50',
          s.track,
          checked ? 'bg-primary-500' : 'bg-surface-400/60',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block transform rounded-full bg-white shadow-md transition-transform duration-200',
            s.thumb,
            checked ? s.translate : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}
