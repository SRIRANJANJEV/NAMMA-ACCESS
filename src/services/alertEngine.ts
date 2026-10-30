import type { TelemetryReading, Settings, SystemStatus, AlertEvent, Severity, EventCategory } from '@/types';

export type AlertCallback = (alert: AlertEvent) => void;
export type StatusCallback = (status: SystemStatus) => void;
export type VibrationCallback = (timestamp: number) => void;

interface AlertState {
  currentStatus: SystemStatus;
  lastAlertTime: number;
  lastAlertType: string;
  warningStartTime: number | null;
  criticalStartTime: number | null;
  lastVibrationTime: number;
  vibrationCount: number;
  wasOffline: boolean;
}

let alertIdCounter = 0;
function genAlertId(): string {
  return `alert_${Date.now()}_${++alertIdCounter}`;
}

export class AlertEngine {
  private settings: Settings;
  private state: AlertState;
  private alertCb: AlertCallback | null = null;
  private statusCb: StatusCallback | null = null;
  private vibrationCb: VibrationCallback | null = null;

  constructor(settings: Settings) {
    this.settings = settings;
    this.state = {
      currentStatus: 'normal',
      lastAlertTime: 0,
      lastAlertType: '',
      warningStartTime: null,
      criticalStartTime: null,
      lastVibrationTime: 0,
      vibrationCount: 0,
      wasOffline: false,
    };
  }

  setCallbacks(alertCb: AlertCallback, statusCb: StatusCallback, vibrationCb: VibrationCallback): void {
    this.alertCb = alertCb;
    this.statusCb = statusCb;
    this.vibrationCb = vibrationCb;
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
  }

  getStatus(): SystemStatus {
    return this.state.currentStatus;
  }

  reset(): void {
    this.state = {
      currentStatus: 'normal',
      lastAlertTime: 0,
      lastAlertType: '',
      warningStartTime: null,
      criticalStartTime: null,
      lastVibrationTime: 0,
      vibrationCount: 0,
      wasOffline: false,
    };
  }

