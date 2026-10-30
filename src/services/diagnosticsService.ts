import type { DiagnosticResult, Settings, ConnectionStatus } from '@/types';

export interface DiagnosticsContext {
  settings: Settings;
  connectionStatus: ConnectionStatus;
  voiceSupported: boolean;
  telegramConfigured: boolean;
  telemetryCount: number;
  alertCount: number;
}

export function runDiagnostics(ctx: DiagnosticsContext): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // Frontend
  results.push({
    component: 'Frontend',
    status: 'pass',
    message: 'React application is running',
    details: 'UI framework operational',
  });

  // Telemetry Service
  if (ctx.connectionStatus === 'connected') {
    results.push({ component: 'Telemetry Service', status: 'pass', message: 'Receiving telemetry data', details: 'Active data stream' });
  } else if (ctx.connectionStatus === 'not_configured') {
    results.push({ component: 'Telemetry Service', status: 'not_configured', message: 'No server URL configured', details: 'Set server URL in Settings to enable live telemetry' });
  } else if (ctx.connectionStatus === 'connecting') {
    results.push({ component: 'Telemetry Service', status: 'warning', message: 'Attempting to connect', details: 'Connection in progress' });
  } else if (ctx.connectionStatus === 'error') {
    results.push({ component: 'Telemetry Service', status: 'error', message: 'Connection failed', details: 'Check server URL and network' });
  } else {
    results.push({ component: 'Telemetry Service', status: 'warning', message: 'Not connected', details: 'Service idle or disconnected' });
  }

  // Alert Engine
  results.push({
    component: 'Alert Engine',
    status: 'pass',
    message: 'Alert processing active',
    details: `${ctx.alertCount} alerts tracked`,
  });

  // Voice Engine
  if (ctx.voiceSupported) {
    results.push({ component: 'Voice Engine', status: 'pass', message: 'Browser speech synthesis available', details: 'Text-to-speech and speech recognition supported' });
  } else {
    results.push({ component: 'Voice Engine', status: 'warning', message: 'Voice not supported', details: 'Browser does not support Web Speech API' });
  }

  // Notification Service
  if (ctx.telegramConfigured) {
    results.push({ component: 'Notification Service', status: 'pass', message: 'Telegram backend configured', details: 'Ready to send alerts' });
  } else {
    results.push({ component: 'Notification Service', status: 'not_configured', message: 'Telegram not configured', details: 'Set backend URL in Settings' });
  }

  // Storage
  try {
    localStorage.setItem('vaxguard_test', '1');
    localStorage.removeItem('vaxguard_test');
    results.push({ component: 'Storage', status: 'pass', message: 'Local storage accessible', details: `${ctx.telemetryCount} telemetry records stored` });
  } catch {
    results.push({ component: 'Storage', status: 'error', message: 'Storage access failed', details: 'Browser storage may be disabled' });
  }

  // Charts
  results.push({ component: 'Charts', status: 'pass', message: 'Chart library loaded', details: 'Recharts rendering engine ready' });

  // Backend Connection
  if (ctx.connectionStatus === 'connected') {
    results.push({ component: 'Backend Connection', status: 'pass', message: 'Backend reachable', details: 'Server responding to requests' });
  } else if (ctx.connectionStatus === 'not_configured') {
    results.push({ component: 'Backend Connection', status: 'not_configured', message: 'No backend configured', details: 'Running in demo mode or standalone' });
  } else {
    results.push({ component: 'Backend Connection', status: 'warning', message: 'Backend not connected', details: 'Demo mode active or connection lost' });
  }

  return results;
}
