import React from 'react';
import {
  Thermometer, Droplets, Waves, Cpu, Wifi, Siren, ShieldCheck,
  Activity, TrendingUp, TrendingDown, Minus, AlertTriangle,
} from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Badge } from '@/components/ui/Badge';
import { STATUS_META, DISCLAIMER } from '@/data/constants';
import { getTemperatureStats, getHumidityStats, timeAgo, formatDuration } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export function CommandCenter({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { telemetry, latestReading, systemStatus, isDemo, vibrationEvents, alerts, deviceInfo, activeAlertCount } = useVaxGuard();

  const tempStats = getTemperatureStats(telemetry);
  const humStats = getHumidityStats(telemetry);
  const meta = STATUS_META[systemStatus];

  const trendIcon = tempStats.trend === 'rising' ? <TrendingUp size={14} /> :
    tempStats.trend === 'falling' ? <TrendingDown size={14} /> :
    <Minus size={14} />;

  const tempStatus = latestReading ? (
    latestReading.temperature >= 2 && latestReading.temperature <= 8 ? 'normal' :
    latestReading.temperature > 10 || latestReading.temperature < 0 ? 'critical' : 'warning'
  ) : 'offline';

  const humStatus = latestReading ? (
    latestReading.humidity >= 30 && latestReading.humidity <= 70 ? 'normal' : 'warning'
  ) : 'offline';

  const vibStatus = vibrationEvents.length > 0 ? 'warning' : 'normal';

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary tracking-tight">VAXGUARD</h1>
          <p className="text-sm text-slate-400 mt-1">Intelligent Vaccine Cold-Chain Guardian</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isDemo ? 'info' : 'success'} dot pulse size="md">
            {isDemo ? 'DEMO DATA' : 'LIVE HARDWARE'}
          </Badge>
          <Badge variant="neutral" size="md">
            v1.0.0
          </Badge>
        </div>
      </div>

      {/* Central status display */}
      <Card variant="strong" className={cn('relative overflow-hidden', meta.glow)}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 radial-glow" />
        <CardBody className="relative">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Large status indicator */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Outer ring */}
                <div className={cn('w-32 h-32 rounded-full border-2 flex items-center justify-center', meta.border, meta.bg)}>
                  <div className={cn('w-24 h-24 rounded-full border flex items-center justify-center', meta.border)}>
                    <div className={cn('w-20 h-20 rounded-full flex items-center justify-center', meta.bg)}>
                      <span className={cn('text-2xl font-bold tracking-wider', meta.color)}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Pulse ring */}
                {systemStatus !== 'offline' && (
                  <div className={cn('absolute inset-0 rounded-full border-2 animate-ping opacity-20', meta.border)} style={{ animationDuration: '2s' }} />
                )}
              </div>
              <p className="mt-3 text-xs text-slate-500 uppercase tracking-widest">Overall System Status</p>
            </div>

            {/* Key metrics */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
              <CentralMetric
                icon={<Thermometer size={20} />}
                label="Temperature"
                value={latestReading ? `${latestReading.temperature}°C` : 'N/A'}
                status={tempStatus as 'normal' | 'warning' | 'critical' | 'offline'}
                trend={tempStats.trend}
              />
              <CentralMetric
                icon={<Droplets size={20} />}
                label="Humidity"
                value={latestReading ? `${latestReading.humidity}%` : 'N/A'}
                status={humStatus as 'normal' | 'warning' | 'critical' | 'offline'}
                trend={humStats.trend}
              />
              <CentralMetric
                icon={<Waves size={20} />}
                label="Vibration"
                value={vibrationEvents.length > 0 ? `${vibrationEvents.length} events` : 'No events'}
                status={vibStatus as 'normal' | 'warning' | 'critical' | 'offline'}
              />
              <CentralMetric
                icon={<Cpu size={20} />}
                label="Device"
                value={latestReading?.deviceOnline ? 'ONLINE' : 'OFFLINE'}
                status={latestReading?.deviceOnline ? 'normal' : 'offline'}
              />
              <CentralMetric
                icon={<Wifi size={20} />}
                label="Network"
                value={latestReading?.deviceOnline ? 'CONNECTED' : 'DISCONNECTED'}
                status={latestReading?.deviceOnline ? 'normal' : 'offline'}
              />
              <CentralMetric
                icon={<Siren size={20} />}
                label="Active Alerts"
                value={String(activeAlertCount)}
                status={activeAlertCount > 0 ? 'warning' : 'normal'}
              />
            </div>
          </div>

          {/* Last update */}
          <div className="mt-6 pt-4 border-t border-surface-300/15 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span>Last update: {latestReading ? timeAgo(latestReading.timestamp) : 'No data'}</span>
            <span>·</span>
            <span>Device: {deviceInfo.name}</span>
            <span>·</span>
            <span>Uptime: {formatDuration(deviceInfo.uptime)}</span>
          </div>
        </CardBody>
      </Card>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Temperature"
          value={latestReading ? latestReading.temperature : '—'}
          unit="°C"
          icon={<Thermometer size={16} />}
          status={tempStatus as 'normal' | 'warning' | 'critical' | 'offline'}
          trend={tempStats.trend}
          subValue={`Avg: ${tempStats.avg.toFixed(1)}°C`}
        />
        <StatCard
          label="Humidity"
          value={latestReading ? latestReading.humidity : '—'}
          unit="%"
          icon={<Droplets size={16} />}
          status={humStatus as 'normal' | 'warning' | 'critical' | 'offline'}
          trend={humStats.trend}
          subValue={`Avg: ${humStats.avg.toFixed(0)}%`}
        />
        <StatCard
          label="Vibration Events"
          value={vibrationEvents.length}
          icon={<Waves size={16} />}
          status={vibStatus as 'normal' | 'warning' | 'critical' | 'offline'}
          subValue={vibrationEvents.length > 0 ? `Last: ${timeAgo(vibrationEvents[0].timestamp)}` : 'No events'}
        />
        <StatCard
          label="Active Alerts"
          value={activeAlertCount}
          icon={<Siren size={16} />}
          status={activeAlertCount > 0 ? 'warning' : 'normal'}
          subValue={`${alerts.length} total logged`}
        />
      </div>

      {/* Cold-chain visualization */}
      <Card>
        <div className="px-5 py-4 border-b border-surface-300/15">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary-400" />
            Cold-Chain Visualization
          </h3>
        </div>
        <CardBody>
          <ColdChainViz
            temp={latestReading?.temperature ?? null}
            humidity={latestReading?.humidity ?? null}
            vibration={vibrationEvents.length > 0}
            deviceOnline={latestReading?.deviceOnline ?? false}
            status={systemStatus}
          />
        </CardBody>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Live Monitoring', page: 'live-monitoring', icon: <Activity size={18} /> },
          { label: 'Temperature Analytics', page: 'temperature', icon: <Thermometer size={18} /> },
          { label: 'Alerts & Incidents', page: 'alerts', icon: <Siren size={18} /> },
          { label: 'Demo Lab', page: 'demo-lab', icon: <ShieldCheck size={18} /> },
        ].map(link => (
          <button
            key={link.page}
            onClick={() => onNavigate(link.page)}
            className="flex items-center gap-3 p-4 rounded-xl glass hover:border-primary-500/30 hover:bg-surface-100/70 transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400 group-hover:scale-110 transition-transform">
              {link.icon}
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 text-center px-4">
        {DISCLAIMER}
      </p>
    </div>
  );
}

