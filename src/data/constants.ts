import type { Settings, SystemStatus } from '@/types';

export const APP_NAME = 'VaxGuard';
export const APP_TAGLINE = 'Intelligent Vaccine Cold-Chain Guardian';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  TELEMETRY: 'vaxguard_telemetry',
  ALERTS: 'vaxguard_alerts',
  INCIDENTS: 'vaxguard_incidents',
  TIMELINE: 'vaxguard_timeline',
  AUDIT: 'vaxguard_audit',
  SETTINGS: 'vaxguard_settings',
  VIBRATION_EVENTS: 'vaxguard_vibration_events',
  MODE: 'vaxguard_mode',
  CHAT: 'vaxguard_chat',
} as const;

export const MAX_TIMELINE_EVENTS = 500;
export const MAX_AUDIT_ENTRIES = 500;
export const MAX_VIBRATION_EVENTS = 200;

export const DEFAULT_SETTINGS: Settings = {
  general: {
    appName: 'VaxGuard',
    deviceName: 'ESP32-ColdChain-01',
  },
  telemetry: {
    connectionType: 'rest',
    serverUrl: '',
    pollInterval: 2000,
  },
  temperature: {
    safeMin: 2,
    safeMax: 8,
    warningBoundary: 1,
    criticalDuration: 30,
  },
  vibration: {
    sensitivity: 'medium',
    cooldown: 10,
  },
  alerts: {
    cooldown: 60,
    debounce: 5,
    voiceAlerts: false,
    telegramAlerts: false,
  },
  telegram: {
    configured: false,
    backendUrl: '',
  },
  voice: {
    assistantEnabled: true,
    emergencyVoiceEnabled: false,
    volume: 0.7,
  },
  ai: {
    enabled: false,
    apiKey: '',
    useLocal: true,
  },
  appearance: {
    compactMode: false,
    showGrid: true,
  },
  data: {
    maxTelemetryRecords: 1000,
    autoExport: false,
  },
  demo: {
    autoSimulate: true,
    updateInterval: 2000,
    noiseLevel: 0.3,
    smoothness: 0.85,
    startScenario: 'normal',
    autoCycle: false,
    autoCycleInterval: 15000,
    autoCycleScenarios: ['normal', 'warning', 'high_temp', 'critical', 'recovery', 'normal'],
    autoCycleCurrentIndex: 0,
  },
};

export const STATUS_META: Record<SystemStatus, { label: string; color: string; bg: string; text: string; border: string; glow: string }> = {
  normal: {
    label: 'SAFE',
    color: 'text-success-400',
    bg: 'bg-success-500/10',
    text: 'text-success-400',
    border: 'border-success-500/30',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]',
  },
  warning: {
    label: 'WARNING',
    color: 'text-warning-400',
    bg: 'bg-warning-500/10',
    text: 'text-warning-400',
    border: 'border-warning-500/30',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
  critical: {
    label: 'CRITICAL',
    color: 'text-danger-400',
    bg: 'bg-danger-500/10',
    text: 'text-danger-400',
    border: 'border-danger-500/30',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  },
  offline: {
    label: 'OFFLINE',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    glow: 'shadow-[0_0_20px_rgba(100,116,139,0.15)]',
  },
  recovery: {
    label: 'RECOVERY',
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
    text: 'text-primary-400',
    border: 'border-primary-500/30',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
  },
};

export const SEVERITY_META = {
  normal: { label: 'Normal', color: 'text-success-400', bg: 'bg-success-500/10', border: 'border-success-500/20', dot: 'bg-success-400' },
  warning: { label: 'Warning', color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/20', dot: 'bg-warning-400' },
  critical: { label: 'Critical', color: 'text-danger-400', bg: 'bg-danger-500/10', border: 'border-danger-500/20', dot: 'bg-danger-400' },
  info: { label: 'Info', color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20', dot: 'bg-accent-400' },
  system: { label: 'System', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-400' },
} as const;

export const NAV_GROUPS = [
  {
    label: 'Monitoring',
    items: [
      { id: 'command-center', label: 'Command Center', icon: 'LayoutDashboard' },
      { id: 'live-monitoring', label: 'Live Monitoring', icon: 'Activity' },
      { id: 'temperature', label: 'Temperature', icon: 'Thermometer' },
      { id: 'vibration', label: 'Vibration & Shock', icon: 'Waves' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'ai-intelligence', label: 'AI Intelligence', icon: 'BrainCircuit' },
      { id: 'voice-assistant', label: 'Voice Assistant', icon: 'Mic' },
      { id: 'vaccine-risk', label: 'Vaccine Risk', icon: 'ShieldAlert' },
    ],
  },
  {
    label: 'Incidents',
    items: [
      { id: 'alerts', label: 'Alerts & Incidents', icon: 'Siren' },
      { id: 'timeline', label: 'Event Timeline', icon: 'GitCommitVertical' },
      { id: 'audit', label: 'Audit History', icon: 'ScrollText' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'device-health', label: 'Device Health', icon: 'Cpu' },
      { id: 'network', label: 'Network', icon: 'Wifi' },
      { id: 'diagnostics', label: 'Diagnostics', icon: 'Stethoscope' },
      { id: 'demo-lab', label: 'Demo Lab', icon: 'FlaskConical' },
      { id: 'settings', label: 'Settings', icon: 'Settings' },
    ],
  },
  {
    label: '',
    items: [
      { id: 'about', label: 'About VaxGuard', icon: 'Info' },
    ],
  },
] as const;

export const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  'command-center': { title: 'Command Center', subtitle: 'Executive overview of cold-chain status' },
  'live-monitoring': { title: 'Live Monitoring', subtitle: 'Real-time sensor telemetry' },
  'temperature': { title: 'Temperature Analytics', subtitle: 'Thermal analysis and excursion tracking' },
  'vibration': { title: 'Vibration & Shock', subtitle: 'Disturbance event monitoring' },
  'ai-intelligence': { title: 'AI Intelligence', subtitle: 'Advisory condition analysis' },
  'voice-assistant': { title: 'Voice Assistant', subtitle: 'Interactive VaxGuard assistant' },
  'vaccine-risk': { title: 'Vaccine Risk Assessment', subtitle: 'Cold-chain incident review' },
  'alerts': { title: 'Alerts & Incidents', subtitle: 'Incident management and tracking' },
  'timeline': { title: 'Event Timeline', subtitle: 'Chronological system events' },
  'audit': { title: 'Audit History', subtitle: 'System action log' },
  'device-health': { title: 'Device Health', subtitle: 'ESP32 hardware status' },
  'network': { title: 'Network', subtitle: 'Connection diagnostics' },
  'diagnostics': { title: 'System Diagnostics', subtitle: 'Component health checks' },
  'demo-lab': { title: 'Demo Lab', subtitle: 'Engineering test console' },
  'settings': { title: 'Settings', subtitle: 'System configuration' },
  'about': { title: 'About VaxGuard', subtitle: 'Project information and architecture' },
};

export const DISCLAIMER = 'VaxGuard is an IoT cold-chain monitoring prototype for demonstration and incident review. It does not determine vaccine potency, provide medical advice, or replace validated cold-chain procedures.';
