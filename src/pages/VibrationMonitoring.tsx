import React, { useMemo } from 'react';
import { Waves, Activity, Zap, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTime, timeAgo, formatDateTime } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export function VibrationMonitoring() {
  const { vibrationEvents, telemetry, triggerVibration, isDemo } = useVaxGuard();

  const eventsToday = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return vibrationEvents.filter(e => e.timestamp >= today);
  }, [vibrationEvents]);

  const eventFrequency = useMemo(() => {
    if (vibrationEvents.length < 2) return 0;
    const span = (vibrationEvents[0].timestamp - vibrationEvents[vibrationEvents.length - 1].timestamp) / 1000;
    return span > 0 ? (vibrationEvents.length / span * 60).toFixed(2) : '0';
  }, [vibrationEvents]);

  // Group events by hour for chart
  const hourlyData = useMemo(() => {
    const hours: Record<string, number> = {};
    vibrationEvents.forEach(e => {
      const h = new Date(e.timestamp).getHours().toString().padStart(2, '0') + ':00';
      hours[h] = (hours[h] || 0) + 1;
    });
    return Object.entries(hours).map(([hour, count]) => ({ hour, count })).reverse().slice(0, 12).reverse();
  }, [vibrationEvents]);

  const vibReadings = telemetry.filter(t => t.vibration).slice(-30).map(t => ({
    time: formatTime(t.timestamp),
    vibration: 1,
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Vibration Status" value={vibrationEvents.length > 0 ? 'ACTIVE' : 'CLEAR'} icon={<Waves size={16} />} status={vibrationEvents.length > 0 ? 'warning' : 'normal'} />
        <StatCard label="Total Events" value={vibrationEvents.length} icon={<Activity size={16} />} status="info" />
        <StatCard label="Events Today" value={eventsToday.length} icon={<Zap size={16} />} status={eventsToday.length > 0 ? 'warning' : 'normal'} />
        <StatCard label="Event Frequency" value={eventFrequency} unit="/min" icon={<Clock size={16} />} status="info" />
      </div>

      {/* Vibration trigger (demo only) */}
      {isDemo && (
        <Card variant="strong" className="border-warning-500/20">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">Manual Vibration Trigger</p>
                <p className="text-xs text-slate-500 mt-1">Simulate a disturbance event for testing</p>
              </div>
              <button
                onClick={triggerVibration}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning-500/20 hover:bg-warning-500/30 border border-warning-500/30 text-warning-400 font-medium text-sm transition-all active:scale-95"
              >
                <Zap size={16} />
                Trigger Vibration
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Waves size={16} className="text-warning-400" />
              Event Frequency (Hourly)
            </CardTitle>
          </CardHeader>
          <CardBody>
            {hourlyData.length === 0 ? (
              <EmptyState icon={<Waves size={28} />} title="No vibration data" description="No disturbance events recorded yet." />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,25,0.95)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#f59e0b" fillOpacity={0.6} radius={[4, 4, 0, 0]} name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={16} className="text-warning-400" />
              Vibration Events Over Time
            </CardTitle>
          </CardHeader>
          <CardBody>
            {vibReadings.length === 0 ? (
              <EmptyState icon={<Activity size={28} />} title="No vibration readings" description="Vibration events will appear on this chart when detected." />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vibReadings} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 1]} tickCount={2} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,25,0.95)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="stepAfter" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="Vibration" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Event timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning-400" />
            Disturbance Timeline
          </CardTitle>
        </CardHeader>
        <CardBody>
          {vibrationEvents.length === 0 ? (
            <EmptyState icon={<Waves size={28} />} title="No disturbance events" description="The SW-420 vibration sensor has not detected any events." />
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-300/30" />
              <div className="space-y-3">
                {vibrationEvents.slice(0, 20).map((event, i) => (
                  <div key={event.id} className="relative flex items-start gap-4 pl-0 animate-slide-up">
                    <div className="relative z-10 w-8 h-8 rounded-full bg-warning-500/20 border-2 border-warning-500/40 flex items-center justify-center flex-shrink-0">
                      <Waves size={14} className="text-warning-400" />
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-surface-200/30 border border-surface-300/15">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-200">Disturbance Event #{vibrationEvents.length - i}</p>
                        <Badge variant="warning" size="sm">{timeAgo(event.timestamp)}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{formatDateTime(event.timestamp)}</p>
                      <p className="text-xs text-slate-400 mt-1">Type: {event.intensity} · Source: SW-420 GPIO 34</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <p className="text-xs text-slate-600 text-center">
        SW-420 is an event/shock detector, not a calibrated acceleration sensor. Values represent disturbance events, not precise measurements.
      </p>
    </div>
  );
}
