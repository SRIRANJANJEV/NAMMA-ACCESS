import React, { useMemo } from 'react';
import { ShieldAlert, ShieldCheck, FileWarning, Activity, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calculateConditionScore, formatDuration, formatDateTime } from '@/utils/helpers';
import { DISCLAIMER } from '@/data/constants';
import { cn } from '@/utils/cn';

export function VaccineRisk() {
  const { telemetry, vibrationEvents, alerts, incidents, connectionStatus, settings } = useVaxGuard();

  const score = useMemo(() => calculateConditionScore(
    telemetry, vibrationEvents.length, connectionStatus,
    alerts.filter(a => !a.resolved).length
  ), [telemetry, vibrationEvents, connectionStatus, alerts]);

  const coldChainCondition = useMemo(() => {
    if (telemetry.length === 0) return 'No data available';
    const latest = telemetry[telemetry.length - 1];
    const { safeMin, safeMax } = settings.temperature;
    if (latest.temperature >= safeMin && latest.temperature <= safeMax) return 'Within safe range';
    if (latest.temperature > safeMax) return 'Above safe range — excursion detected';
    return 'Below safe range — excursion detected';
  }, [telemetry, settings.temperature]);

  const storageExcursion = useMemo(() => {
    const tempAlerts = alerts.filter(a => a.category === 'temperature' && (a.severity === 'warning' || a.severity === 'critical'));
    if (tempAlerts.length === 0) return 'No excursions recorded';
    const latest = tempAlerts[0];
    return `${latest.title} at ${formatDateTime(latest.timestamp)}`;
  }, [alerts]);

  const exposureEvents = useMemo(() => {
    return alerts.filter(a => a.severity === 'critical').length;
  }, [alerts]);

  const vibrationIncidents = useMemo(() => {
    return incidents.filter(i => i.category === 'vibration').length;
  }, [incidents]);

  const evidenceStatus = useMemo(() => {
    const total = incidents.length;
    const acknowledged = incidents.filter(i => i.acknowledged).length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const completeness = total > 0 ? Math.round((acknowledged + resolved) / (total * 2) * 100) : 100;
    return { total, acknowledged, resolved, completeness };
  }, [incidents]);

  const reviewRequired = score.score < 80 || alerts.filter(a => !a.resolved && a.severity === 'critical').length > 0;

  const riskScore = 100 - score.score;
  const severity = score.riskLevel === 'low' ? 'LOW' : score.riskLevel === 'moderate' ? 'MODERATE' : score.riskLevel === 'high' ? 'HIGH' : 'SEVERE';

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card variant="strong" className="border-warning-500/20">
        <CardBody>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-warning-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400">{DISCLAIMER}</p>
          </div>
        </CardBody>
      </Card>

      {/* Risk Score */}
      <Card variant="strong">
        <CardBody>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={riskScore < 20 ? '#22c55e' : riskScore < 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${riskScore * 2.64} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-3xl font-bold tabular-nums', riskScore < 20 ? 'text-success-400' : riskScore < 40 ? 'text-warning-400' : 'text-danger-400')}>{riskScore}</span>
                <span className="text-xs text-slate-500 uppercase">Risk</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className={riskScore < 20 ? 'text-success-400' : 'text-warning-400'} />
                <h3 className="text-lg font-semibold text-slate-100">Risk Score: {severity}</h3>
              </div>
              <p className="text-sm text-slate-400">
                {reviewRequired
                  ? 'Review required — conditions indicate potential cold-chain integrity concerns.'
                  : 'No review required — cold-chain conditions are within acceptable parameters.'}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="p-2.5 rounded-lg bg-surface-200/30">
                  <p className="text-xs text-slate-500">Incident Severity</p>
                  <p className="text-sm font-semibold text-slate-200">{severity}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-200/30">
                  <p className="text-xs text-slate-500">Evidence Completeness</p>
                  <p className="text-sm font-semibold text-slate-200">{evidenceStatus.completeness}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Assessment cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AssessmentCard icon={<Activity size={18} />} label="Cold-Chain Condition" value={coldChainCondition} status={coldChainCondition.includes('safe') ? 'normal' : 'warning'} />
        <AssessmentCard icon={<FileWarning size={18} />} label="Storage Excursion" value={storageExcursion} status={storageExcursion.includes('No') ? 'normal' : 'warning'} />
        <AssessmentCard icon={<AlertTriangle size={18} />} label="Exposure Events" value={`${exposureEvents} critical event(s)`} status={exposureEvents > 0 ? 'critical' : 'normal'} />
        <AssessmentCard icon={<Activity size={18} />} label="Vibration Incidents" value={`${vibrationIncidents} incident(s)`} status={vibrationIncidents > 0 ? 'warning' : 'normal'} />
        <AssessmentCard icon={<ClipboardCheck size={18} />} label="Evidence Status" value={`${evidenceStatus.completeness}% complete`} status={evidenceStatus.completeness === 100 ? 'normal' : 'warning'} />
        <AssessmentCard icon={<ShieldCheck size={18} />} label="Review Status" value={reviewRequired ? 'REVIEW REQUIRED' : 'No review needed'} status={reviewRequired ? 'warning' : 'normal'} />
      </div>

      {/* Evidence summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck size={16} className="text-accent-400" />
            Evidence Summary
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <EvidenceItem label="Total Incidents" value={String(evidenceStatus.total)} />
            <EvidenceItem label="Acknowledged" value={String(evidenceStatus.acknowledged)} />
            <EvidenceItem label="Resolved" value={String(evidenceStatus.resolved)} />
            <EvidenceItem label="Completeness" value={`${evidenceStatus.completeness}%`} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function AssessmentCard({ icon, label, value, status }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
}) {
  const colors = {
    normal: 'border-success-500/20 bg-success-500/5 text-success-400',
    warning: 'border-warning-500/20 bg-warning-500/5 text-warning-400',
    critical: 'border-danger-500/20 bg-danger-500/5 text-danger-400',
  };
  return (
    <Card className={cn('border', colors[status])}>
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', colors[status])}>{icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm text-slate-200 font-medium truncate">{value}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function EvidenceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-200/30 text-center">
      <p className="text-2xl font-bold text-slate-200 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
