import React from 'react';
import { Wifi, Server, Globe, Radio, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime, timeAgo } from '@/utils/helpers';
import { cn } from '@/utils/cn';
import type { ConnectionStatus } from '@/types';

export function Network() {
  const { networkInfo, connectionStatus, isDemo } = useVaxGuard();

  return (
    <div className="space-y-6">
      {/* Overall status */}
      <Card variant="strong">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-xl',
                connectionStatus === 'connected' ? 'bg-success-500/10' :
                connectionStatus === 'connecting' ? 'bg-warning-500/10' :
                connectionStatus === 'not_configured' ? 'bg-slate-500/10' :
                'bg-danger-500/10')}>
                <Wifi size={24} className={cn(
                  connectionStatus === 'connected' ? 'text-success-400' :
                  connectionStatus === 'connecting' ? 'text-warning-400' :
                  connectionStatus === 'not_configured' ? 'text-slate-400' :
                  'text-danger-400'
                )} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Network Status</p>
                <p className="text-xs text-slate-500">{isDemo ? 'DEMO MODE — simulated connection' : 'LIVE MODE — real backend'}</p>
              </div>
            </div>
            <Badge variant={connectionStatus === 'connected' ? 'success' : connectionStatus === 'connecting' ? 'warning' : connectionStatus === 'not_configured' ? 'neutral' : 'danger'} dot pulse size="md">
              {connectionStatus.toUpperCase().replace('_', ' ')}
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* Connection details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConnectionCard icon={<Wifi size={18} />} label="Wi-Fi Status" status={networkInfo.wifiStatus} />
        <ConnectionCard icon={<Server size={18} />} label="Server Status" status={networkInfo.serverStatus} />
        <ConnectionCard icon={<Globe size={18} />} label="API Status" status={networkInfo.apiStatus} />
        <ConnectionCard icon={<Radio size={18} />} label="WebSocket Status" status={networkInfo.websocketStatus} />
      </div>

      {/* Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={16} className="text-warning-400" />
            Network Diagnostics
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <DiagRow icon={<Clock size={14} />} label="Latency" value={networkInfo.latency !== null ? `${networkInfo.latency}ms` : 'N/A'} />
            <DiagRow icon={<Clock size={14} />} label="Last Successful Update" value={networkInfo.lastSuccessfulUpdate !== null ? `${formatDateTime(networkInfo.lastSuccessfulUpdate)} (${timeAgo(networkInfo.lastSuccessfulUpdate)})` : 'N/A'} />
            <DiagRow icon={<RefreshCw size={14} />} label="Reconnect Attempts" value={String(networkInfo.reconnectAttempts)} />
            <DiagRow icon={<AlertCircle size={14} />} label="Error Message" value={networkInfo.errorMessage || 'None'} status={networkInfo.errorMessage ? 'error' : 'normal'} />
          </div>
        </CardBody>
      </Card>

      {connectionStatus === 'not_configured' && (
        <Card variant="strong" className="border-warning-500/20">
          <CardBody>
            <p className="text-sm text-slate-400">
              No server URL configured. Go to Settings to configure the backend connection for live telemetry, or use Demo Lab to simulate sensor data.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function ConnectionCard({ icon, label, status }: {
  icon: React.ReactNode;
  label: string;
  status: ConnectionStatus;
}) {
  const statusMeta: Record<ConnectionStatus, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    connected: { variant: 'success', label: 'CONNECTED' },
    connecting: { variant: 'warning', label: 'CONNECTING' },
    disconnected: { variant: 'neutral', label: 'DISCONNECTED' },
    error: { variant: 'danger', label: 'ERROR' },
    not_configured: { variant: 'neutral', label: 'NOT CONFIGURED' },
  };
  const meta = statusMeta[status];
  return (
    <Card hover>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface-200/30 text-slate-400">{icon}</div>
            <span className="text-sm text-slate-300">{label}</span>
          </div>
          <Badge variant={meta.variant} dot pulse size="sm">{meta.label}</Badge>
        </div>
      </CardBody>
    </Card>
  );
}

function DiagRow({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: string; status?: 'error' | 'normal' }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-200/20">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={cn('text-sm font-medium', status === 'error' ? 'text-danger-400' : 'text-slate-200')}>{value}</span>
    </div>
  );
}
