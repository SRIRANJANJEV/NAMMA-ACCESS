import React, { useState, useCallback } from 'react';
import { Stethoscope, CheckCircle2, AlertTriangle, XCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { runDiagnostics } from '@/services/diagnosticsService';
import { cn } from '@/utils/cn';
import type { DiagnosticResult } from '@/types';

export function Diagnostics() {
  const { settings, connectionStatus, telegramConfigured, telemetry, alerts, voiceService } = useVaxGuard();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const r = runDiagnostics({
        settings,
        connectionStatus,
        voiceSupported: voiceService.isSupported(),
        telegramConfigured,
        telemetryCount: telemetry.length,
        alertCount: alerts.length,
      });
      setResults(r);
      setRunning(false);
    }, 800);
  }, [settings, connectionStatus, voiceService, telegramConfigured, telemetry, alerts]);

  const statusMeta: Record<DiagnosticResult['status'], { icon: React.ReactNode; variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    pass: { icon: <CheckCircle2 size={18} />, variant: 'success', label: 'PASS' },
    warning: { icon: <AlertTriangle size={18} />, variant: 'warning', label: 'WARNING' },
    error: { icon: <XCircle size={18} />, variant: 'danger', label: 'ERROR' },
    not_configured: { icon: <HelpCircle size={18} />, variant: 'neutral', label: 'NOT CONFIGURED' },
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warning').length;
  const errCount = results.filter(r => r.status === 'error').length;
  const ncCount = results.filter(r => r.status === 'not_configured').length;

  return (
    <div className="space-y-6">
      {/* Run button */}
      <Card variant="strong">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Stethoscope size={24} className="text-primary-400" />
              <div>
                <p className="text-sm font-semibold text-slate-200">System Diagnostics</p>
                <p className="text-xs text-slate-500">Run health checks on all system components</p>
              </div>
            </div>
            <Button variant="primary" size="md" icon={running ? undefined : <RefreshCw size={16} />} onClick={run} loading={running}>
              {running ? 'Running...' : 'Run Diagnostics'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <SummaryCard count={passCount} label="Pass" variant="success" icon={<CheckCircle2 size={16} />} />
          <SummaryCard count={warnCount} label="Warning" variant="warning" icon={<AlertTriangle size={16} />} />
          <SummaryCard count={errCount} label="Error" variant="danger" icon={<XCircle size={16} />} />
          <SummaryCard count={ncCount} label="Not Configured" variant="neutral" icon={<HelpCircle size={16} />} />
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Component Results</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {results.map(r => {
                const meta = statusMeta[r.status];
                return (
                  <div key={r.component} className={cn('flex items-center gap-3 p-3.5 rounded-xl border animate-slide-up',
                    r.status === 'pass' ? 'border-success-500/15 bg-success-500/5' :
                    r.status === 'warning' ? 'border-warning-500/15 bg-warning-500/5' :
                    r.status === 'error' ? 'border-danger-500/15 bg-danger-500/5' :
                    'border-slate-500/15 bg-slate-500/5')}>
                    <div className={cn(
                      r.status === 'pass' ? 'text-success-400' :
                      r.status === 'warning' ? 'text-warning-400' :
                      r.status === 'error' ? 'text-danger-400' :
                      'text-slate-400')}>
                      {meta.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">{r.component}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.message}</p>
                      {r.details && <p className="text-xs text-slate-600 mt-0.5">{r.details}</p>}
                    </div>
                    <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center text-center py-8">
              <Stethoscope size={32} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Click "Run Diagnostics" to check all system components.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ count, label, variant, icon }: { count: number; label: string; variant: 'success' | 'warning' | 'danger' | 'neutral'; icon: React.ReactNode }) {
  const colors = {
    success: 'text-success-400 bg-success-500/10 border-success-500/20',
    warning: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
    danger: 'text-danger-400 bg-danger-500/10 border-danger-500/20',
    neutral: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };
  return (
    <div className={cn('p-3 rounded-xl border text-center', colors[variant])}>
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="text-2xl font-bold tabular-nums">{count}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
