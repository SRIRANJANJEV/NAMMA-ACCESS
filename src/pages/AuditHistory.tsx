import React, { useState, useMemo } from 'react';
import { ScrollText, Download, Filter, FileJson, FileText } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, toCSV, downloadFile } from '@/utils/helpers';
import type { EventCategory } from '@/types';
import { cn } from '@/utils/cn';

const CATEGORIES: (EventCategory | 'all')[] = ['all', 'alert', 'settings', 'demo', 'system', 'network', 'voice', 'notification'];

export function AuditHistory() {
  const { audit } = useVaxGuard();
  const [filter, setFilter] = useState<EventCategory | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return audit;
    return audit.filter(a => a.category === filter);
  }, [audit, filter]);

  const handleExportJSON = () => {
    const json = JSON.stringify(filtered, null, 2);
    downloadFile(json, `vaxguard_audit_${Date.now()}.json`, 'application/json');
  };

  const handleExportCSV = () => {
    const csv = toCSV(filtered.map(a => ({
      id: a.id, timestamp: new Date(a.timestamp).toISOString(),
      action: a.action, category: a.category, actor: a.actor, details: a.details,
    })));
    downloadFile(csv, `vaxguard_audit_${Date.now()}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-slate-500" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
                filter === cat
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-surface-200/30 text-slate-400 hover:text-slate-200 border border-transparent'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<FileJson size={14} />} onClick={handleExportJSON}>JSON</Button>
          <Button variant="outline" size="sm" icon={<FileText size={14} />} onClick={handleExportCSV}>CSV</Button>
        </div>
      </div>

      {/* Audit log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText size={16} className="text-primary-400" />
            Audit Log
            <Badge variant="neutral" size="sm">{filtered.length} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardBody>
          {filtered.length === 0 ? (
            <EmptyState icon={<ScrollText size={28} />} title="No audit entries" description="System actions will be logged here." />
          ) : (
            <div className="space-y-1">
              {filtered.slice(0, 100).map(entry => (
                <div key={entry.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-200/20 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400/50 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-200">{entry.action}</p>
                      <Badge variant="neutral" size="sm">{entry.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{entry.details}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500">{formatDateTime(entry.timestamp)}</p>
                    <p className="text-xs text-slate-600">by {entry.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
