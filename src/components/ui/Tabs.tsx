import React, { useState } from 'react';
import { cn } from '@/utils/cn';

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id || '');

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div>
      <div className="flex gap-1 p-1 bg-surface-100/50 rounded-xl border border-surface-300/20 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
              active === tab.id
                ? 'bg-primary-500/20 text-primary-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-200/50'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {children(active)}
      </div>
    </div>
  );
}
