import type { AlertEvent, Settings } from '@/types';

export type NotificationResult = 'sent' | 'not_configured' | 'error' | 'cooldown';

export interface NotificationService {
  sendTelegramAlert(alert: AlertEvent): Promise<NotificationResult>;
  isConfigured(): boolean;
}

export class TelegramNotificationService implements NotificationService {
  private settings: Settings;
  private lastSentTime: number = 0;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
  }

  isConfigured(): boolean {
    return this.settings.telegram.configured && !!this.settings.telegram.backendUrl.trim();
  }

  async sendTelegramAlert(alert: AlertEvent): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return 'not_configured';
    }

    const now = Date.now();
    const cooldown = this.settings.alerts.cooldown * 1000;
    if (now - this.lastSentTime < cooldown) {
      return 'cooldown';
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${this.settings.telegram.backendUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          timestamp: alert.timestamp,
          sensorValue: alert.sensorValue,
          threshold: alert.threshold,
        }),
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.lastSentTime = now;
      return 'sent';
    } catch {
      return 'error';
    }
  }
}
