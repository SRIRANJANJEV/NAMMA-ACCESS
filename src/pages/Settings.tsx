import React, { useState } from 'react';
import { Settings as SettingsIcon, Thermometer, Waves, Bell, Send, Mic, BrainCircuit, Palette, Database, FlaskConical, Sliders } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { Tabs } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_SETTINGS } from '@/data/constants';
import { toCSV, downloadFile } from '@/utils/helpers';
import type { Settings as SettingsType, ConnectionType } from '@/types';
import { cn } from '@/utils/cn';

export function Settings() {
  const { settings, updateSettings, resetSettings, clearData, exportData, telegramConfigured } = useVaxGuard();
  const { toast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (partial: Partial<SettingsType>) => updateSettings({ ...settings, ...partial });

  const handleExport = () => {
    const data = exportData();
    downloadFile(JSON.stringify(data, null, 2), `vaxguard_export_${Date.now()}.json`, 'application/json');
    toast('Data exported successfully', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.SETTINGS) set(data.SETTINGS);
        toast('Settings imported successfully', 'success');
      } catch {
        toast('Failed to import: invalid file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Tabs
        tabs={[
          { id: 'general', label: 'General', icon: <SettingsIcon size={14} /> },
          { id: 'telemetry', label: 'Telemetry', icon: <Sliders size={14} /> },
          { id: 'temperature', label: 'Temperature', icon: <Thermometer size={14} /> },
          { id: 'vibration', label: 'Vibration', icon: <Waves size={14} /> },
          { id: 'alerts', label: 'Alerts', icon: <Bell size={14} /> },
          { id: 'telegram', label: 'Telegram', icon: <Send size={14} /> },
          { id: 'voice', label: 'Voice', icon: <Mic size={14} /> },
          { id: 'ai', label: 'AI Advisory', icon: <BrainCircuit size={14} /> },
          { id: 'appearance', label: 'Appearance', icon: <Palette size={14} /> },
          { id: 'data', label: 'Data', icon: <Database size={14} /> },
          { id: 'demo', label: 'Demo', icon: <FlaskConical size={14} /> },
        ]}
      >
        {(tab) => {
          switch (tab) {
            case 'general':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Field label="Application Name">
                      <input type="text" value={settings.general.appName} onChange={e => set({ general: { ...settings.general, appName: e.target.value } })} className={inputClass} />
                    </Field>
                    <Field label="Device Name">
                      <input type="text" value={settings.general.deviceName} onChange={e => set({ general: { ...settings.general, deviceName: e.target.value } })} className={inputClass} />
                    </Field>
                  </div>
                </CardBody></Card>
              );
            case 'telemetry':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Field label="Connection Type">
                      <select value={settings.telemetry.connectionType} onChange={e => set({ telemetry: { ...settings.telemetry, connectionType: e.target.value as ConnectionType } })} className={inputClass}>
                        <option value="rest">REST Polling</option>
                        <option value="websocket">WebSocket</option>
                        <option value="socketio">Socket.IO</option>
                      </select>
                    </Field>
                    <Field label="Server URL" hint="Paste your ESP32 backend server URL here">
                      <input type="text" value={settings.telemetry.serverUrl} onChange={e => set({ telemetry: { ...settings.telemetry, serverUrl: e.target.value } })} placeholder="http://192.168.1.100:3000/telemetry" className={inputClass} />
                    </Field>
                    <Field label={`Poll Interval: ${settings.telemetry.pollInterval}ms`}>
                      <input type="range" min={500} max={10000} step={500} value={settings.telemetry.pollInterval} onChange={e => set({ telemetry: { ...settings.telemetry, pollInterval: Number(e.target.value) } })} className="w-full accent-primary-500" />
                    </Field>
                  </div>
                </CardBody></Card>
              );
            case 'temperature':
              return (
                <Card><CardBody>
                  <div className="space-y-5">
                    <Slider label="Safe Minimum" value={settings.temperature.safeMin} min={-20} max={20} step={0.5} unit="°C" onChange={v => set({ temperature: { ...settings.temperature, safeMin: v } })} color="success" />
                    <Slider label="Safe Maximum" value={settings.temperature.safeMax} min={-20} max={40} step={0.5} unit="°C" onChange={v => set({ temperature: { ...settings.temperature, safeMax: v } })} color="success" />
                    <Slider label="Warning Boundary" value={settings.temperature.warningBoundary} min={0} max={5} step={0.5} unit="°C" onChange={v => set({ temperature: { ...settings.temperature, warningBoundary: v } })} color="warning" />
                    <Slider label="Critical Duration" value={settings.temperature.criticalDuration} min={0} max={300} step={5} unit="s" onChange={v => set({ temperature: { ...settings.temperature, criticalDuration: v } })} color="danger" />
                  </div>
                </CardBody></Card>
              );
            case 'vibration':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Field label="Sensitivity">
                      <select value={settings.vibration.sensitivity} onChange={e => set({ vibration: { ...settings.vibration, sensitivity: e.target.value as 'low' | 'medium' | 'high' } })} className={inputClass}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </Field>
                    <Slider label="Cooldown" value={settings.vibration.cooldown} min={1} max={60} step={1} unit="s" onChange={v => set({ vibration: { ...settings.vibration, cooldown: v } })} color="warning" />
                  </div>
                </CardBody></Card>
              );
            case 'alerts':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Slider label="Alert Cooldown" value={settings.alerts.cooldown} min={10} max={300} step={10} unit="s" onChange={v => set({ alerts: { ...settings.alerts, cooldown: v } })} color="primary" />
                    <Slider label="Debounce" value={settings.alerts.debounce} min={1} max={30} step={1} unit="s" onChange={v => set({ alerts: { ...settings.alerts, debounce: v } })} color="primary" />
                    <Toggle checked={settings.alerts.voiceAlerts} onChange={v => set({ alerts: { ...settings.alerts, voiceAlerts: v } })} label="Voice Alerts" description="Announce critical alerts via text-to-speech" />
                    <Toggle checked={settings.alerts.telegramAlerts} onChange={v => set({ alerts: { ...settings.alerts, telegramAlerts: v } })} label="Telegram Alerts" description="Send critical alerts to Telegram" />
                  </div>
                </CardBody></Card>
              );
            case 'telegram':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <div className={cn('p-3 rounded-lg border', telegramConfigured ? 'bg-success-500/10 border-success-500/20' : 'bg-slate-500/10 border-slate-500/20')}>
                      <p className="text-sm font-medium text-slate-200">
                        Telegram: {telegramConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Bot token and chat ID are stored in the backend only — never in frontend code.
                      </p>
                    </div>
                    <Toggle checked={settings.telegram.configured} onChange={v => set({ telegram: { ...settings.telegram, configured: v } })} label="Telegram Enabled" description="Enable Telegram notification backend" />
                    <Field label="Backend URL" hint="Your backend endpoint that forwards to Telegram API">
                      <input type="text" value={settings.telegram.backendUrl} onChange={e => set({ telegram: { ...settings.telegram, backendUrl: e.target.value } })} placeholder="https://your-backend.com/telegram" className={inputClass} />
                    </Field>
                  </div>
                </CardBody></Card>
              );
            case 'voice':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Toggle checked={settings.voice.assistantEnabled} onChange={v => set({ voice: { ...settings.voice, assistantEnabled: v } })} label="Voice Assistant" description="Enable interactive voice assistant" />
                    <Toggle checked={settings.voice.emergencyVoiceEnabled} onChange={v => set({ voice: { ...settings.voice, emergencyVoiceEnabled: v } })} label="Emergency Voice" description="Announce critical alerts via text-to-speech" />
                    <Slider label="Volume" value={Math.round(settings.voice.volume * 100)} min={0} max={100} step={5} unit="%" onChange={v => set({ voice: { ...settings.voice, volume: v / 100 } })} color="primary" />
                  </div>
                </CardBody></Card>
              );
            case 'ai':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Toggle checked={settings.ai.enabled} onChange={v => set({ ai: { ...settings.ai, enabled: v, useLocal: !v } })} label="External AI API" description="Connect an external LLM API (requires API key)" />
                    <Field label="API Key" hint="Stored locally — for prototype use only">
                      <input type="password" value={settings.ai.apiKey} onChange={e => set({ ai: { ...settings.ai, apiKey: e.target.value } })} placeholder="sk-..." className={inputClass} disabled={!settings.ai.enabled} />
                    </Field>
                    <div className="p-3 rounded-lg bg-accent-500/10 border border-accent-500/20">
                      <p className="text-sm text-accent-400 font-medium">LOCAL ADVISORY MODE</p>
                      <p className="text-xs text-slate-500 mt-1">When no external AI is configured, the system uses a local rule-based assistant.</p>
                    </div>
                  </div>
                </CardBody></Card>
              );
            case 'appearance':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Toggle checked={settings.appearance.compactMode} onChange={v => set({ appearance: { ...settings.appearance, compactMode: v } })} label="Compact Mode" description="Reduce padding and spacing" />
                    <Toggle checked={settings.appearance.showGrid} onChange={v => set({ appearance: { ...settings.appearance, showGrid: v } })} label="Show Grid Background" description="Display subtle grid pattern" />
                  </div>
                </CardBody></Card>
              );
            case 'data':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Slider label="Max Telemetry Records" value={settings.data.maxTelemetryRecords} min={100} max={5000} step={100} onChange={v => set({ data: { ...settings.data, maxTelemetryRecords: v } })} color="primary" />
                    <Toggle checked={settings.data.autoExport} onChange={v => set({ data: { ...settings.data, autoExport: v } })} label="Auto Export" description="Automatically export data periodically" />
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={handleExport}>Export JSON</Button>
                      <label className="cursor-pointer">
                        <span className={cn('inline-flex items-center justify-center rounded-lg border font-medium transition-all px-4 py-2 text-sm gap-2 bg-surface-200/80 hover:bg-surface-300 text-slate-200 border-surface-300/50')}>Import JSON</span>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                      </label>
                      <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}>Clear Data</Button>
                    </div>
                  </div>
                </CardBody></Card>
              );
            case 'demo':
              return (
                <Card><CardBody>
                  <div className="space-y-4">
                    <Toggle checked={settings.demo.autoSimulate} onChange={v => set({ demo: { ...settings.demo, autoSimulate: v } })} label="Auto Simulation" description="Automatically generate telemetry" />
                    <Slider label="Update Interval" value={settings.demo.updateInterval} min={500} max={5000} step={500} unit="ms" onChange={v => set({ demo: { ...settings.demo, updateInterval: v } })} color="primary" />
                    <Slider label="Noise Level" value={Math.round(settings.demo.noiseLevel * 100)} min={0} max={100} step={10} unit="%" onChange={v => set({ demo: { ...settings.demo, noiseLevel: v / 100 } })} color="primary" />
                    <Slider label="Smoothness" value={Math.round(settings.demo.smoothness * 100)} min={0} max={100} step={5} unit="%" onChange={v => set({ demo: { ...settings.demo, smoothness: v / 100 } })} color="primary" />
                  </div>
                </CardBody></Card>
              );
            default:
              return null;
          }
        }}
      </Tabs>

      {/* Reset */}
      <Card variant="outline" className="border-danger-500/20">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">Reset Settings</p>
              <p className="text-xs text-slate-500 mt-1">Restore all settings to defaults</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>Reset to Defaults</Button>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title="Clear All Data"
        message="This will permanently delete all telemetry history, alerts, incidents, timeline, and audit logs. Settings will be preserved. This cannot be undone."
        confirmLabel="Clear Data"
        onConfirm={() => { clearData(); setConfirmClear(false); toast('All data cleared', 'success'); }}
        onCancel={() => setConfirmClear(false)}
      />
      <ConfirmDialog
        open={confirmReset}
        title="Reset Settings"
        message="This will restore all settings to their default values. Your data will not be affected."
        confirmLabel="Reset"
        variant="warning"
        onConfirm={() => { resetSettings(); setConfirmReset(false); toast('Settings reset to defaults', 'success'); }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}

const inputClass = 'w-full px-3 py-2 rounded-lg bg-surface-200/40 border border-surface-300/20 text-sm text-slate-200 placeholder-slate-600 focus:border-primary-500/30 outline-none';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {hint && <p className="text-xs text-slate-600 mt-0.5 mb-1.5">{hint}</p>}
      {!hint && <div className="mb-1.5" />}
      {children}
    </div>
  );
}
