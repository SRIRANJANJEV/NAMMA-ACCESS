import React, { useState, useMemo } from 'react';
import {
  Thermometer, Waves, Wifi, Cpu, Siren, Settings as SettingsIcon,
  FlaskConical, Mic, Bell, RotateCcw, Activity, Filter,
} from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SEVERITY_META } from '@/data/constants';
import { formatDateTime, timeAgo } from '@/utils/helpers';
import type { EventCategory } from '@/types';
import { cn } from '@/utils/cn';

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warning' },
  { id: 'system', label: 'System' },
  { id: 'vibration', label: 'Vibration' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'network', label: 'Network' },
];

const categoryIcons: Record<string, React.ReactNode> = {
  temperature: <Thermometer size={14} />,
  vibration: <Waves size={14} />,
  network: <Wifi size={14} />,
  system: <Cpu size={14} />,
  alert: <Siren size={14} />,
  recovery: <RotateCcw size={14} />,
  settings: <SettingsIcon size={14} />,
  demo: <FlaskConical size={14} />,
  voice: <Mic size={14} />,
  notification: <Bell size={14} />,
};

export function EventTimeline() {
  const { timeline } = useVaxGuard();
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return timeline;
    if (filter === 'critical' || filter === 'warning') {
      return timeline.filter(e => e.severity === filter);
    }
    return timeline.filter(e => e.type === filter as EventCategory);
  }, [timeline, filter]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={16} className="text-slate-500" />
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f.id
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-surface-200/30 text-slate-400 hover:text-slate-200 border border-transparent'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={16} className="text-primary-400" />
            Event Timeline
            <Badge variant="neutral" size="sm">{filtered.length} events</Badge>
          </CardTitle>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState icon={<Activity size={28} />} title="No events" description="No events match the selected filter." />
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-surface-300/30" />
              <div className="space-y-3">
                {filtered.slice(0, 100).map(event => {
                  const meta = SEVERITY_META[event.severity];
                  return (
                    <div key={event.id} className="relative flex items-start gap-4 animate-slide-up">
                      <div className={cn('relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2',
                        meta.border, meta.bg, meta.color)}>
                        {categoryIcons[event.type] || <Activity size={14} />}
                      </div>
                      <div className="flex-1 p-3 rounded-lg bg-surface-200/30 border border-surface-300/15">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-200">{event.title}</p>
                          <Badge variant={event.severity === 'critical' ? 'danger' : event.severity === 'warning' ? 'warning' : 'neutral'} size="sm">
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatDateTime(event.timestamp)} · {timeAgo(event.timestamp)} · Source: {event.source}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
