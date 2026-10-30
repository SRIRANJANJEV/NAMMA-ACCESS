import React from 'react';
import {
  FlaskConical, Thermometer, Droplets, Zap, Wifi, WifiOff,
  RotateCcw, Play, Pause, CheckCircle, AlertTriangle, Snowflake, Flame,
} from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/utils/cn';
import type { DemoScenario } from '@/types';

const SCENARIOS: { id: DemoScenario; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'normal', label: 'NORMAL', icon: <CheckCircle size={18} />, color: 'success' },
  { id: 'warning', label: 'WARNING', icon: <AlertTriangle size={18} />, color: 'warning' },
  { id: 'high_temp', label: 'HIGH TEMP', icon: <Flame size={18} />, color: 'danger' },
  { id: 'low_temp', label: 'LOW TEMP', icon: <Snowflake size={18} />, color: 'accent' },
  { id: 'vibration', label: 'VIBRATION', icon: <Zap size={18} />, color: 'warning' },
  { id: 'critical', label: 'CRITICAL', icon: <AlertTriangle size={18} />, color: 'danger' },
  { id: 'offline', label: 'OFFLINE', icon: <WifiOff size={18} />, color: 'neutral' },
  { id: 'recovery', label: 'RECOVERY', icon: <RotateCcw size={18} />, color: 'primary' },
];

const colorMap: Record<string, string> = {
  success: 'border-success-500/30 bg-success-500/10 text-success-400 hover:bg-success-500/20',
  warning: 'border-warning-500/30 bg-warning-500/10 text-warning-400 hover:bg-warning-500/20',
  danger: 'border-danger-500/30 bg-danger-500/10 text-danger-400 hover:bg-danger-500/20',
  accent: 'border-accent-500/30 bg-accent-500/10 text-accent-400 hover:bg-accent-500/20',
  primary: 'border-primary-500/30 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20',
  neutral: 'border-slate-500/30 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20',
};

export function DemoLab() {
  const { isDemo, demoScenario, setDemoScenario, setDemoTemperature, setDemoHumidity, triggerVibration, setDemoDeviceOnline, resetDemo, latestReading, settings, updateSettings } = useVaxGuard();

  if (!isDemo) {
    return (
      <Card variant="strong" className="border-warning-500/20">
        <CardBody>
          <div className="flex flex-col items-center text-center py-8">
            <FlaskConical size={40} className="text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-200">Demo Lab requires DEMO MODE</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              Switch to DEMO LAB mode from the header to access the engineering test console.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const temp = latestReading?.temperature ?? 5.0;
  const humidity = latestReading?.humidity ?? 55;
  const online = latestReading?.deviceOnline ?? true;

  return (
    <div className="space-y-6">
      {/* Demo mode banner */}
      <Card variant="strong" className="border-accent-500/20 bg-accent-500/5">
        <CardBody>
          <div className="flex items-center gap-3">
            <FlaskConical size={20} className="text-accent-400" />
            <div>
              <p className="text-sm font-semibold text-slate-200">Engineering Test Console</p>
              <p className="text-xs text-slate-500">All data generated here is DEMO DATA — clearly separated from live telemetry.</p>
            </div>
            <Badge variant="info" dot pulse className="ml-auto">DEMO DATA</Badge>
          </div>
        </CardBody>
      </Card>

      {/* Scenario buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Selector</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setDemoScenario(s.id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 active:scale-95',
                  colorMap[s.color],
                  demoScenario === s.id ? 'ring-2 ring-offset-2 ring-offset-surface-100 ring-current scale-105' : 'opacity-70'
                )}
              >
                {s.icon}
                <span className="text-xs font-bold tracking-wide">{s.label}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Manual controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature & Humidity sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer size={16} className="text-primary-400" />
              Manual Sensor Control
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-5">
              <Slider
                label="Temperature"
                value={temp}
                min={-10}
                max={40}
                step={0.1}
                unit="°C"
                onChange={setDemoTemperature}
                color={temp < 2 || temp > 8 ? 'danger' : 'success'}
              />
              <Slider
                label="Humidity"
                value={humidity}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={setDemoHumidity}
                color="primary"
              />
              <div className="flex gap-2 pt-2">
                <Button variant="warning" size="sm" icon={<Zap size={14} />} onClick={triggerVibration}>
                  Trigger Vibration
                </Button>
                <Button
                  variant={online ? 'danger' : 'success'}
                  size="sm"
                  icon={online ? <WifiOff size={14} /> : <Wifi size={14} />}
                  onClick={() => setDemoDeviceOnline(!online)}
                >
                  {online ? 'Set Offline' : 'Set Online'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Auto simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play size={16} className="text-accent-400" />
              Auto Simulation
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Toggle
                checked={settings.demo.autoSimulate}
                onChange={(v) => updateSettings({ ...settings, demo: { ...settings.demo, autoSimulate: v } })}
                label="Auto Simulation"
                description="Automatically generate telemetry data"
              />
              <Toggle
                checked={settings.demo.autoCycle}
                onChange={(v) => updateSettings({ ...settings, demo: { ...settings.demo, autoCycle: v } })}
                label="Auto Cycle Scenarios"
                description="Automatically cycle through scenarios"
              />
              <Slider
                label="Update Interval"
                value={settings.demo.updateInterval}
                min={500}
                max={5000}
                step={500}
                unit="ms"
                onChange={(v) => updateSettings({ ...settings, demo: { ...settings.demo, updateInterval: v } })}
                color="primary"
              />
              <Slider
                label="Noise Level"
                value={Math.round(settings.demo.noiseLevel * 100)}
                min={0}
                max={100}
                step={10}
                unit="%"
                onChange={(v) => updateSettings({ ...settings, demo: { ...settings.demo, noiseLevel: v / 100 } })}
                color="primary"
              />
              <Slider
                label="Smoothness"
                value={Math.round(settings.demo.smoothness * 100)}
                min={0}
                max={100}
                step={5}
                unit="%"
                onChange={(v) => updateSettings({ ...settings, demo: { ...settings.demo, smoothness: v / 100 } })}
                color="primary"
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Current state + Reset */}
      <Card>
        <CardHeader>
          <CardTitle>Current Demo State</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StateChip label="Scenario" value={demoScenario.replace('_', ' ').toUpperCase()} />
            <StateChip label="Temperature" value={`${temp}°C`} />
            <StateChip label="Humidity" value={`${humidity}%`} />
            <StateChip label="Device" value={online ? 'ONLINE' : 'OFFLINE'} />
          </div>
          <Button variant="danger" size="md" icon={<RotateCcw size={16} />} onClick={resetDemo}>
            Reset Demo to Normal
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function StateChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-200/30 text-center">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-200 mt-1">{value}</p>
    </div>
  );
}
