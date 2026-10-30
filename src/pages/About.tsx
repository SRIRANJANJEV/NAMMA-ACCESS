import React from 'react';
import { Shield, Cpu, Thermometer, Waves, Wifi, BrainCircuit, Bell, Mic, ScrollText, ArrowDown, Info, Activity, Database } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DISCLAIMER, APP_VERSION } from '@/data/constants';

export function About() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card variant="strong" className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 radial-glow" />
        <CardBody className="relative">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-xl shadow-primary-500/20">
                <Shield size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gradient-primary">VaxGuard</h1>
            <p className="text-sm text-slate-400 mt-2">Intelligent Vaccine Cold-Chain Guardian</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="primary">v{APP_VERSION}</Badge>
              <Badge variant="info">IoT Prototype</Badge>
              <Badge variant="neutral">ECE / Hackathon</Badge>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Problem & Solution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Problem</CardTitle></CardHeader>
          <CardBody>
            <p className="text-sm text-slate-400">
              Vaccines require strict temperature control (2°C–8°C) during storage and transport. Temperature excursions,
              vibration events, and device disconnections can compromise cold-chain integrity. Traditional monitoring
              lacks real-time alerts, evidence logging, and predictive analysis.
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Solution</CardTitle></CardHeader>
          <CardBody>
            <p className="text-sm text-slate-400">
              VaxGuard is an IoT cold-chain monitoring platform that uses ESP32 sensors to track temperature, humidity,
              and vibration in real time. It provides instant alerts, incident evidence, analytics, and advisory intelligence —
              all through a professional web interface.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Hardware */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu size={16} className="text-primary-400" /> Hardware</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <HardwareItem icon={<Cpu size={18} />} name="ESP32-WROOM-32" description="DevKit V1 microcontroller" />
            <HardwareItem icon={<Thermometer size={18} />} name="DHT11" description="Temperature & humidity sensor (GPIO 4)" />
            <HardwareItem icon={<Waves size={18} />} name="SW-420" description="Vibration / shock detector (GPIO 34)" />
            <HardwareItem icon={<Activity size={18} />} name="LEDs" description="Green (GPIO 25) + Red (GPIO 26)" />
          </div>
        </CardBody>
      </Card>

      {/* Software */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit size={16} className="text-accent-400" /> Software Stack</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <TechItem name="React + TypeScript" />
            <TechItem name="Vite" />
            <TechItem name="Tailwind CSS" />
            <TechItem name="Recharts" />
            <TechItem name="Lucide Icons" />
            <TechItem name="Web Speech API" />
            <TechItem name="localStorage" />
            <TechItem name="WebSocket / REST" />
          </div>
        </CardBody>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database size={16} className="text-primary-400" /> Architecture</CardTitle></CardHeader>
        <CardBody>
          <div className="flex flex-col items-center gap-2">
            <ArchNode icon={<Cpu size={20} />} label="ESP32" sublabel="Microcontroller" />
            <ArchArrow />
            <ArchNode icon={<Thermometer size={20} />} label="Sensors" sublabel="DHT11 + SW-420" />
            <ArchArrow />
            <ArchNode icon={<Wifi size={20} />} label="Telemetry" sublabel="REST / WebSocket / Socket.IO" />
            <ArchArrow />
            <ArchNode icon={<Database size={20} />} label="Backend" sublabel="Server / API" />
            <ArchArrow />
            <ArchNode icon={<Shield size={20} />} label="VaxGuard Web App" sublabel="React + TypeScript" highlight />
            <ArchArrow />
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <ArchNode icon={<BrainCircuit size={16} />} label="Analytics" small />
              <ArchNode icon={<Bell size={16} />} label="Alerts" small />
              <ArchNode icon={<Mic size={16} />} label="Voice" small />
              <ArchNode icon={<ScrollText size={16} />} label="Audit" small />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader><CardTitle>Key Features</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Real-time telemetry monitoring',
              'Temperature analytics with safe/warning/critical zones',
              'Vibration event detection and timeline',
              'Alert engine with debounce, cooldown, and recovery',
              'Emergency alert overlay for critical events',
              'AI advisory with condition score and early warning',
              'Interactive voice assistant (Web Speech API)',
              'Emergency voice alerts via text-to-speech',
              'Incident management with evidence export',
              'Event timeline and audit history',
              'Demo Lab with engineering test console',
              'Telegram notification architecture (backend-ready)',
              'Dual mode: LIVE HARDWARE / DEMO LAB',
              'Local data persistence (localStorage)',
              'System diagnostics',
              'Responsive design for mobile demonstration',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface-200/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Future scope */}
      <Card>
        <CardHeader><CardTitle>Future Scope</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'External LLM API integration for AI assistant',
              'Telegram bot backend deployment',
              'Multi-device support',
              'Cloud database (Supabase) integration',
              'Mobile app companion',
              'Historical data analytics with ML',
              'GPS tracking for transport monitoring',
              'Barcode/QR vaccine tracking',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-surface-200/20">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Disclaimer */}
      <Card variant="outline" className="border-slate-500/20">
        <CardBody>
          <div className="flex items-start gap-3">
            <Info size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500">{DISCLAIMER}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function HardwareItem({ icon, name, description }: { icon: React.ReactNode; name: string; description: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-200/30 border border-surface-300/15">
      <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-slate-200">{name}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function TechItem({ name }: { name: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-surface-200/20 border border-surface-300/10 text-center">
      <p className="text-xs font-medium text-slate-300">{name}</p>
    </div>
  );
}

function ArchNode({ icon, label, sublabel, highlight, small }: { icon: React.ReactNode; label: string; sublabel?: string; highlight?: boolean; small?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${small ? 'flex-1' : ''}`}>
      <div className={`rounded-2xl border-2 flex items-center justify-center ${small ? 'w-10 h-10' : 'w-14 h-14'} ${
        highlight ? 'border-primary-500/40 bg-primary-500/15 text-primary-400' : 'border-surface-300/30 bg-surface-200/30 text-slate-400'}`}>
        {icon}
      </div>
      <div className="text-center">
        <p className={`font-semibold text-slate-200 ${small ? 'text-xs' : 'text-sm'}`}>{label}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>
    </div>
  );
}

function ArchArrow() {
  return <ArrowDown size={16} className="text-slate-600" />;
}
