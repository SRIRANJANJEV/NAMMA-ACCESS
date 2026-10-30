import React, { useMemo } from 'react';
import {
  Thermometer, TrendingUp, TrendingDown, Minus, AlertTriangle, Clock,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceArea, ReferenceLine, Legend, Area, ComposedChart,
} from 'recharts';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getTemperatureStats, formatTime, formatDuration } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export function TemperatureAnalytics() {
  const { telemetry, settings, alerts } = useVaxGuard();

  const tempStats = getTemperatureStats(telemetry);
  const { safeMin, safeMax, warningBoundary } = settings.temperature;
  const warnMax = safeMax + warningBoundary;
  const warnMin = safeMin - warningBoundary;
  const critMax = safeMax + warningBoundary * 2;
  const critMin = safeMin - warningBoundary * 2;

  const chartData = useMemo(() => {
    return telemetry.slice(-120).map(r => ({
      time: formatTime(r.timestamp),
      temperature: r.temperature,
    }));
  }, [telemetry]);

  // Calculate time in zones
  const zoneStats = useMemo(() => {
    if (telemetry.length === 0) return { safe: 0, warning: 0, critical: 0, total: 0 };
    let safe = 0, warning = 0, critical = 0;
    telemetry.forEach(r => {
      if (r.temperature >= safeMin && r.temperature <= safeMax) safe++;
      else if (r.temperature >= warnMin && r.temperature <= warnMax) warning++;
      else critical++;
    });
    return {
      safe: (safe / telemetry.length) * 100,
      warning: (warning / telemetry.length) * 100,
      critical: (critical / telemetry.length) * 100,
      total: telemetry.length,
    };
  }, [telemetry, safeMin, safeMax, warnMin, warnMax]);

  const tempAlerts = alerts.filter(a => a.category === 'temperature');
  const excursions = tempAlerts.filter(a => a.severity === 'warning' || a.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Current"
          value={telemetry.length > 0 ? telemetry[telemetry.length - 1].temperature : '—'}
          unit="°C"
          icon={<Thermometer size={16} />}
          status={telemetry.length > 0 && (telemetry[telemetry.length - 1].temperature < safeMin || telemetry[telemetry.length - 1].temperature > safeMax) ? 'warning' : 'normal'}
        />
        <StatCard
          label="Minimum"
          value={tempStats.min.toFixed(1)}
          unit="°C"
          icon={<TrendingDown size={16} />}
          status="info"
        />
        <StatCard
          label="Maximum"
          value={tempStats.max.toFixed(1)}
          unit="°C"
          icon={<TrendingUp size={16} />}
          status="info"
        />
        <StatCard
          label="Average"
          value={tempStats.avg.toFixed(1)}
          unit="°C"
          icon={<Minus size={16} />}
          status="info"
          trend={tempStats.trend}
          subValue={`${tempStats.rateOfChange > 0 ? '+' : ''}${tempStats.rateOfChange.toFixed(2)}°C/reading`}
        />
      </div>

      {/* Live temperature chart with zones */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Thermometer size={16} className="text-primary-400" />
            Temperature with Safe/Warning/Critical Zones
          </CardTitle>
          <Badge variant="neutral" size="sm">Prototype thresholds</Badge>
        </CardHeader>
        <CardBody>
          {chartData.length === 0 ? (
            <EmptyState icon={<Thermometer size={32} />} title="No temperature data" description="Telemetry data will appear here once readings are received." />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                  {/* Safe zone */}
                  <ReferenceArea y1={safeMin} y2={safeMax} fill="#22c55e" fillOpacity={0.06} />
                  {/* Warning zones */}
                  <ReferenceArea y1={safeMax} y2={warnMax} fill="#f59e0b" fillOpacity={0.06} />
                  <ReferenceArea y1={warnMin} y2={safeMin} fill="#f59e0b" fillOpacity={0.06} />
                  {/* Critical zones */}
                  <ReferenceArea y1={warnMax} y2={50} fill="#ef4444" fillOpacity={0.06} />
                  <ReferenceArea y1={-20} y2={warnMin} fill="#ef4444" fillOpacity={0.06} />
                  {/* Threshold lines */}
                  <ReferenceLine y={safeMax} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: `${safeMax}°C`, position: 'right', fill: '#f59e0b', fontSize: 9 }} />
                  <ReferenceLine y={safeMin} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: `${safeMin}°C`, position: 'right', fill: '#f59e0b', fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15,20,25,0.95)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="#22d3ee" strokeWidth={2} dot={false} animationDuration={300} name="Temperature" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Zone distribution + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Time in Zones</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <ZoneBar label="Safe Zone" percentage={zoneStats.safe} color="success" range={`${safeMin}°C – ${safeMax}°C`} />
              <ZoneBar label="Warning Zone" percentage={zoneStats.warning} color="warning" range={`${warnMin}°C – ${warnMin}°C / ${warnMax}°C`} />
              <ZoneBar label="Critical Zone" percentage={zoneStats.critical} color="danger" range={`< ${critMin}°C / > ${critMax}°C`} />
              <div className="pt-3 border-t border-surface-300/15 text-xs text-slate-500">
                Based on {zoneStats.total} readings
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <TrendRow label="Current Trend" value={tempStats.trend} icon={tempStats.trend === 'rising' ? <TrendingUp size={16} className="text-warning-400" /> : tempStats.trend === 'falling' ? <TrendingDown size={16} className="text-accent-400" /> : <Minus size={16} className="text-success-400" />} />
              <TrendRow label="Rate of Change" value={`${tempStats.rateOfChange > 0 ? '+' : ''}${tempStats.rateOfChange.toFixed(3)}°C/reading`} />
              <TrendRow label="Standard Deviation" value={telemetry.length > 1 ? (() => {
                const temps = telemetry.map(t => t.temperature);
                const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                const variance = temps.reduce((s, v) => s + (v - avg) ** 2, 0) / temps.length;
                return Math.sqrt(variance).toFixed(2) + '°C';
              })() : 'N/A'} />
              <TrendRow label="Excursions" value={String(excursions.length)} />
              <TrendRow label="Warning Duration" value={formatDuration(excursions.filter(e => e.severity === 'warning').length * 2)} />
              <TrendRow label="Critical Duration" value={formatDuration(excursions.filter(e => e.severity === 'critical').length * 2)} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Excursion history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning-400" />
            Temperature Excursions
          </CardTitle>
        </CardHeader>
        <CardBody>
          {excursions.length === 0 ? (
            <EmptyState icon={<Clock size={28} />} title="No excursions recorded" description="Temperature has remained within configured thresholds." />
          ) : (
            <div className="space-y-2">
              {excursions.slice(0, 10).map(alert => (
                <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-200/30 border border-surface-300/15">
                  <div className={cn('w-2 h-2 rounded-full', alert.severity === 'critical' ? 'bg-danger-400' : 'bg-warning-400')} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{alert.title}</p>
                    <p className="text-xs text-slate-500">{alert.description}</p>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                    {formatTime(alert.timestamp)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function ZoneBar({ label, percentage, color, range }: {
  label: string;
  percentage: number;
  color: 'success' | 'warning' | 'danger';
  range: string;
}) {
  const colors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs text-slate-500">{percentage.toFixed(1)}% · {range}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-300/30 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', colors[color])} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function TrendRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-200/20">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-200 flex items-center gap-2 capitalize">
        {icon}
        {value}
      </span>
    </div>
  );
}
