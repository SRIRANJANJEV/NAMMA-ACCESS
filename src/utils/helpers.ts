import type { TelemetryRecord } from '@/types';

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = average(values);
  const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function getTemperatureStats(records: TelemetryRecord[]) {
  if (records.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0, trend: 'stable' as const, rateOfChange: 0 };
  }
  const temps = records.map(r => r.temperature);
  const current = temps[temps.length - 1];
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const avg = average(temps);

  // Trend calculation
  const recent = temps.slice(-10);
  let rateOfChange = 0;
  if (recent.length >= 2) {
    rateOfChange = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
  }
  const trend = rateOfChange > 0.1 ? 'rising' : rateOfChange < -0.1 ? 'falling' : 'stable';

  return { min, max, avg, current, trend, rateOfChange };
}

export function getHumidityStats(records: TelemetryRecord[]) {
  if (records.length === 0) {
    return { min: 0, max: 0, avg: 0, current: 0, trend: 'stable' as const };
  }
  const hums = records.map(r => r.humidity);
  const current = hums[hums.length - 1];
  const min = Math.min(...hums);
  const max = Math.max(...hums);
  const avg = average(hums);
  const recent = hums.slice(-10);
  let rateOfChange = 0;
  if (recent.length >= 2) {
    rateOfChange = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
  }
  const trend = rateOfChange > 0.5 ? 'rising' : rateOfChange < -0.5 ? 'falling' : 'stable';
  return { min, max, avg, current, trend };
}

export function toCSV(records: Record<string, unknown>[]): string {
  if (records.length === 0) return '';
  const headers = Object.keys(records[0]);
  const rows = records.map(r =>
    headers.map(h => {
      const val = r[h];
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function calculateConditionScore(
  records: TelemetryRecord[],
  vibrationCount: number,
  connectionStatus: string,
  activeAlerts: number
): { score: number; riskLevel: 'low' | 'moderate' | 'high' | 'severe'; trend: 'improving' | 'stable' | 'declining' } {
  let score = 100;

  if (records.length === 0) {
    return { score: 50, riskLevel: 'moderate', trend: 'stable' };
  }

  const recent = records.slice(-30);
  const temps = recent.map(r => r.temperature);
  const outOfRange = temps.filter(t => t < 2 || t > 8).length;
  const criticalCount = temps.filter(t => t < 0 || t > 10).length;

  // Deduct for out-of-range readings
  score -= (outOfRange / recent.length) * 30;
  score -= (criticalCount / recent.length) * 25;

  // Deduct for vibration events
  score -= Math.min(vibrationCount * 3, 15);

  // Deduct for connection issues
  if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
    score -= 20;
  }

  // Deduct for active alerts
  score -= Math.min(activeAlerts * 5, 15);

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Trend
  const first10 = temps.slice(0, Math.min(10, temps.length));
  const last10 = temps.slice(-Math.min(10, temps.length));
  const firstAvg = average(first10);
  const lastAvg = average(last10);
  const trend = lastAvg < firstAvg - 0.3 ? 'improving' : lastAvg > firstAvg + 0.3 ? 'declining' : 'stable';

  let riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  if (score >= 80) riskLevel = 'low';
  else if (score >= 60) riskLevel = 'moderate';
  else if (score >= 40) riskLevel = 'high';
  else riskLevel = 'severe';

  return { score, riskLevel, trend };
}
