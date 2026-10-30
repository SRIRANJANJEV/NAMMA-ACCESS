import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type {
  TelemetryRecord, TelemetryReading, AlertEvent, Incident, TimelineEvent,
  AuditEntry, VibrationEvent, Settings, SystemMode, SystemStatus,
  ConnectionStatus, DemoScenario, ChatMessage, DeviceInfo, NetworkInfo,
} from '@/types';
import { storageService } from '@/services/storageService';
import { DemoTelemetryProvider, LiveTelemetryProvider, type TelemetryProvider } from '@/services/telemetryService';
import { AlertEngine } from '@/services/alertEngine';
import { TelegramNotificationService } from '@/services/notificationService';
import { VoiceService } from '@/services/voiceService';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/data/constants';
import { genId } from '@/utils/helpers';

interface VaxGuardContextType {
  // Mode
  mode: SystemMode;
  setMode: (mode: SystemMode) => void;
  isDemo: boolean;

  // Status
  systemStatus: SystemStatus;
  connectionStatus: ConnectionStatus;

  // Telemetry
  telemetry: TelemetryRecord[];
  latestReading: TelemetryRecord | null;
  addManualReading: (reading: TelemetryReading) => void;

  // Alerts
  alerts: AlertEvent[];
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  addAlertNote: (id: string, note: string) => void;
  activeAlertCount: number;
  criticalAlertCount: number;

  // Incidents
  incidents: Incident[];
  acknowledgeIncident: (id: string) => void;
  resolveIncident: (id: string) => void;
  addIncidentNote: (id: string, note: string) => void;

  // Timeline
  timeline: TimelineEvent[];

  // Audit
  audit: AuditEntry[];

  // Vibration
  vibrationEvents: VibrationEvent[];

  // Settings
  settings: Settings;
  updateSettings: (settings: Settings) => void;
  resetSettings: () => void;

  // Demo
  demoScenario: DemoScenario;
  setDemoScenario: (scenario: DemoScenario) => void;
  setDemoTemperature: (temp: number) => void;
  setDemoHumidity: (humidity: number) => void;
  triggerVibration: () => void;
  setDemoDeviceOnline: (online: boolean) => void;
  resetDemo: () => void;

  // Voice
  voiceService: VoiceService;
  speakEmergency: (message: string) => void;

  // Notifications
  telegramService: TelegramNotificationService;
  telegramConfigured: boolean;

  // Chat
  chat: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Device & Network
  deviceInfo: DeviceInfo;
  networkInfo: NetworkInfo;

  // Data management
  clearData: () => void;
  exportData: () => Record<string, unknown>;

  // Emergency overlay
  emergencyAlert: AlertEvent | null;
  dismissEmergency: () => void;
}

const VaxGuardContext = createContext<VaxGuardContextType | null>(null);

export function useVaxGuard(): VaxGuardContextType {
  const ctx = useContext(VaxGuardContext);
  if (!ctx) throw new Error('useVaxGuard must be used within VaxGuardProvider');
  return ctx;
}

