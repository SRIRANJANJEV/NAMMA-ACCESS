import { STORAGE_KEYS, MAX_TIMELINE_EVENTS, MAX_AUDIT_ENTRIES, MAX_VIBRATION_EVENTS, DEFAULT_SETTINGS } from '@/data/constants';
import type { TelemetryRecord, AlertEvent, Incident, TimelineEvent, AuditEntry, VibrationEvent, Settings, SystemMode, ChatMessage } from '@/types';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full — silently ignore
  }
}

export const storageService = {
  getTelemetry(): TelemetryRecord[] {
    return safeGet<TelemetryRecord[]>(STORAGE_KEYS.TELEMETRY, []);
  },
  setTelemetry(records: TelemetryRecord[]): void {
    safeSet(STORAGE_KEYS.TELEMETRY, records);
  },
  getAlerts(): AlertEvent[] {
    return safeGet<AlertEvent[]>(STORAGE_KEYS.ALERTS, []);
  },
  setAlerts(alerts: AlertEvent[]): void {
    safeSet(STORAGE_KEYS.ALERTS, alerts);
  },
  getIncidents(): Incident[] {
    return safeGet<Incident[]>(STORAGE_KEYS.INCIDENTS, []);
  },
  setIncidents(incidents: Incident[]): void {
    safeSet(STORAGE_KEYS.INCIDENTS, incidents);
  },
  getTimeline(): TimelineEvent[] {
    return safeGet<TimelineEvent[]>(STORAGE_KEYS.TIMELINE, []).slice(0, MAX_TIMELINE_EVENTS);
  },
  setTimeline(events: TimelineEvent[]): void {
    safeSet(STORAGE_KEYS.TIMELINE, events.slice(0, MAX_TIMELINE_EVENTS));
  },
  getAudit(): AuditEntry[] {
    return safeGet<AuditEntry[]>(STORAGE_KEYS.AUDIT, []).slice(0, MAX_AUDIT_ENTRIES);
  },
  setAudit(entries: AuditEntry[]): void {
    safeSet(STORAGE_KEYS.AUDIT, entries.slice(0, MAX_AUDIT_ENTRIES));
  },
  getVibrationEvents(): VibrationEvent[] {
    return safeGet<VibrationEvent[]>(STORAGE_KEYS.VIBRATION_EVENTS, []).slice(0, MAX_VIBRATION_EVENTS);
  },
  setVibrationEvents(events: VibrationEvent[]): void {
    safeSet(STORAGE_KEYS.VIBRATION_EVENTS, events.slice(0, MAX_VIBRATION_EVENTS));
  },
  getSettings(): Settings {
    const stored = safeGet<Partial<Settings>>(STORAGE_KEYS.SETTINGS, {});
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      general: { ...DEFAULT_SETTINGS.general, ...stored.general },
      telemetry: { ...DEFAULT_SETTINGS.telemetry, ...stored.telemetry },
      temperature: { ...DEFAULT_SETTINGS.temperature, ...stored.temperature },
      vibration: { ...DEFAULT_SETTINGS.vibration, ...stored.vibration },
      alerts: { ...DEFAULT_SETTINGS.alerts, ...stored.alerts },
      telegram: { ...DEFAULT_SETTINGS.telegram, ...stored.telegram },
      voice: { ...DEFAULT_SETTINGS.voice, ...stored.voice },
      ai: { ...DEFAULT_SETTINGS.ai, ...stored.ai },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...stored.appearance },
      data: { ...DEFAULT_SETTINGS.data, ...stored.data },
      demo: { ...DEFAULT_SETTINGS.demo, ...stored.demo },
    };
  },
  setSettings(settings: Settings): void {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  },
  getMode(): SystemMode {
    return safeGet<SystemMode>(STORAGE_KEYS.MODE, 'demo');
  },
  setMode(mode: SystemMode): void {
    safeSet(STORAGE_KEYS.MODE, mode);
  },
  getChat(): ChatMessage[] {
    return safeGet<ChatMessage[]>(STORAGE_KEYS.CHAT, []);
  },
  setChat(messages: ChatMessage[]): void {
    safeSet(STORAGE_KEYS.CHAT, messages.slice(-100));
  },
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.SETTINGS) {
        localStorage.removeItem(key);
      }
    });
  },
  exportAll(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = safeGet(key, null);
    });
    return data;
  },
};
