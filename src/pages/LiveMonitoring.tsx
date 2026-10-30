import React, { useMemo } from 'react';
import {
  Thermometer, Droplets, Waves, Cpu, Wifi, Clock,
  TrendingUp, TrendingDown, Minus, Activity, AlertCircle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine,
} from 'recharts';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getTemperatureStats, getHumidityStats, formatTime, timeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export function LiveMonitoring() {
  const { telemetry, latestReading, settings, vibrationEvents, isDemo, systemStatus } = useVaxGuard();

  const tempStats = getTemperatureStats(telemetry);
  const humStats = getHumidityStats(telemetry);

  const chartData = useMemo(() => {
    return telemetry.slice(-60).map(r => ({
      time: formatTime(r.timestamp),
      temperature: r.temperature,
      humidity: r.humidity,
      vibration: r.vibration ? 1 : 0,
    }));
  }, [telemetry]);

  const { safeMin, safeMax, warningBoundary } = settings.temperature;
  const warnMax = safeMax + warningBoundary;
  const warnMin = safeMin - warningBoundary;

  const tempStatus = latestReading ? (
    latestReading.temperature >= safeMin && latestReading.temperature <= safeMax ? 'normal' :
    latestReading.temperature > safeMax + warningBoundary * 2 || latestReading.temperature < safeMin - warningBoundary * 2 ? 'critical' : 'warning'
  ) : 'offline';

  const humStatus = latestReading ? (
    latestReading.humidity >= 30 && latestReading.humidity <= 70 ? 'normal' : 'warning'
  ) : 'offline';

  return (
    <div className="space-y-6">
      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Temperature"
          value={latestReading ? latestReading.temperature : '—'}
          unit="°C"
          icon={<Thermometer size={16} />}
          status={tempStatus as 'normal' | 'warning' | 'critical' | 'offline'}
          trend={tempStats.trend}
          subValue={`Range: ${tempStats.min.toFixed(1)}–${tempStats.max.toFixed(1)}°C`}
        />
        <StatCard
          label="Humidity"
          value={latestReading ? latestReading.humidity : '—'}
          unit="%"
          icon={<Droplets size={16} />}
          status={humStatus as 'normal' | 'warning' | 'critical' | 'offline'}
          trend={humStats.trend}
          subValue={`Range: ${humStats.min}–${humStats.max}%`}
        />
        <StatCard
          label="Vibration"
          value={vibrationEvents.length}
          icon={<Waves size={16} />}
          status={vibrationEvents.length > 0 ? 'warning' : 'normal'}
          subValue={vibrationEvents.length > 0 ? `Last: ${timeAgo(vibrationEvents[0].timestamp)}` : 'No events'}
        />
        <StatCard
          label="Device"
          value={latestReading?.deviceOnline ? 'ONLINE' : 'OFFLINE'}
          icon={<Cpu size={16} />}
          status={latestReading?.deviceOnline ? 'normal' : 'offline'}
        />
        <StatCard
          label="Network"
          value={latestReading?.deviceOnline ? 'CONNECTED' : 'DOWN'}
          icon={<Wifi size={16} />}
          status={latestReading?.deviceOnline ? 'normal' : 'offline'}
        />
        <StatCard
          label="Last Update"
          value={latestReading ? timeAgo(latestReading.timestamp) : '—'}
          icon={<Clock size={16} />}
          status="info"
        />
      </div>

      {/* Live chart */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity size={16} className="text-primary-400" />
            Live Telemetry
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isDemo ? 'info' : 'success'} dot pulse size="sm">
              {isDemo ? 'DEMO DATA' : 'LIVE'}
            </Badge>
            {latestReading && (
              <Badge variant="neutral" size="sm">
                {chartData.length} points
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {chartData.length === 0 ? (
            <EmptyState
              icon={<Activity size={32} />}
              title="No telemetry data yet"
              description="Waiting for sensor readings. Data will appear here once telemetry is received."
            />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis yAxisId="temp" stroke="#64748b" fontSize={10} domain={[0, 'auto']} />
                  <YAxis yAxisId="hum" orientation="right" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <ReferenceArea yAxisId="temp" y1={safeMin} y2={safeMax} fill="#22c55e" fillOpacity={0.05} />
                  <ReferenceLine yAxisId="temp" y={safeMax} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine yAxisId="temp" y={safeMin} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,20,25,0.95)',
                      border: '1px solid rgba(34,211,238,0.2)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={300}
                    name="Temperature (°C)"
                  />
                  <Line
                    yAxisId="hum"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    dot={false}
                    animationDuration={300}
                    name="Humidity (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Detailed stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer size={16} className="text-primary-400" />
              Temperature Details
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Current" value={latestReading ? `${latestReading.temperature}°C` : 'N/A'} status={tempStatus as 'normal' | 'warning' | 'critical' | 'offline'} />
              <DetailRow label="Status" value={tempStatus.toUpperCase()} status={tempStatus as 'normal' | 'warning' | 'critical' | 'offline'} />
              <DetailRow label="Minimum" value={`${tempStats.min.toFixed(1)}°C`} />
              <DetailRow label="Maximum" value={`${tempStats.max.toFixed(1)}°C`} />
              <DetailRow label="Average" value={`${tempStats.avg.toFixed(1)}°C`} />
              <DetailRow label="Rate of Change" value={`${tempStats.rateOfChange > 0 ? '+' : ''}${tempStats.rateOfChange.toFixed(2)}°C/reading`} />
              <DetailRow label="Trend" value={tempStats.trend} icon={tempStats.trend === 'rising' ? <TrendingUp size={14} /> : tempStats.trend === 'falling' ? <TrendingDown size={14} /> : <Minus size={14} />} />
              <DetailRow label="Safe Range" value={`${safeMin}°C – ${safeMax}°C`} />
            </div>
          </CardBody>
        </Card>

        {/* Humidity detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets size={16} className="text-accent-400" />
              Humidity Details
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              <DetailRow label="Current" value={latestReading ? `${latestReading.humidity}%` : 'N/A'} status={humStatus as 'normal' | 'warning' | 'critical' | 'offline'} />
              <DetailRow label="Status" value={humStatus.toUpperCase()} status={humStatus as 'normal' | 'warning' | 'critical' | 'offline'} />
              <DetailRow label="Minimum" value={`${humStats.min}%`} />
              <DetailRow label="Maximum" value={`${humStats.max}%`} />
              <DetailRow label="Average" value={`${humStats.avg.toFixed(0)}%`} />
              <DetailRow label="Trend" value={humStats.trend} icon={humStats.trend === 'rising' ? <TrendingUp size={14} /> : humStats.trend === 'falling' ? <TrendingDown size={14} /> : <Minus size={14} />} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Vibration events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves size={16} className="text-warning-400" />
            Vibration Events
          </CardTitle>
        </CardHeader>
        <CardBody>
          {vibrationEvents.length === 0 ? (
            <EmptyState
              icon={<Waves size={28} />}
              title="No vibration events"
              description="The system has not detected any disturbance events."
            />
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {vibrationEvents.slice(0, 10).map((event, i) => (
                <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-200/30 border border-surface-300/15 animate-slide-up">
                  <div className="w-2 h-2 rounded-full bg-warning-400 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">Disturbance event detected</p>
                    <p className="text-xs text-slate-500">{formatTime(event.timestamp)} · {timeAgo(event.timestamp)}</p>
                  </div>
                  <Badge variant="warning" size="sm">Event #{vibrationEvents.length - i}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function DetailRow({ label, value, status, icon }: {
  label: string;
  value: string;
  status?: 'normal' | 'warning' | 'critical' | 'offline';
  icon?: React.ReactNode;
}) {
  const colors = {
    normal: 'text-success-400',
    warning: 'text-warning-400',
    critical: 'text-danger-400',
    offline: 'text-slate-500',
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-200/20">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={cn('text-sm font-semibold flex items-center gap-1', status ? colors[status] : 'text-slate-200')}>
        {icon}
        {value}
      </span>
    </div>
  );
}
