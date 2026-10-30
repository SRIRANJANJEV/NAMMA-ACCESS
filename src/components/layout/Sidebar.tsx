import React from 'react';
import {
  LayoutDashboard, Activity, Thermometer, Waves, BrainCircuit, Mic,
  ShieldAlert, Siren, GitCommitVertical, ScrollText, Cpu, Wifi,
  Stethoscope, FlaskConical, Settings, Info, Shield, X,
} from 'lucide-react';
import { NAV_GROUPS } from '@/data/constants';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { cn } from '@/utils/cn';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Activity: <Activity size={18} />,
  Thermometer: <Thermometer size={18} />,
  Waves: <Waves size={18} />,
  BrainCircuit: <BrainCircuit size={18} />,
  Mic: <Mic size={18} />,
  ShieldAlert: <ShieldAlert size={18} />,
  Siren: <Siren size={18} />,
  GitCommitVertical: <GitCommitVertical size={18} />,
  ScrollText: <ScrollText size={18} />,
  Cpu: <Cpu size={18} />,
  Wifi: <Wifi size={18} />,
  Stethoscope: <Stethoscope size={18} />,
  FlaskConical: <FlaskConical size={18} />,
  Settings: <Settings size={18} />,
  Info: <Info size={18} />,
};

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onNavigate, open, onClose }: SidebarProps) {
  const { systemStatus, isDemo, activeAlertCount } = useVaxGuard();

  const statusColor = systemStatus === 'normal' ? 'bg-success-400' :
    systemStatus === 'warning' ? 'bg-warning-400' :
    systemStatus === 'critical' ? 'bg-danger-400 animate-pulse' :
    systemStatus === 'offline' ? 'bg-slate-500' :
    'bg-primary-400';

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-surface-0/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 lg:z-auto',
          'w-64 h-screen flex flex-col',
          'glass-strong border-r border-surface-300/20',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-300/15">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Shield size={20} className="text-white" />
              </div>
              <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-100', statusColor)} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-tight">VaxGuard</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Cold-Chain Guardian</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-200 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="mb-4">
              {group.label && (
                <p className="px-5 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5 px-3">
                {group.items.map(item => {
                  const isActive = currentPage === item.id;
                  const showBadge = item.id === 'alerts' && activeAlertCount > 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        'group relative',
                        isActive
                          ? 'bg-primary-500/15 text-primary-300'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-200/40'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary-400" />
                      )}
                      <span className={cn('transition-transform duration-200', isActive && 'scale-110')}>
                        {iconMap[item.icon]}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {showBadge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-danger-500/20 text-danger-400">
                          {activeAlertCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Mode indicator */}
        <div className="px-3 py-3 border-t border-surface-300/15">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold',
            isDemo ? 'bg-accent-500/10 text-accent-400' : 'bg-success-500/10 text-success-400'
          )}>
            <span className={cn('w-2 h-2 rounded-full', isDemo ? 'bg-accent-400' : 'bg-success-400 animate-pulse')} />
            {isDemo ? 'DEMO LAB MODE' : 'LIVE HARDWARE'}
          </div>
        </div>
      </aside>
    </>
  );
}