export function VaxGuardProvider({ children }: { children: React.ReactNode }) {
  // Mode
  const [mode, setModeState] = useState<SystemMode>(() => storageService.getMode());
  const isDemo = mode === 'demo';

  // Status
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('normal');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(isDemo ? 'connected' : 'not_configured');

  // Data
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>(() => storageService.getTelemetry());
  const [latestReading, setLatestReading] = useState<TelemetryRecord | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>(() => storageService.getAlerts());
  const [incidents, setIncidents] = useState<Incident[]>(() => storageService.getIncidents());
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => storageService.getTimeline());
  const [audit, setAudit] = useState<AuditEntry[]>(() => storageService.getAudit());
  const [vibrationEvents, setVibrationEvents] = useState<VibrationEvent[]>(() => storageService.getVibrationEvents());
  const [settings, setSettings] = useState<Settings>(() => storageService.getSettings());
  const [chat, setChat] = useState<ChatMessage[]>(() => storageService.getChat());

  // Demo
  const [demoScenario, setDemoScenarioState] = useState<DemoScenario>('normal');

  // Emergency
  const [emergencyAlert, setEmergencyAlert] = useState<AlertEvent | null>(null);

  // Services (refs)
  const alertEngineRef = useRef<AlertEngine>(new AlertEngine(settings));
  const providerRef = useRef<TelemetryProvider | null>(null);
  const voiceServiceRef = useRef<VoiceService>(new VoiceService());
  const telegramServiceRef = useRef<TelegramNotificationService>(new TelegramNotificationService(settings));
  const startTimeRef = useRef<number>(Date.now());

  // Device & Network info
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    name: settings.general.deviceName,
    model: 'ESP32-WROOM-32 DevKit V1',
    firmware: 'N/A',
    connection: isDemo ? 'connected' : 'not_configured',
    uptime: 0,
    lastTelemetry: null,
    lastRestart: null,
    freeMemory: null,
    signalStrength: null,
    sensors: { dht11: 'unknown', sw420: 'unknown' },
  });

  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    wifiStatus: isDemo ? 'connected' : 'not_configured',
    serverStatus: isDemo ? 'connected' : 'not_configured',
    apiStatus: isDemo ? 'connected' : 'not_configured',
    websocketStatus: 'not_configured',
    latency: null,
    lastSuccessfulUpdate: null,
    reconnectAttempts: 0,
    errorMessage: null,
  });

  // ===== Persistence effects =====
  useEffect(() => { storageService.setTelemetry(telemetry); }, [telemetry]);
  useEffect(() => { storageService.setAlerts(alerts); }, [alerts]);
  useEffect(() => { storageService.setIncidents(incidents); }, [incidents]);
  useEffect(() => { storageService.setTimeline(timeline); }, [timeline]);
  useEffect(() => { storageService.setAudit(audit); }, [audit]);
  useEffect(() => { storageService.setVibrationEvents(vibrationEvents); }, [vibrationEvents]);
  useEffect(() => { storageService.setSettings(settings); }, [settings]);
  useEffect(() => { storageService.setChat(chat); }, [chat]);

  // ===== Helper: add audit entry =====
  const addAudit = useCallback((action: string, category: AuditEntry['category'], details: string) => {
    const entry: AuditEntry = {
      id: genId('audit'),
      timestamp: Date.now(),
      action,
      category,
      actor: isDemo ? 'demo' : 'user',
      details,
    };
    setAudit(prev => [entry, ...prev].slice(0, 500));
  }, [isDemo]);

  // ===== Helper: add timeline event =====
  const addTimelineEvent = useCallback((type: TimelineEvent['type'], severity: TimelineEvent['severity'], title: string, description: string, source: string) => {
    const event: TimelineEvent = {
      id: genId('tl'),
      timestamp: Date.now(),
      type,
      severity,
      title,
      description,
      source,
    };
    setTimeline(prev => [event, ...prev].slice(0, 500));
  }, []);

  // ===== Alert callback =====
  const handleAlert = useCallback((alert: AlertEvent) => {
    setAlerts(prev => [alert, ...prev].slice(0, 200));

    // Add to timeline
    addTimelineEvent(
      alert.category === 'vibration' ? 'vibration' : alert.category === 'recovery' ? 'recovery' : alert.category === 'network' ? 'network' : alert.category === 'temperature' ? 'temperature' : 'system',
      alert.severity,
      alert.title,
      alert.description,
      alert.source
    );

    // Create incident for warning/critical
    if (alert.severity === 'critical' || alert.severity === 'warning') {
      const incident: Incident = {
        id: genId('inc'),
        alertId: alert.id,
        timestamp: alert.timestamp,
        severity: alert.severity,
        category: alert.category,
        title: alert.title,
        description: alert.description,
        sensorValue: alert.sensorValue || 'N/A',
        threshold: alert.threshold || 'N/A',
        duration: 0,
        status: 'active',
        acknowledged: false,
        notes: [],
        telemetrySnapshot: telemetry.slice(-20),
      };
      setIncidents(prev => [incident, ...prev].slice(0, 100));
    }

    // Emergency overlay for critical
    if (alert.severity === 'critical') {
      setEmergencyAlert(alert);

      // Voice alert
      if (settings.voice.emergencyVoiceEnabled) {
        voiceServiceRef.current.speakEmergencyAlert(alert.title);
      }

      // Telegram notification
      if (settings.alerts.telegramAlerts && telegramServiceRef.current.isConfigured()) {
        telegramServiceRef.current.sendTelegramAlert(alert);
      }
    }

    // Audit
    addAudit(`Alert: ${alert.title}`, alert.category, alert.description);
  }, [telemetry, settings, addTimelineEvent, addAudit]);

  // ===== Status callback =====
  const handleStatusChange = useCallback((status: SystemStatus) => {
    setSystemStatus(status);
  }, []);

  // ===== Vibration callback =====
  const handleVibration = useCallback((timestamp: number) => {
    const event: VibrationEvent = {
      id: genId('vib'),
      timestamp,
      intensity: 'detected',
      duration: 0,
    };
    setVibrationEvents(prev => [event, ...prev].slice(0, 200));
  }, []);

  // ===== Setup alert engine callbacks =====
  useEffect(() => {
    alertEngineRef.current.setCallbacks(handleAlert, handleStatusChange, handleVibration);
  }, [handleAlert, handleStatusChange, handleVibration]);

  // ===== Update settings in services =====
  useEffect(() => {
    alertEngineRef.current.setSettings(settings);
    telegramServiceRef.current.setSettings(settings);
    voiceServiceRef.current.setVolume(settings.voice.volume);
  }, [settings]);

  // ===== Telemetry handling =====
  const handleTelemetry = useCallback((reading: TelemetryReading) => {
    const record: TelemetryRecord = { ...reading, id: genId('tel') };
    setLatestReading(record);
    setTelemetry(prev => {
      const max = settings.data.maxTelemetryRecords;
      return [...prev, record].slice(-max);
    });

    // Process through alert engine
    alertEngineRef.current.process(reading, isDemo);

    // Update device info
    setDeviceInfo(prev => ({
      ...prev,
      connection: 'connected',
      lastTelemetry: reading.timestamp,
      sensors: {
        dht11: 'online',
        sw420: 'online',
      },
    }));

    // Update network info
    setNetworkInfo(prev => ({
      ...prev,
      lastSuccessfulUpdate: reading.timestamp,
      latency: prev.latency,
    }));
  }, [isDemo, settings.data.maxTelemetryRecords]);

  // ===== Connection status handler =====
  const handleConnectionChange = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
    setDeviceInfo(prev => ({ ...prev, connection: status }));
    setNetworkInfo(prev => ({
      ...prev,
      wifiStatus: status,
      serverStatus: status,
      apiStatus: status,
      errorMessage: status === 'error' ? 'Connection failed' : null,
      reconnectAttempts: status === 'error' ? prev.reconnectAttempts + 1 : prev.reconnectAttempts,
    }));

    if (status === 'connected') {
      addTimelineEvent('network', 'system', 'Device Connected', 'Telemetry connection established', isDemo ? 'demo' : 'live');
    } else if (status === 'disconnected' || status === 'error') {
      addTimelineEvent('network', 'warning', 'Device Disconnected', `Connection ${status}`, isDemo ? 'demo' : 'live');
    }
  }, [isDemo, addTimelineEvent]);

  // ===== Start/stop telemetry provider =====
  useEffect(() => {
    // Stop existing provider
    if (providerRef.current) {
      providerRef.current.stop();
      providerRef.current = null;
    }

    if (isDemo) {
      const provider = new DemoTelemetryProvider(
        settings,
        handleTelemetry,
        handleConnectionChange
      );
      providerRef.current = provider;
      provider.start();
    } else {
      const provider = new LiveTelemetryProvider(
        settings,
        handleTelemetry,
        handleConnectionChange
      );
      providerRef.current = provider;
      provider.start();
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.stop();
        providerRef.current = null;
      }
    };
  }, [mode]); // Only restart on mode change — settings handled separately

  // Update provider settings without restart (for demo)
  useEffect(() => {
    if (providerRef.current && isDemo) {
      (providerRef.current as DemoTelemetryProvider).setSettings(settings);
    }
  }, [settings, isDemo]);

  // ===== Uptime timer =====
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceInfo(prev => ({
        ...prev,
        uptime: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===== Mode switching =====
  const setMode = useCallback((newMode: SystemMode) => {
    setModeState(newMode);
    storageService.setMode(newMode);
    addAudit('Mode Changed', 'system', `Switched to ${newMode === 'demo' ? 'DEMO LAB' : 'LIVE HARDWARE'} mode`);
    addTimelineEvent('system', 'system', 'Mode Changed', `Switched to ${newMode === 'demo' ? 'DEMO LAB' : 'LIVE HARDWARE'} mode`, 'user');
    alertEngineRef.current.reset();
    setSystemStatus('normal');
  }, [addAudit, addTimelineEvent]);

  // ===== Demo controls =====
  const setDemoScenario = useCallback((scenario: DemoScenario) => {
    setDemoScenarioState(scenario);
    if (providerRef.current && isDemo) {
      (providerRef.current as DemoTelemetryProvider).setScenario(scenario);
    }
    addAudit('Demo Scenario', 'demo', `Scenario set to: ${scenario.toUpperCase()}`);
    addTimelineEvent('demo', scenario === 'normal' ? 'normal' : scenario === 'offline' ? 'warning' : 'warning', 'Demo Scenario', `Scenario: ${scenario.replace('_', ' ').toUpperCase()}`, 'demo');
  }, [isDemo, addAudit, addTimelineEvent]);

  const setDemoTemperature = useCallback((temp: number) => {
    if (providerRef.current && isDemo) {
      (providerRef.current as DemoTelemetryProvider).setManualTemperature(temp);
    }
  }, [isDemo]);

  const setDemoHumidity = useCallback((humidity: number) => {
    if (providerRef.current && isDemo) {
      (providerRef.current as DemoTelemetryProvider).setManualHumidity(humidity);
    }
  }, [isDemo]);

  const triggerVibration = useCallback(() => {
    if (providerRef.current && isDemo) {
      (providerRef.current as DemoTelemetryProvider).triggerVibration();
    }
  }, [isDemo]);

  const setDemoDeviceOnline = useCallback((online: boolean) => {
    if (providerRef.current && isDemo) {
      (providerRef.current as DemoTelemetryProvider).setDeviceOnline(online);
    }
  }, [isDemo]);

  const resetDemo = useCallback(() => {
    setDemoScenario('normal');
    if (providerRef.current && isDemo) {
      (providerRef.current as DemoTelemetryProvider).setManualTemperature(5.0);
      (providerRef.current as DemoTelemetryProvider).setManualHumidity(55);
      (providerRef.current as DemoTelemetryProvider).setDeviceOnline(true);
    }
    alertEngineRef.current.reset();
    setSystemStatus('normal');
    addAudit('Demo Reset', 'demo', 'Demo state reset to normal');
    addTimelineEvent('demo', 'system', 'Demo Reset', 'Demo state reset to normal', 'demo');
  }, [setDemoScenario, addAudit, addTimelineEvent]);

  // ===== Alert actions =====
  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.acknowledged ? a : {
      ...a,
      acknowledged: true,
      acknowledgedAt: Date.now(),
      acknowledgedBy: 'operator',
    }));
    addAudit('Alert Acknowledged', 'alert', `Alert ${id} acknowledged`);
  }, [addAudit]);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      resolved: true,
      resolvedAt: Date.now(),
    } : a));
    addAudit('Alert Resolved', 'alert', `Alert ${id} resolved`);
  }, [addAudit]);

  const addAlertNote = useCallback((id: string, note: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      notes: [...a.notes, note],
    } : a));
    addAudit('Note Added', 'alert', `Note added to alert ${id}: ${note}`);
  }, [addAudit]);

  // ===== Incident actions =====
  const acknowledgeIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? {
      ...i,
      acknowledged: true,
      acknowledgedAt: Date.now(),
      acknowledgedBy: 'operator',
      status: 'acknowledged' as const,
    } : i));
    addAudit('Incident Acknowledged', 'alert', `Incident ${id} acknowledged`);
  }, [addAudit]);

  const resolveIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? {
      ...i,
      status: 'resolved' as const,
      resolvedAt: Date.now(),
    } : i));
    addAudit('Incident Resolved', 'alert', `Incident ${id} resolved`);
  }, [addAudit]);

  const addIncidentNote = useCallback((id: string, note: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? {
      ...i,
      notes: [...i.notes, note],
    } : i));
    addAudit('Note Added', 'alert', `Note added to incident ${id}`);
  }, [addAudit]);

  // ===== Settings =====
  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    addAudit('Settings Changed', 'settings', 'System settings updated');
    addTimelineEvent('settings', 'system', 'Settings Changed', 'System configuration updated', 'user');
  }, [addAudit, addTimelineEvent]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    addAudit('Settings Reset', 'settings', 'Settings reset to defaults');
  }, [addAudit]);

  // ===== Chat =====
  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChat(prev => [...prev, msg].slice(-100));
  }, []);

  const clearChat = useCallback(() => {
    setChat([]);
    storageService.setChat([]);
  }, []);

  // ===== Voice =====
  const speakEmergency = useCallback((message: string) => {
    if (settings.voice.emergencyVoiceEnabled) {
      voiceServiceRef.current.speakEmergencyAlert(message);
    }
  }, [settings.voice.emergencyVoiceEnabled]);

  // ===== Data management =====
  const clearData = useCallback(() => {
    setTelemetry([]);
    setAlerts([]);
    setIncidents([]);
    setTimeline([]);
    setAudit([]);
    setVibrationEvents([]);
    setChat([]);
    storageService.clearAll();
    addAudit('Data Cleared', 'system', 'All local data cleared');
  }, [addAudit]);

  const exportData = useCallback(() => {
    return storageService.exportAll();
  }, []);

  // ===== Dismiss emergency =====
  const dismissEmergency = useCallback(() => {
    setEmergencyAlert(null);
  }, []);

  // ===== Computed values =====
  const activeAlertCount = alerts.filter(a => !a.resolved).length;
  const criticalAlertCount = alerts.filter(a => a.severity === 'critical' && !a.resolved).length;

  const value: VaxGuardContextType = {
    mode,
    setMode,
    isDemo,
    systemStatus,
    connectionStatus,
    telemetry,
    latestReading,
    addManualReading: handleTelemetry,
    alerts,
    acknowledgeAlert,
    resolveAlert,
    addAlertNote,
    activeAlertCount,
    criticalAlertCount,
    incidents,
    acknowledgeIncident,
    resolveIncident,
    addIncidentNote,
    timeline,
    audit,
    vibrationEvents,
    settings,
    updateSettings,
    resetSettings,
    demoScenario,
    setDemoScenario,
    setDemoTemperature,
    setDemoHumidity,
    triggerVibration,
    setDemoDeviceOnline,
    resetDemo,
    voiceService: voiceServiceRef.current,
    speakEmergency,
    telegramService: telegramServiceRef.current,
    telegramConfigured: telegramServiceRef.current.isConfigured(),
    chat,
    addChatMessage,
    clearChat,
    deviceInfo,
    networkInfo,
    clearData,
    exportData,
    emergencyAlert,
    dismissEmergency,
  };

  return React.createElement(VaxGuardContext.Provider, { value }, children);
}