function CentralMetric({ icon, label, value, status, trend }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  trend?: string;
}) {
  const colors = {
    normal: 'text-success-400',
    warning: 'text-warning-400',
    critical: 'text-danger-400',
    offline: 'text-slate-500',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-200/30 border border-surface-300/15">
      <div className={cn('p-2 rounded-lg bg-surface-300/30', colors[status])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <p className={cn('text-sm font-semibold truncate', colors[status])}>{value}</p>
        {trend && <p className="text-[10px] text-slate-600 capitalize">{trend}</p>}
      </div>
    </div>
  );
}

function ColdChainViz({ temp, humidity, vibration, deviceOnline, status }: {
  temp: number | null;
  humidity: number | null;
  vibration: boolean;
  deviceOnline: boolean;
  status: string;
}) {
  const statusColor = status === 'normal' ? 'text-success-400' :
    status === 'warning' ? 'text-warning-400' :
    status === 'critical' ? 'text-danger-400' :
    status === 'offline' ? 'text-slate-500' : 'text-primary-400';

  const lineColor = status === 'normal' ? 'bg-success-400/40' :
    status === 'warning' ? 'bg-warning-400/40' :
    status === 'critical' ? 'bg-danger-400/40' :
    'bg-slate-500/30';

  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* ESP32 node */}
        <VizNode
          icon={<Cpu size={24} />}
          label="ESP32"
          sublabel="WROOM-32"
          active={deviceOnline}
          color={deviceOnline ? 'success' : 'slate'}
        />

        {/* Connection line */}
        <VizLine active={deviceOnline} color={lineColor} />

        {/* Sensors node */}
        <VizNode
          icon={<Activity size={24} />}
          label="Sensors"
          sublabel="DHT11 · SW-420"
          active={deviceOnline}
          color={deviceOnline ? 'primary' : 'slate'}
        />

        <VizLine active={deviceOnline} color={lineColor} />

        {/* VaxGuard node */}
        <VizNode
          icon={<ShieldCheck size={24} />}
          label="VaxGuard"
          sublabel="Web Platform"
          active={true}
          color="accent"
          large
        />

        <VizLine active={true} color={lineColor} />

        {/* Output node */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col gap-2">
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs', temp !== null ? 'bg-surface-200/40' : 'bg-surface-200/20')}>
              <Thermometer size={14} className={statusColor} />
              <span className="text-slate-300">{temp !== null ? `${temp}°C` : 'N/A'}</span>
            </div>
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs', humidity !== null ? 'bg-surface-200/40' : 'bg-surface-200/20')}>
              <Droplets size={14} className={statusColor} />
              <span className="text-slate-300">{humidity !== null ? `${humidity}%` : 'N/A'}</span>
            </div>
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs', vibration ? 'bg-warning-500/10' : 'bg-surface-200/40')}>
              <Waves size={14} className={vibration ? 'text-warning-400' : statusColor} />
              <span className="text-slate-300">{vibration ? 'Detected' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VizNode({ icon, label, sublabel, active, color, large }: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  color: string;
  large?: boolean;
}) {
  const colorMap: Record<string, string> = {
    success: 'border-success-500/40 bg-success-500/10 text-success-400',
    primary: 'border-primary-500/40 bg-primary-500/10 text-primary-400',
    accent: 'border-accent-500/40 bg-accent-500/10 text-accent-400',
    slate: 'border-slate-500/30 bg-slate-500/10 text-slate-500',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        'rounded-2xl border-2 flex items-center justify-center transition-all duration-300',
        large ? 'w-16 h-16' : 'w-14 h-14',
        colorMap[color],
        active && 'animate-pulse'
      )}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-200">{label}</p>
        <p className="text-[10px] text-slate-500">{sublabel}</p>
      </div>
    </div>
  );
}

function VizLine({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="hidden lg:block flex-1 max-w-[100px] relative">
      <div className={cn('h-0.5 rounded-full transition-all duration-500', active ? color : 'bg-slate-700/30')}>
        {active && (
          <div className={cn('absolute top-1/2 -translate-y-1/2 w-8 h-0.5 rounded-full animate-pulse', color)} style={{ animationDuration: '1.5s' }} />
        )}
      </div>
    </div>
  );
}
