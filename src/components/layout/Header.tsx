import React, { useState, useEffect } from 'react';
import { Menu, Bell, Mic, Settings, Wifi, WifiOff, Clock } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Badge } from '@/components/ui/Badge';
import { PAGE_TITLES } from '@/data/constants';
import { cn } from '@/utils/cn';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { systemStatus, isDemo, connectionStatus, activeAlertCount, mode, setMode } = useVaxGuard();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = connectionStatus === 'connected';
  const pageTitle = PAGE_TITLES[window.location.hash.replace('#', '')] || PAGE_TITLES['command-center'];

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-surface-300/20">
      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Menu + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-200/50 text-slate-400"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-bold text-slate-100 truncate">
                {pageTitle.title}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">{pageTitle.subtitle}</p>
            </div>
          </div>

          {/* Right: Status + Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Status indicator */}
            <div className="hidden md:flex items-center">
              <StatusIndicator status={systemStatus} size="sm" />
            </div>

            {/* Connection */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-200/40 border border-surface-300/20">
              {isOnline ? (
                <Wifi size={14} className="text-success-400" />
              ) : (
                <WifiOff size={14} className="text-slate-500" />
              )}
              <span className={cn('text-xs font-medium', isOnline ? 'text-success-400' : 'text-slate-500')}>
                {isOnline ? 'ONLINE' : connectionStatus === 'not_configured' ? 'NOT CONFIGURED' : 'OFFLINE'}
              </span>
            </div>

            {/* Mode toggle */}
            <button
              onClick={() => setMode(isDemo ? 'live' : 'demo')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200',
                isDemo
                  ? 'bg-accent-500/10 text-accent-400 border-accent-500/30 hover:bg-accent-500/20'
                  : 'bg-success-500/10 text-success-400 border-success-500/30 hover:bg-success-500/20'
              )}
              title={`Switch to ${isDemo ? 'LIVE HARDWARE' : 'DEMO LAB'} mode`}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', isDemo ? 'bg-accent-400' : 'bg-success-400 animate-pulse')} />
              <span className="hidden sm:inline">{isDemo ? 'DEMO' : 'LIVE'}</span>
            </button>

            {/* Alerts bell */}
            <button
              className="relative p-2 rounded-lg hover:bg-surface-200/50 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {activeAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-danger-500 text-white">
                  {activeAlertCount > 9 ? '9+' : activeAlertCount}
                </span>
              )}
            </button>

            {/* Voice */}
            <button
              className="p-2 rounded-lg hover:bg-surface-200/50 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Voice assistant"
            >
              <Mic size={18} />
            </button>

            {/* Time */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-200/40 border border-surface-300/20">
              <Clock size={14} className="text-slate-500" />
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
