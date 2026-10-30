import type { TelemetryReading, TelemetryRecord, Settings, ConnectionStatus, SystemMode, DemoScenario } from '@/types';

export interface TelemetryProvider {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getLatest(): TelemetryRecord | null;
  getConnectionStatus(): ConnectionStatus;
  setSettings(settings: Settings): void;
}

export type TelemetryCallback = (reading: TelemetryReading) => void;
export type ConnectionCallback = (status: ConnectionStatus) => void;

let idCounter = 0;
function genId(): string {
  return `tel_${Date.now()}_${++idCounter}`;
}

// ===== Demo Telemetry Provider =====

export class DemoTelemetryProvider implements TelemetryProvider {
  private interval: ReturnType<typeof setInterval> | null = null;
  private callback: TelemetryCallback | null = null;
  private connCallback: ConnectionCallback | null = null;
  private latest: TelemetryRecord | null = null;
  private running = false;
  private settings: Settings;
  private scenario: DemoScenario = 'normal';
  private manualTemp: number | null = null;
  private manualHumidity: number | null = null;
  private vibrationTriggered = false;
  private deviceOnline = true;
  private phase = 0;
  private baseTemp = 5.0;
  private baseHumidity = 55;
  private targetTemp = 5.0;
  private targetHumidity = 55;
  private vibrationCounter = 0;

  constructor(settings: Settings, cb: TelemetryCallback, connCb: ConnectionCallback) {
    this.settings = settings;
    this.callback = cb;
    this.connCallback = connCb;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.connCallback?.('connected');
    this.interval = setInterval(() => this.tick(), this.settings.demo.updateInterval);
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.running = false;
  }

  isRunning(): boolean {
    return this.running;
  }

  getLatest(): TelemetryRecord | null {
    return this.latest;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.deviceOnline ? 'connected' : 'disconnected';
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
    if (this.running) {
      this.stop();
      this.start();
    }
  }

  setScenario(scenario: DemoScenario): void {
    this.scenario = scenario;
    this.phase = 0;
    switch (scenario) {
      case 'normal':
        this.targetTemp = 5.0;
        this.targetHumidity = 55;
        this.deviceOnline = true;
        break;
      case 'warning':
        this.targetTemp = 9.0;
        this.targetHumidity = 65;
        this.deviceOnline = true;
        break;
      case 'high_temp':
        this.targetTemp = 12.0;
        this.targetHumidity = 70;
        this.deviceOnline = true;
        break;
      case 'low_temp':
        this.targetTemp = -1.0;
        this.targetHumidity = 45;
        this.deviceOnline = true;
        break;
      case 'vibration':
        this.targetTemp = 5.5;
        this.targetHumidity = 56;
        this.deviceOnline = true;
        break;
      case 'critical':
        this.targetTemp = 15.0;
        this.targetHumidity = 75;
        this.deviceOnline = true;
        break;
      case 'offline':
        this.deviceOnline = false;
        this.connCallback?.('disconnected');
        return;
      case 'recovery':
        this.targetTemp = 5.0;
        this.targetHumidity = 55;
        this.deviceOnline = true;
        this.connCallback?.('connected');
        break;
    }
  }

  setManualTemperature(temp: number): void {
    this.manualTemp = temp;
    this.targetTemp = temp;
  }

  setManualHumidity(humidity: number): void {
    this.manualHumidity = humidity;
    this.targetHumidity = humidity;
  }

  triggerVibration(): void {
    this.vibrationTriggered = true;
  }

  setDeviceOnline(online: boolean): void {
    this.deviceOnline = online;
    if (online) {
      this.connCallback?.('connected');
    } else {
      this.connCallback?.('disconnected');
    }
  }

  private tick(): void {
    if (!this.deviceOnline) {
      // Don't generate new readings when offline — keep last known
      return;
    }

    this.phase += 0.05;
    const smoothness = this.settings.demo.smoothness;
    const noise = this.settings.demo.noiseLevel;

    // Smooth interpolation toward target
    this.baseTemp += (this.targetTemp - this.baseTemp) * (1 - smoothness);
    this.baseHumidity += (this.targetHumidity - this.baseHumidity) * (1 - smoothness) * 0.5;

    // Add subtle noise
    const tempNoise = (Math.sin(this.phase * 1.3) + Math.sin(this.phase * 2.7)) * noise * 0.3;
    const humNoise = (Math.sin(this.phase * 0.7) + Math.cos(this.phase * 1.1)) * noise * 0.5;

    const temperature = Math.round((this.baseTemp + tempNoise) * 10) / 10;
    const humidity = Math.round(Math.max(0, Math.min(100, this.baseHumidity + humNoise)));

    // Vibration logic
    let vibration = false;
    if (this.scenario === 'vibration') {
      // Periodic vibration events
      if (Math.sin(this.phase * 2) > 0.7) {
        vibration = true;
        this.vibrationCounter++;
      }
    }
    if (this.vibrationTriggered) {
      vibration = true;
      this.vibrationCounter++;
      this.vibrationTriggered = false;
    }

    const reading: TelemetryReading = {
      temperature,
      humidity,
      vibration,
      timestamp: Date.now(),
      deviceOnline: true,
    };

    const record: TelemetryRecord = { ...reading, id: genId() };
    this.latest = record;
    this.callback?.(reading);
  }
}