  process(reading: TelemetryReading, isDemo: boolean): void {
    const now = reading.timestamp;
    const { safeMin, safeMax, warningBoundary, criticalDuration } = this.settings.temperature;
    const warningMax = safeMax + warningBoundary;
    const warningMin = safeMin - warningBoundary;

    // Handle device offline
    if (!reading.deviceOnline) {
      if (this.state.currentStatus !== 'offline') {
        this.changeStatus('offline', now, isDemo);
        this.state.wasOffline = true;
        this.emitAlert('critical', 'network', 'Device Offline', 'ESP32 device is not responding. Last known telemetry retained.', isDemo);
      }
      return;
    }

    // Device came back online
    if (this.state.wasOffline && reading.deviceOnline) {
      this.state.wasOffline = false;
      this.emitAlert('system', 'network', 'Device Online', 'ESP32 device reconnected successfully.', isDemo);
    }

    // Handle vibration
    if (reading.vibration) {
      const vibCooldown = this.settings.vibration.cooldown * 1000;
      if (now - this.state.lastVibrationTime > vibCooldown || this.state.lastVibrationTime === 0) {
        this.state.lastVibrationTime = now;
        this.state.vibrationCount++;
        this.vibrationCb?.(now);
        this.emitAlert('warning', 'vibration', 'Vibration Detected', `Disturbance event detected at ${new Date(now).toLocaleTimeString()}. Event count: ${this.state.vibrationCount}.`, isDemo);
      }
    }

    // Temperature analysis
    const temp = reading.temperature;
    let newStatus: SystemStatus = 'normal';

    if (temp > safeMax + warningBoundary * 2 || temp < safeMin - warningBoundary * 2) {
      // Critical range
      newStatus = 'critical';
      if (this.state.criticalStartTime === null) {
        this.state.criticalStartTime = now;
      }
      const duration = (now - this.state.criticalStartTime) / 1000;
      if (duration >= criticalDuration || this.state.currentStatus !== 'critical') {
        if (this.state.currentStatus !== 'critical') {
          this.changeStatus('critical', now, isDemo);
        }
        const isHigh = temp > safeMax;
        this.emitAlert(
          'critical',
          'temperature',
          isHigh ? 'Critical High Temperature' : 'Critical Low Temperature',
          `Temperature ${temp}°C exceeds ${isHigh ? 'maximum' : 'minimum'} safe threshold of ${isHigh ? safeMax : safeMin}°C. Duration: ${Math.round(duration)}s. Immediate review required.`,
          isDemo,
          `${temp}°C`,
          `${isHigh ? safeMax : safeMin}°C`
        );
      }
    } else if (temp > warningMax || temp < warningMin) {
      // Warning range
      newStatus = 'warning';
      if (this.state.warningStartTime === null) {
        this.state.warningStartTime = now;
      }
      if (this.state.criticalStartTime !== null) {
        // Was critical, now warning — recovery
        this.state.criticalStartTime = null;
        this.changeStatus('recovery', now, isDemo);
        this.emitAlert('info', 'recovery', 'Temperature Recovering', `Temperature returned to warning range (${temp}°C). Critical condition cleared.`, isDemo);
      } else if (this.state.currentStatus !== 'warning') {
        this.changeStatus('warning', now, isDemo);
        const isHigh = temp > safeMax;
        this.emitAlert(
          'warning',
          'temperature',
          isHigh ? 'High Temperature Warning' : 'Low Temperature Warning',
          `Temperature ${temp}°C is outside safe range (${safeMin}°C–${safeMax}°C). Approaching ${isHigh ? 'upper' : 'lower'} threshold.`,
          isDemo,
          `${temp}°C`,
          `${safeMin}°C–${safeMax}°C`
        );
      }
    } else {
      // Safe range
      if (this.state.warningStartTime !== null || this.state.criticalStartTime !== null) {
        this.state.warningStartTime = null;
        this.state.criticalStartTime = null;
        this.changeStatus('recovery', now, isDemo);
        this.emitAlert('info', 'recovery', 'Temperature Recovered', `Temperature ${temp}°C returned to safe range (${safeMin}°C–${safeMax}°C).`, isDemo);
      } else if (this.state.currentStatus === 'recovery' as SystemStatus) {
        this.changeStatus('normal', now, isDemo);
      } else if (this.state.currentStatus !== 'normal' && (this.state.currentStatus as string) !== 'recovery') {
        this.changeStatus('normal', now, isDemo);
      }
    }

    // Clear warning timer if back in safe range
    if (newStatus === 'normal' && this.state.warningStartTime !== null) {
      this.state.warningStartTime = null;
    }
  }

  private changeStatus(status: SystemStatus, timestamp: number, isDemo: boolean): void {
    this.state.currentStatus = status;
    this.statusCb?.(status);
  }

  private emitAlert(
    severity: Severity,
    category: EventCategory,
    title: string,
    description: string,
    isDemo: boolean,
    sensorValue?: string,
    threshold?: string
  ): void {
    const now = Date.now();
    const cooldown = this.settings.alerts.cooldown * 1000;
    const alertKey = `${severity}_${category}_${title}`;

    // Debounce: don't emit same alert type within cooldown
    if (alertKey === this.state.lastAlertType && now - this.state.lastAlertTime < cooldown) {
      return;
    }

    this.state.lastAlertTime = now;
    this.state.lastAlertType = alertKey;

    const alert: AlertEvent = {
      id: genAlertId(),
      timestamp: now,
      severity,
      category,
      title,
      description,
      sensorValue,
      threshold,
      acknowledged: false,
      resolved: false,
      notes: [],
      source: isDemo ? 'demo' : 'live',
    };

    this.alertCb?.(alert);
  }
}
