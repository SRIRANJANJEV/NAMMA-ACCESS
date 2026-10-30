import type { TelemetryRecord, AlertEvent, Incident, TimelineEvent, Settings, SystemStatus, ChatMessage } from '@/types';

export interface AIAssistantContext {
  telemetry: TelemetryRecord[];
  alerts: AlertEvent[];
  incidents: Incident[];
  timeline: TimelineEvent[];
  settings: Settings;
  currentStatus: SystemStatus;
  latestReading: TelemetryRecord | null;
  vibrationEventCount: number;
}

export interface AIAssistantService {
  ask(question: string, context: AIAssistantContext): string;
  isLocalMode(): boolean;
}

function genChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createChatMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return { id: genChatId(), role, content, timestamp: Date.now() };
}

export class LocalAIAssistant implements AIAssistantService {
  isLocalMode(): boolean {
    return true;
  }

  ask(question: string, ctx: AIAssistantContext): string {
    const q = question.toLowerCase().trim();
    const latest = ctx.latestReading;
    const { safeMin, safeMax } = ctx.settings.temperature;

    // Current temperature
    if (q.includes('temperature') && (q.includes('current') || q.includes('what') || q.includes('now') || q.includes('the'))) {
      if (!latest) return 'No telemetry data available yet. The system is waiting for sensor readings.';
      const temp = latest.temperature;
      const status = temp >= safeMin && temp <= safeMax ? 'within the safe range' : temp > safeMax ? 'above the safe range' : 'below the safe range';
      return `The current temperature is ${temp}°C, which is ${status} (${safeMin}°C to ${safeMax}°C). System status: ${ctx.currentStatus.toUpperCase()}.`;
    }

    // System safe?
    if (q.includes('safe') || q.includes('status') && !q.includes('device')) {
      switch (ctx.currentStatus) {
        case 'normal':
          return 'The system is currently SAFE. All sensor readings are within normal parameters. No active alerts.';
        case 'warning':
          return 'The system is in WARNING state. Temperature or humidity is outside the safe range but has not reached critical levels. Review the live monitoring page for details.';
        case 'critical':
          return 'The system is in CRITICAL state. Immediate attention is required. Check the emergency overlay for details and recommended actions.';
        case 'offline':
          return 'The system is OFFLINE. The ESP32 device is not responding. Last known telemetry values are retained for reference.';
        case 'recovery':
          return 'The system is in RECOVERY. Conditions are returning to normal after an incident.';
      }
    }

    // Why warning
    if (q.includes('why') && (q.includes('warning') || q.includes('critical'))) {
      if (!latest) return 'No telemetry data available to determine the cause.';
      const reasons: string[] = [];
      if (latest.temperature > safeMax) reasons.push(`temperature is ${latest.temperature}°C, above the safe maximum of ${safeMax}°C`);
      if (latest.temperature < safeMin) reasons.push(`temperature is ${latest.temperature}°C, below the safe minimum of ${safeMin}°C`);
      if (latest.humidity > 70) reasons.push(`humidity is high at ${latest.humidity}%`);
      if (ctx.vibrationEventCount > 0) reasons.push(`${ctx.vibrationEventCount} vibration event(s) have been detected`);
      if (reasons.length === 0) return 'The system warning may have been triggered by a recent transient condition. Check the event timeline for details.';
      return `The system is in ${ctx.currentStatus.toUpperCase()} because: ${reasons.join(', ')}.`;
    }

    // Recent events / what happened
    if (q.includes('recent') || q.includes('happened') || q.includes('today') || q.includes('summar')) {
      const recentEvents = ctx.timeline.slice(0, 5);
      if (recentEvents.length === 0) return 'No recent events recorded.';
      const summary = recentEvents.map(e => `${e.title} at ${new Date(e.timestamp).toLocaleTimeString()}`).join('; ');
      return `Recent events: ${summary}. Total events logged: ${ctx.timeline.length}.`;
    }

    // Device status
    if (q.includes('device') || q.includes('esp') || q.includes('hardware')) {
      if (!latest) return 'No device data available.';
      return `Device: ${ctx.settings.general.deviceName}. Status: ${latest.deviceOnline ? 'ONLINE' : 'OFFLINE'}. Last telemetry received at ${new Date(latest.timestamp).toLocaleString()}.`;
    }

    // Temperature trend
    if (q.includes('trend') || q.includes('change') || q.includes('history')) {
      if (ctx.telemetry.length < 2) return 'Not enough data to determine trend yet.';
      const recent = ctx.telemetry.slice(-10);
      const temps = recent.map(t => t.temperature);
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
      const first = temps[0];
      const last = temps[temps.length - 1];
      const diff = last - first;
      const direction = diff > 0.3 ? 'increasing' : diff < -0.3 ? 'decreasing' : 'stable';
      return `Temperature is ${direction}. Recent average: ${avg.toFixed(1)}°C. Change over last ${recent.length} readings: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}°C.`;
    }

    // Humidity
    if (q.includes('humidity') || q.includes('moisture')) {
      if (!latest) return 'No humidity data available.';
      return `Current humidity is ${latest.humidity}%. ${latest.humidity > 70 ? 'Humidity is above recommended levels.' : latest.humidity < 30 ? 'Humidity is below recommended levels.' : 'Humidity is within acceptable range.'}`;
    }

    // Vibration
    if (q.includes('vibration') || q.includes('shock') || q.includes('disturb')) {
      return `Total vibration events detected: ${ctx.vibrationEventCount}. ${ctx.vibrationEventCount > 0 ? 'Recent vibration activity has been logged. Check the Vibration & Shock page for the event timeline.' : 'No vibration events detected in the current session.'}`;
    }

    // Incidents
    if (q.includes('incident') || q.includes('alert')) {
      const active = ctx.incidents.filter(i => i.status !== 'resolved');
      const resolved = ctx.incidents.filter(i => i.status === 'resolved');
      return `There are ${active.length} active incident(s) and ${resolved.length} resolved incident(s). ${active.length > 0 ? 'Active incidents require attention.' : 'No active incidents at this time.'}`;
    }

    // Inspect / what should I do
    if (q.includes('inspect') || q.includes('should') || q.includes('do') || q.includes('recommend') || q.includes('check')) {
      const checks: string[] = [];
      if (ctx.currentStatus === 'critical') checks.push('Verify the storage unit is functioning and check the cooling system immediately');
      if (ctx.currentStatus === 'warning') checks.push('Monitor temperature closely and prepare to take corrective action');
      if (ctx.vibrationEventCount > 0) checks.push('Inspect the storage unit for physical disturbance or tampering');
      if (ctx.currentStatus === 'offline') checks.push('Check the ESP32 power supply and network connectivity');
      if (checks.length === 0) checks.push('All systems are operating normally. No specific inspection needed at this time.');
      return `Recommended checks: ${checks.join('; ')}.`;
    }

    // Network
    if (q.includes('network') || q.includes('connect') || q.includes('online')) {
      if (!latest) return 'No connection data available.';
      return `Device is ${latest.deviceOnline ? 'ONLINE and connected' : 'OFFLINE'}. ${latest.deviceOnline ? 'Telemetry is being received normally.' : 'Connection has been lost. Last known data is retained.'}`;
    }

    // Help
    if (q.includes('help') || q.includes('what can')) {
      return 'I can answer questions about current temperature, humidity, system status, vibration events, recent incidents, temperature trends, device status, and recommended inspections. Try asking: "What is the current temperature?" or "Is the system safe?" or "Summarize today\'s events."';
    }

    // Default
    return `I don't have a specific answer for that question. I can help with: current temperature, system status, recent events, device status, temperature trends, vibration events, and recommended checks. (Local Advisory Mode — no external AI configured.)`;
  }
}

export const aiAssistant = new LocalAIAssistant();
