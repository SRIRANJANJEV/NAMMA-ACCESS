import React, { useState, useMemo } from 'react';
import { Siren, AlertTriangle, CheckCircle, XCircle, Eye, FileText, Plus } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { SEVERITY_META } from '@/data/constants';
import { formatDateTime, timeAgo, toCSV, downloadFile } from '@/utils/helpers';
import type { AlertEvent, Incident } from '@/types';
import { cn } from '@/utils/cn';

export function Alerts() {
  const { alerts, incidents, acknowledgeAlert, resolveAlert, addAlertNote, acknowledgeIncident, resolveIncident, addIncidentNote } = useVaxGuard();
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [noteText, setNoteText] = useState('');

  const active = alerts.filter(a => !a.resolved);
  const critical = alerts.filter(a => a.severity === 'critical' && !a.resolved);
  const warning = alerts.filter(a => a.severity === 'warning' && !a.resolved);
  const resolved = alerts.filter(a => a.resolved);

  const handleExportCSV = () => {
    const csv = toCSV(alerts.map(a => ({
      id: a.id, timestamp: new Date(a.timestamp).toISOString(), severity: a.severity,
      category: a.category, title: a.title, description: a.description,
      sensorValue: a.sensorValue || '', threshold: a.threshold || '',
      acknowledged: a.acknowledged, resolved: a.resolved, source: a.source,
    })));
    downloadFile(csv, `vaxguard_alerts_${Date.now()}.csv`, 'text/csv');
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    if (selectedAlert) addAlertNote(selectedAlert.id, noteText);
    if (selectedIncident) addIncidentNote(selectedIncident.id, noteText);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active" value={active.length} icon={<Siren size={16} />} status={active.length > 0 ? 'warning' : 'normal'} />
        <StatCard label="Critical" value={critical.length} icon={<AlertTriangle size={16} />} status={critical.length > 0 ? 'critical' : 'normal'} />
        <StatCard label="Warning" value={warning.length} icon={<AlertTriangle size={16} />} status={warning.length > 0 ? 'warning' : 'normal'} />
        <StatCard label="Resolved" value={resolved.length} icon={<CheckCircle size={16} />} status="normal" />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" icon={<FileText size={14} />} onClick={handleExportCSV}>Export CSV</Button>
      </div>

      <Tabs
        tabs={[
          { id: 'alerts', label: 'Alerts' },
          { id: 'incidents', label: 'Incidents' },
        ]}
      >
        {(tab) => tab === 'alerts' ? (
          <AlertList alerts={alerts} onAck={acknowledgeAlert} onResolve={resolveAlert} onView={setSelectedAlert} />
        ) : (
          <IncidentList incidents={incidents} onAck={acknowledgeIncident} onResolve={resolveIncident} onView={setSelectedIncident} />
        )}
      </Tabs>

      {/* Alert detail modal */}
      <Modal open={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="Alert Details" size="lg">
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={selectedAlert.severity === 'critical' ? 'danger' : selectedAlert.severity === 'warning' ? 'warning' : 'info'} dot>
                {selectedAlert.severity.toUpperCase()}
              </Badge>
              <span className="text-sm text-slate-400">{formatDateTime(selectedAlert.timestamp)}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{selectedAlert.title}</h3>
            <p className="text-sm text-slate-400">{selectedAlert.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Category" value={selectedAlert.category} />
              <DetailField label="Source" value={selectedAlert.source === 'demo' ? 'DEMO DATA' : 'LIVE HARDWARE'} />
              {selectedAlert.sensorValue && <DetailField label="Sensor Value" value={selectedAlert.sensorValue} />}
              {selectedAlert.threshold && <DetailField label="Threshold" value={selectedAlert.threshold} />}
              <DetailField label="Acknowledged" value={selectedAlert.acknowledged ? 'Yes' : 'No'} />
              <DetailField label="Resolved" value={selectedAlert.resolved ? 'Yes' : 'No'} />
            </div>
            {/* Notes */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notes</p>
              {selectedAlert.notes.length > 0 ? (
                <div className="space-y-1.5 mb-3">
                  {selectedAlert.notes.map((note, i) => (
                    <div key={i} className="p-2 rounded-lg bg-surface-200/30 text-sm text-slate-300">{note}</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 mb-3">No notes added.</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-200/40 border border-surface-300/20 text-sm text-slate-200 placeholder-slate-600 focus:border-primary-500/30"
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={handleAddNote}>Add</Button>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {!selectedAlert.acknowledged && (
                <Button variant="warning" size="sm" onClick={() => { acknowledgeAlert(selectedAlert.id); setSelectedAlert({...selectedAlert, acknowledged: true}); }}>
                  Acknowledge
                </Button>
              )}
              {!selectedAlert.resolved && (
                <Button variant="success" size="sm" onClick={() => { resolveAlert(selectedAlert.id); setSelectedAlert(null); }}>
                  Resolve
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Incident detail modal */}
      <Modal open={!!selectedIncident} onClose={() => setSelectedIncident(null)} title="Incident Report" size="lg">
        {selectedIncident && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={selectedIncident.severity === 'critical' ? 'danger' : 'warning'} dot>
                {selectedIncident.severity.toUpperCase()}
              </Badge>
              <Badge variant="neutral">{selectedIncident.status.toUpperCase()}</Badge>
              <span className="text-sm text-slate-400">{formatDateTime(selectedIncident.timestamp)}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{selectedIncident.title}</h3>
            <p className="text-sm text-slate-400">{selectedIncident.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Incident ID" value={selectedIncident.id} />
              <DetailField label="Category" value={selectedIncident.category} />
              <DetailField label="Sensor Value" value={selectedIncident.sensorValue} />
              <DetailField label="Threshold" value={selectedIncident.threshold} />
              <DetailField label="Duration" value={`${selectedIncident.duration}s`} />
              <DetailField label="Status" value={selectedIncident.status} />
            </div>
            {/* Telemetry snapshot */}
            {selectedIncident.telemetrySnapshot.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Telemetry Snapshot ({selectedIncident.telemetrySnapshot.length} readings)</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedIncident.telemetrySnapshot.slice(-10).map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-200/20 text-xs">
                      <span className="text-slate-500">{formatDateTime(t.timestamp)}</span>
                      <span className="text-primary-400">{t.temperature}°C</span>
                      <span className="text-accent-400">{t.humidity}%</span>
                      <span className={t.vibration ? 'text-warning-400' : 'text-slate-600'}>{t.vibration ? 'VIB' : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Export */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" icon={<FileText size={14} />} onClick={() => {
                const json = JSON.stringify(selectedIncident, null, 2);
                downloadFile(json, `incident_${selectedIncident.id}.json`, 'application/json');
              }}>Export JSON</Button>
              <Button variant="outline" size="sm" icon={<FileText size={14} />} onClick={() => {
                const csv = toCSV([selectedIncident as unknown as Record<string, unknown>]);
                downloadFile(csv, `incident_${selectedIncident.id}.csv`, 'text/csv');
              }}>Export CSV</Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>Print Report</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AlertList({ alerts, onAck, onResolve, onView }: {
  alerts: AlertEvent[];
  onAck: (id: string) => void;
  onResolve: (id: string) => void;
  onView: (a: AlertEvent) => void;
}) {
  if (alerts.length === 0) {
    return <EmptyState icon={<Siren size={32} />} title="No alerts" description="No alerts have been triggered. The system is operating normally." />;
  }
  return (
    <div className="space-y-2">
      {alerts.slice(0, 50).map(alert => {
        const meta = SEVERITY_META[alert.severity];
        return (
          <div key={alert.id} className={cn('flex items-start gap-3 p-3.5 rounded-xl border bg-surface-100/40 animate-slide-up', meta.border)}>
            <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', meta.dot, alert.severity === 'critical' && 'animate-pulse')} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-200">{alert.title}</p>
                <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'} size="sm">
                  {alert.severity.toUpperCase()}
                </Badge>
                {alert.acknowledged && <Badge variant="neutral" size="sm">ACK</Badge>}
                {alert.resolved && <Badge variant="success" size="sm">RESOLVED</Badge>}
              </div>
              <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
              <p className="text-xs text-slate-600 mt-1">{formatDateTime(alert.timestamp)} · {timeAgo(alert.timestamp)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onView(alert)} className="p-1.5 rounded-lg hover:bg-surface-200/50 text-slate-400 hover:text-slate-200" title="View Details">
                <Eye size={16} />
              </button>
              {!alert.acknowledged && (
                <button onClick={() => onAck(alert.id)} className="p-1.5 rounded-lg hover:bg-warning-500/10 text-slate-400 hover:text-warning-400" title="Acknowledge">
                  <CheckCircle size={16} />
                </button>
              )}
              {!alert.resolved && (
                <button onClick={() => onResolve(alert.id)} className="p-1.5 rounded-lg hover:bg-success-500/10 text-slate-400 hover:text-success-400" title="Resolve">
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncidentList({ incidents, onAck, onResolve, onView }: {
  incidents: Incident[];
  onAck: (id: string) => void;
  onResolve: (id: string) => void;
  onView: (i: Incident) => void;
}) {
  if (incidents.length === 0) {
    return <EmptyState icon={<AlertTriangle size={32} />} title="No incidents" description="No incidents have been recorded. Incidents are created for warning and critical alerts." />;
  }
  return (
    <div className="space-y-2">
      {incidents.slice(0, 50).map(inc => {
        const meta = SEVERITY_META[inc.severity];
        return (
          <div key={inc.id} className={cn('flex items-start gap-3 p-3.5 rounded-xl border bg-surface-100/40 animate-slide-up', meta.border)}>
            <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', meta.dot)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-200">{inc.title}</p>
                <Badge variant={inc.severity === 'critical' ? 'danger' : 'warning'} size="sm">{inc.severity.toUpperCase()}</Badge>
                <Badge variant="neutral" size="sm">{inc.status.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{inc.sensorValue} · Threshold: {inc.threshold}</p>
              <p className="text-xs text-slate-600 mt-1">{formatDateTime(inc.timestamp)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onView(inc)} className="p-1.5 rounded-lg hover:bg-surface-200/50 text-slate-400 hover:text-slate-200" title="View Details">
                <Eye size={16} />
              </button>
              {!inc.acknowledged && (
                <button onClick={() => onAck(inc.id)} className="p-1.5 rounded-lg hover:bg-warning-500/10 text-slate-400 hover:text-warning-400" title="Acknowledge">
                  <CheckCircle size={16} />
                </button>
              )}
              {inc.status !== 'resolved' && (
                <button onClick={() => onResolve(inc.id)} className="p-1.5 rounded-lg hover:bg-success-500/10 text-slate-400 hover:text-success-400" title="Resolve">
                  <XCircle size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-surface-200/30">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-200 font-medium mt-0.5 break-all">{value}</p>
    </div>
  );
}
