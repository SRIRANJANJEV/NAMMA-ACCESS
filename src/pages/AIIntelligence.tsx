import React, { useMemo } from 'react';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldCheck, Activity, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calculateConditionScore, formatTime } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { ConditionScore } from '@/types';

export function AIIntelligence() {
  const { telemetry, vibrationEvents, connectionStatus, alerts, settings } = useVaxGuard();

  const score = useMemo(() => calculateConditionScore(
    telemetry, vibrationEvents.length, connectionStatus,
    alerts.filter(a => !a.resolved).length
  ), [telemetry, vibrationEvents, connectionStatus, alerts]);

  const factors = useMemo(() => {
    const result: ConditionScore['factors'] = [];
    if (telemetry.length > 0) {
      const recent = telemetry.slice(-10);
      const temps = recent.map(t => t.temperature);
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
      const inRange = avg >= settings.temperature.safeMin && avg <= settings.temperature.safeMax;
      result.push({ label: 'Temperature Stability', value: `${avg.toFixed(1)}°C`, impact: inRange ? 'positive' : 'negative' });

      const tempVariance = temps.reduce((s, v) => s + Math.abs(v - avg), 0) / temps.length;
      result.push({ label: 'Temperature Variance', value: `±${tempVariance.toFixed(2)}°C`, impact: tempVariance < 0.5 ? 'positive' : 'neutral' });
    }
    result.push({ label: 'Vibration Events', value: String(vibrationEvents.length), impact: vibrationEvents.length > 0 ? 'negative' : 'positive' });
    result.push({ label: 'Connection', value: connectionStatus === 'connected' ? 'Stable' : 'Unstable', impact: connectionStatus === 'connected' ? 'positive' : 'negative' });
    result.push({ label: 'Active Alerts', value: String(alerts.filter(a => !a.resolved).length), impact: alerts.filter(a => !a.resolved).length > 0 ? 'negative' : 'positive' });
    return result;
  }, [telemetry, vibrationEvents, connectionStatus, alerts, settings.temperature.safeMin, settings.temperature.safeMax]);

  const analysis = useMemo(() => {
    const messages: string[] = [];
    if (telemetry.length === 0) {
      messages.push('Insufficient data for analysis. Waiting for telemetry readings.');
      return messages;
    }
    const latest = telemetry[telemetry.length - 1];
    const recent = telemetry.slice(-10);
    const temps = recent.map(t => t.temperature);
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
    const { safeMin, safeMax, warningBoundary } = settings.temperature;

    if (latest.temperature > safeMax + warningBoundary * 2 || latest.temperature < safeMin - warningBoundary * 2) {
      messages.push(`Temperature is in CRITICAL range at ${latest.temperature}°C. Immediate review required.`);
    } else if (latest.temperature > safeMax || latest.temperature < safeMin) {
      messages.push(`Temperature is outside the safe range at ${latest.temperature}°C. Approaching threshold boundary.`);
    } else if (latest.temperature > safeMax - warningBoundary) {
      messages.push(`Temperature is approaching the configured upper warning boundary (${safeMax}°C).`);
    } else if (latest.temperature < safeMin + warningBoundary) {
      messages.push(`Temperature is approaching the configured lower warning boundary (${safeMin}°C).`);
    } else {
      messages.push('Temperature is stable and within the safe range.');
    }

    const trend = score.trend;
    if (trend === 'declining') messages.push('Temperature trend is declining — conditions are worsening.');
    else if (trend === 'improving') messages.push('Temperature trend is improving — conditions are stabilizing.');
    else messages.push('Temperature trend is stable.');

    if (vibrationEvents.length > 0) {
      messages.push(`Recent vibration activity (${vibrationEvents.length} events) requires inspection of the storage unit.`);
    }

    if (connectionStatus !== 'connected') {
      messages.push('Device connection is unstable. Verify ESP32 network connectivity.');
    }

    return messages;
  }, [telemetry, vibrationEvents, connectionStatus, score, settings.temperature]);

  const earlyWarning = useMemo(() => {
    if (telemetry.length < 5) return { warning: 'Insufficient data', confidence: 0 };
    const recent = telemetry.slice(-5).map(t => t.temperature);
    const rate = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
    const latest = recent[recent.length - 1];
    const distToMax = settings.temperature.safeMax - latest;
    const distToMin = latest - settings.temperature.safeMin;

    if (rate > 0.1 && distToMax < 2) {
      return { warning: 'Temperature trending upward toward the configured warning boundary.', confidence: Math.min(90, 40 + rate * 50) };
    }
    if (rate < -0.1 && distToMin < 2) {
      return { warning: 'Temperature trending downward toward the configured lower warning boundary.', confidence: Math.min(90, 40 + Math.abs(rate) * 50) };
    }
    return { warning: 'No early warning conditions detected.', confidence: 0 };
  }, [telemetry, settings.temperature.safeMax, settings.temperature.safeMin]);

  const scoreColor = score.score >= 80 ? 'text-success-400' : score.score >= 60 ? 'text-warning-400' : score.score >= 40 ? 'text-warning-500' : 'text-danger-400';
  const scoreBg = score.score >= 80 ? 'from-success-500/20 to-success-500/5' : score.score >= 60 ? 'from-warning-500/20 to-warning-500/5' : 'from-danger-500/20 to-danger-500/5';

  const chartData = telemetry.slice(-30).map(t => ({ time: formatTime(t.timestamp), score: 100 - Math.abs(t.temperature - 5) * 10 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="info" dot>LOCAL ADVISORY MODE</Badge>
        <Badge variant="neutral">Prototype — not medical certification</Badge>
      </div>

      {/* Condition Score */}
      <Card variant="strong" className={cn('bg-gradient-to-br', scoreBg)}>
        <CardBody>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex flex-col items-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={score.score >= 80 ? '#22c55e' : score.score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${score.score * 2.64} 264`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn('text-4xl font-bold tabular-nums', scoreColor)}>{score.score}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Score</span>
                </div>
              </div>
              <Badge variant={score.riskLevel === 'low' ? 'success' : score.riskLevel === 'moderate' ? 'warning' : 'danger'} size="md" className="mt-3">
                {score.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-200 mb-1">System Condition Score</p>
                <p className="text-xs text-slate-500">Prototype advisory score — not a medical certification.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-surface-200/30">
                  <p className="text-xs text-slate-500">Trend</p>
                  <p className={cn('text-sm font-semibold flex items-center gap-1', score.trend === 'improving' ? 'text-success-400' : score.trend === 'declining' ? 'text-danger-400' : 'text-slate-300')}>
                    {score.trend === 'improving' ? <TrendingUp size={14} /> : score.trend === 'declining' ? <TrendingDown size={14} /> : <Minus size={14} />}
                    {score.trend}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-200/30">
                  <p className="text-xs text-slate-500">Risk Level</p>
                  <p className={cn('text-sm font-semibold capitalize', scoreColor)}>{score.riskLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Analysis + Early Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-primary-400" />
              Condition Analysis
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {analysis.map((msg, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-200/20">
                  <Activity size={14} className="text-primary-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{msg}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb size={16} className="text-warning-400" />
              Early Warning Engine
            </CardTitle>
            <Badge variant="neutral" size="sm">ADVISORY / PROTOTYPE</Badge>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Warning</p>
                <p className="text-sm text-slate-200">{earlyWarning.warning}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-surface-300/30 overflow-hidden">
                    <div className="h-full rounded-full bg-warning-500 transition-all duration-500" style={{ width: `${earlyWarning.confidence}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-300 tabular-nums">{earlyWarning.confidence.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Contributing factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent-400" />
            Contributing Factors
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-200/20">
                <span className="text-sm text-slate-300">{factor.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-200">{factor.value}</span>
                  <span className={cn('w-2 h-2 rounded-full', factor.impact === 'positive' ? 'bg-success-400' : factor.impact === 'negative' ? 'bg-danger-400' : 'bg-slate-500')} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Score history chart */}
      <Card>
        <CardHeader>
          <CardTitle>Condition Score History</CardTitle>
        </CardHeader>
        <CardBody>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No data available.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.3} />
                  <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.3} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,20,25,0.95)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} dot={false} animationDuration={300} name="Condition Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
