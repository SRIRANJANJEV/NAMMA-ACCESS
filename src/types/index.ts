// ===== Core Telemetry Types =====

export type SystemMode = 'live' | 'demo';
export type SystemStatus = 'normal' | 'warning' | 'critical' | 'offline' | 'recovery';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'not_configured';
export type ConnectionType = 'rest' | 'websocket' | 'socketio';
export type Severity = 'normal' | 'warning' | 'critical' | 'info' | 'system';
export type EventCategory = 'temperature' | 'vibration' | 'network' | 'system' | 'alert' | 'recovery' | 'settings' | 'demo' | 'voice' | 'notification';
export type IncidentStatus = 'active' | 'acknowledged' | 'resolved';
export type DemoScenario = 'normal' | 'warning' | 'high_temp' | 'low_temp' | 'vibration' | 'critical' | 'offline' | 'recovery';

export interface TelemetryReading {
  temperature: number;
  humidity: number;
  vibration: boolean;
  timestamp: number;
  deviceOnline: boolean;
}

export interface TelemetryRecord extends TelemetryReading {
  id: string;
}

export interface VibrationEvent {
  id: string;
  timestamp: number;
  intensity: 'detected' | 'shock' | 'disturbance';
  duration: number;
}

export interface AlertEvent {
  id: string;
  timestamp: number;
  severity: Severity;
  category: EventCategory;
  title: string;
  description: string;
  sensorValue?: string;
  threshold?: string;
  acknowledged: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: number;
  notes: string[];
  source: string;
  incidentId?: string;
}

export interface Incident {
  id: string;
  alertId: string;
  timestamp: number;
  severity: Severity;
  category: EventCategory;
  title: string;
  description: string;
  sensorValue: string;
  threshold: string;
  duration: number;
  status: IncidentStatus;
  acknowledged: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  notes: string[];
  telemetrySnapshot: TelemetryRecord[];
  resolvedAt?: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: EventCategory;
  severity: Severity;
  title: string;
  description: string;
  source: string;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  action: string;
  category: EventCategory;
  actor: string;
  details: string;
}

export interface DeviceInfo {
  name: string;
  model: string;
  firmware: string;
  connection: ConnectionStatus;
  uptime: number;
  lastTelemetry: number | null;
  lastRestart: number | null;
  freeMemory: number | null;
  signalStrength: number | null;
  sensors: {
    dht11: 'online' | 'offline' | 'unknown';
    sw420: 'online' | 'offline' | 'unknown';
  };
}

export interface NetworkInfo {
  wifiStatus: ConnectionStatus;
  serverStatus: ConnectionStatus;
  apiStatus: ConnectionStatus;
  websocketStatus: ConnectionStatus;
  latency: number | null;
  lastSuccessfulUpdate: number | null;
  reconnectAttempts: number;
  errorMessage: string | null;
}

export interface Settings {
  general: {
    appName: string;
    deviceName: string;
  };
  telemetry: {
    connectionType: ConnectionType;
    serverUrl: string;
    pollInterval: number;
  };
  temperature: {
    safeMin: number;
    safeMax: number;
    warningBoundary: number;
    criticalDuration: number;
  };
  vibration: {
    sensitivity: 'low' | 'medium' | 'high';
    cooldown: number;
  };
  alerts: {
    cooldown: number;
    debounce: number;
    voiceAlerts: boolean;
    telegramAlerts: boolean;
  };
  telegram: {
    configured: boolean;
    backendUrl: string;
  };
  voice: {
    assistantEnabled: boolean;
    emergencyVoiceEnabled: boolean;
    volume: number;
  };
  ai: {
    enabled: boolean;
    apiKey: string;
    useLocal: boolean;
  };
  appearance: {
    compactMode: boolean;
    showGrid: boolean;
  };
  data: {
    maxTelemetryRecords: number;
    autoExport: boolean;
  };
  demo: {
    autoSimulate: boolean;
    updateInterval: number;
  noiseLevel: number;
  smoothness: number;
  startScenario: DemoScenario;
  autoCycle: boolean;
  autoCycleInterval: number;
  autoCycleScenarios: DemoScenario[];
  autoCycleCurrentIndex: number;
  };
}

export interface DiagnosticResult {
  component: string;
  status: 'pass' | 'warning' | 'error' | 'not_configured';
  message: string;
  details?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConditionScore {
  score: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  trend: 'improving' | 'stable' | 'declining';
  factors: { label: string; value: string; impact: 'positive' | 'neutral' | 'negative' }[];
}
