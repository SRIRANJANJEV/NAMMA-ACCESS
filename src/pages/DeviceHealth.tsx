import React from 'react';
import { Cpu, Thermometer, Waves, Clock, HardDrive, Wifi, RotateCcw, MemoryStick } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDuration, formatDateTime, timeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';

export function DeviceHealth() {
  const { deviceInfo, isDemo, latestReading } = useVaxGuard();

  return (
    <div className="space-y-6">
      {/* Device header */}
      <Card variant="strong">
        <CardBody>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary-500/10">
              <Cpu size={32} className="text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-100">{deviceInfo.name}</h3>
              <p className="text-sm text-slate-500">{deviceInfo.model}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={deviceInfo.connection === 'connected' ? 'success' : 'warning'} dot pulse>
                  {deviceInfo.connection.toUpperCase()}
                </Badge>
                <Badge variant={isDemo ? 'info' : 'success'}>{isDemo ? 'DEMO DATA' : 'LIVE'}</Badge>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Hardware info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cpu size={16} className="text-primary-400" /> Hardware Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <InfoRow icon={<Cpu size={14} />} label="Model" value={deviceInfo.model} />
              <InfoRow icon={<MemoryStick size={14} />} label="Firmware" value={deviceInfo.firmware} />
              <InfoRow icon={<HardDrive size={14} />} label="Free Memory" value={deviceInfo.freeMemory !== null ? `${deviceInfo.freeMemory} bytes` : 'N/A'} />
              <InfoRow icon={<Wifi size={14} />} label="Signal Strength" value={deviceInfo.signalStrength !== null ? `${deviceInfo.signalStrength} dBm` : 'N/A'} />
              <InfoRow icon={<RotateCcw size={14} />} label="Last Restart" value={deviceInfo.lastRestart !== null ? formatDateTime(deviceInfo.lastRestart) : 'N/A'} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock size={16} className="text-accent-400" /> Connection Info</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <InfoRow icon={<Wifi size={14} />} label="Connection" value={deviceInfo.connection.toUpperCase()} status={deviceInfo.connection} />
              <InfoRow icon={<Clock size={14} />} label="Uptime" value={formatDuration(deviceInfo.uptime)} />
              <InfoRow icon={<Clock size={14} />} label="Last Telemetry" value={deviceInfo.lastTelemetry !== null ? `${formatDateTime(deviceInfo.lastTelemetry)} (${timeAgo(deviceInfo.lastTelemetry)})` : 'N/A'} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sensor status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Thermometer size={16} className="text-success-400" /> Sensor Status</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SensorCard
              icon={<Thermometer size={20} />}
              name="DHT11"
              pin="GPIO 4"
              description="Temperature & Humidity Sensor"
              status={deviceInfo.sensors.dht11}
            />
            <SensorCard
              icon={<Waves size={20} />}
              name="SW-420"
              pin="GPIO 34"
              description="Vibration / Shock Detector"
              status={deviceInfo.sensors.sw420}
            />
          </div>
        </CardBody>
      </Card>

      {/* Pin configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Pin Configuration</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <PinRow component="DHT11 DATA" pin="GPIO 4" />
            <PinRow component="SW-420 DIGITAL OUT" pin="GPIO 34" />
            <PinRow component="Green LED" pin="GPIO 25" />
            <PinRow component="Red LED" pin="GPIO 26" />
          </div>
        </CardBody>
      </Card>

      {!isDemo && !latestReading?.deviceOnline && (
        <Card variant="strong" className="border-warning-500/20">
          <CardBody>
            <p className="text-sm text-slate-400">
              Device is currently OFFLINE. Last known telemetry values are retained. No fake readings are generated in LIVE mode.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: string; status?: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-200/20">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={cn('text-sm font-semibold', status === 'connected' ? 'text-success-400' : status === 'disconnected' || status === 'error' ? 'text-danger-400' : 'text-slate-200')}>
        {value}
      </span>
    </div>
  );
}

function SensorCard({ icon, name, pin, description, status }: {
  icon: React.ReactNode;
  name: string;
  pin: string;
  description: string;
  status: 'online' | 'offline' | 'unknown';
}) {
  const statusMeta = {
    online: { color: 'text-success-400', bg: 'bg-success-500/10', border: 'border-success-500/20', label: 'ONLINE' },
    offline: { color: 'text-danger-400', bg: 'bg-danger-500/10', border: 'border-danger-500/20', label: 'OFFLINE' },
    unknown: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'UNKNOWN' },
  };
  const meta = statusMeta[status];
  return (
    <div className={cn('p-4 rounded-xl border', meta.border, meta.bg)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('p-2 rounded-lg', meta.bg, meta.color)}>{icon}</div>
        <Badge variant={status === 'online' ? 'success' : status === 'offline' ? 'danger' : 'neutral'} dot>
          {meta.label}
        </Badge>
      </div>
      <p className="text-sm font-semibold text-slate-200">{name}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      <p className="text-xs text-slate-600 mt-1">Pin: {pin}</p>
    </div>
  );
}

function PinRow({ component, pin }: { component: string; pin: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-200/20">
      <span className="text-sm text-slate-400">{component}</span>
      <span className="text-sm font-mono font-semibold text-primary-400">{pin}</span>
    </div>
  );
}