// ===== Live Telemetry Provider =====

export class LiveTelemetryProvider implements TelemetryProvider {
  private interval: ReturnType<typeof setInterval> | null = null;
  private ws: WebSocket | null = null;
  private callback: TelemetryCallback | null = null;
  private connCallback: ConnectionCallback | null = null;
  private latest: TelemetryRecord | null = null;
  private running = false;
  private settings: Settings;
  private connectionStatus: ConnectionStatus = 'disconnected';

  constructor(settings: Settings, cb: TelemetryCallback, connCb: ConnectionCallback) {
    this.settings = settings;
    this.callback = cb;
    this.connCallback = connCb;
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    const url = this.settings.telemetry.serverUrl.trim();
    if (!url) {
      this.connectionStatus = 'not_configured';
      this.connCallback?.('not_configured');
      return;
    }

    if (this.settings.telemetry.connectionType === 'websocket') {
      this.connectWebSocket(url);
    } else {
      this.connectionStatus = 'connecting';
      this.connCallback?.('connecting');
      this.startPolling(url);
    }
  }

  stop(): void {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
    this.connCallback?.('disconnected');
  }

  isRunning(): boolean {
    return this.running;
  }

  getLatest(): TelemetryRecord | null {
    return this.latest;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  setSettings(settings: Settings): void {
    const oldUrl = this.settings.telemetry.serverUrl;
    const oldType = this.settings.telemetry.connectionType;
    this.settings = settings;
    if (this.running && (oldUrl !== settings.telemetry.serverUrl || oldType !== settings.telemetry.connectionType)) {
      this.stop();
      this.start();
    } else if (this.running && this.settings.telemetry.connectionType === 'rest') {
      this.stop();
      this.start();
    }
  }

  private connectWebSocket(url: string): void {
    this.connectionStatus = 'connecting';
    this.connCallback?.('connecting');
    try {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => {
        this.connectionStatus = 'connected';
        this.connCallback?.('connected');
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const reading = this.validateTelemetry(data);
          if (reading) {
            const record: TelemetryRecord = { ...reading, id: genId() };
            this.latest = record;
            this.callback?.(reading);
          }
        } catch {
          // malformed — ignore
        }
      };
      this.ws.onerror = () => {
        this.connectionStatus = 'error';
        this.connCallback?.('error');
      };
      this.ws.onclose = () => {
        if (this.running) {
          this.connectionStatus = 'disconnected';
          this.connCallback?.('disconnected');
        }
      };
    } catch {
      this.connectionStatus = 'error';
      this.connCallback?.('error');
    }
  }

  private startPolling(url: string): void {
    const poll = async () => {
      if (!this.running) return;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const reading = this.validateTelemetry(data);
        if (reading) {
          if (this.connectionStatus !== 'connected') {
            this.connectionStatus = 'connected';
            this.connCallback?.('connected');
          }
          const record: TelemetryRecord = { ...reading, id: genId() };
          this.latest = record;
          this.callback?.(reading);
        }
      } catch {
        if (this.connectionStatus !== 'error' && this.connectionStatus !== 'disconnected') {
          this.connectionStatus = 'error';
          this.connCallback?.('error');
        }
      }
    };
    poll();
    this.interval = setInterval(poll, this.settings.telemetry.pollInterval);
  }

  private validateTelemetry(data: unknown): TelemetryReading | null {
    if (typeof data !== 'object' || data === null) return null;
    const d = data as Record<string, any>;
const s = d.sensors || d;

const temperature = Number(s.temperature);
const humidity = Number(s.humidity);
const vibration = Boolean(s.vibration);
    const timestamp = d.timestamp ? Number(d.timestamp) : Date.now();

    if (isNaN(temperature) || isNaN(humidity)) return null;
    if (!Number.isFinite(timestamp)) return null;

    return {
      temperature,
      humidity,
      vibration,
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
      deviceOnline: d.deviceOnline !== false,
    };
  }
}
