import React, { useEffect } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import type { AlertEvent } from '@/types';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/utils/helpers';

interface EmergencyOverlayProps {
  alert: AlertEvent | null;
}

export function EmergencyOverlay({ alert }: EmergencyOverlayProps) {
  const { dismissEmergency, acknowledgeAlert } = useVaxGuard();

  useEffect(() => {
    if (!alert) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissEmergency();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [alert, dismissEmergency]);

  if (!alert) return null;

  const handleAcknowledge = () => {
    acknowledgeAlert(alert.id);
    dismissEmergency();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-surface-0/85 backdrop-blur-md" onClick={dismissEmergency} />
      <div className="relative w-full max-w-lg glass-strong rounded-2xl border-2 border-danger-500/40 shadow-2xl shadow-danger-500/20 animate-slide-up overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-danger-600 via-danger-400 to-danger-600 animate-pulse" />

        {/* Close */}
        <button
          onClick={dismissEmergency}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-200/50 text-slate-400 hover:text-slate-200 z-10"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-danger-500/30 rounded-2xl animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="relative p-3 rounded-2xl bg-danger-500/20">
                <AlertTriangle size={28} className="text-danger-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-danger-400 tracking-wide">CRITICAL CONDITION DETECTED</h2>
              <p className="text-sm text-slate-400 mt-0.5">{alert.title}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <DetailItem label="Event Type" value={alert.category.toUpperCase()} />
              <DetailItem label="Timestamp" value={formatDateTime(alert.timestamp)} />
              {alert.sensorValue && <DetailItem label="Current Reading" value={alert.sensorValue} />}
              {alert.threshold && <DetailItem label="Threshold" value={alert.threshold} />}
              <DetailItem label="Source" value={alert.source === 'demo' ? 'DEMO DATA' : 'LIVE HARDWARE'} />
              <DetailItem label="Device" value="ESP32-ColdChain-01" />
            </div>
            <div className="p-3 rounded-lg bg-surface-200/30 border border-surface-300/20">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-200">{alert.description}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-500/10 border border-warning-500/20">
              <p className="text-xs text-warning-400 font-medium">Recommended Action</p>
              <p className="text-sm text-slate-300 mt-1">
                Review the affected sensor immediately. Check the storage unit, verify cooling system operation, and document the incident for evidence.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button variant="danger" size="lg" onClick={handleAcknowledge} className="flex-1">
              Acknowledge
            </Button>
            <Button variant="outline" size="lg" onClick={dismissEmergency}>
              View Details <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-200 font-medium mt-0.5">{value}</p>
    </div>
  );
}
