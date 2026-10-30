import React from 'react';
import { cn } from '@/utils/cn';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

const colorMap = {
  primary: 'accent-primary-500',
  success: 'accent-success-500',
  warning: 'accent-warning-500',
  danger: 'accent-danger-500',
};

export function Slider({ label, value, min, max, step = 1, unit, onChange, color = 'primary', disabled }: SliderProps) {
  return (
    <div className={cn('space-y-2', disabled && 'opacity-50')}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
        <span className="text-sm font-semibold text-slate-200 tabular-nums">
          {value}{unit && ` ${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full h-1.5 rounded-full appearance-none cursor-pointer bg-surface-300/40',
          colorMap[color],
          disabled && 'cursor-not-allowed'
        )}
        style={{
          background: `linear-gradient(to right, var(--tw-gradient-from, currentColor) ${(value - min) / (max - min) * 100}%, rgb(30 41 59 / 0.4) ${(value - min) / (max - min) * 100}%)`,
        }}
      />
    </div>
  );
}
