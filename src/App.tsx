import { useState, useEffect } from 'react';
import { VaxGuardProvider } from '@/hooks/useVaxGuard';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayout } from '@/layouts/AppLayout';
import { CommandCenter } from '@/pages/CommandCenter';
import { LiveMonitoring } from '@/pages/LiveMonitoring';
import { TemperatureAnalytics } from '@/pages/TemperatureAnalytics';
import { VibrationMonitoring } from '@/pages/VibrationMonitoring';
import { AIIntelligence } from '@/pages/AIIntelligence';
import { VoiceAssistant } from '@/pages/VoiceAssistant';
import { VaccineRisk } from '@/pages/VaccineRisk';
import { Alerts } from '@/pages/Alerts';
import { EventTimeline } from '@/pages/EventTimeline';
import { AuditHistory } from '@/pages/AuditHistory';
import { DeviceHealth } from '@/pages/DeviceHealth';
import { Network } from '@/pages/Network';
import { Diagnostics } from '@/pages/Diagnostics';
import { DemoLab } from '@/pages/DemoLab';
import { Settings } from '@/pages/Settings';
import { About } from '@/pages/About';

function App() {
  const [page, setPage] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'command-center';
  });

  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setPage(hash);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'command-center': return <CommandCenter onNavigate={setPage} />;
      case 'live-monitoring': return <LiveMonitoring />;
      case 'temperature': return <TemperatureAnalytics />;
      case 'vibration': return <VibrationMonitoring />;
      case 'ai-intelligence': return <AIIntelligence />;
      case 'voice-assistant': return <VoiceAssistant />;
      case 'vaccine-risk': return <VaccineRisk />;
      case 'alerts': return <Alerts />;
      case 'timeline': return <EventTimeline />;
      case 'audit': return <AuditHistory />;
      case 'device-health': return <DeviceHealth />;
      case 'network': return <Network />;
      case 'diagnostics': return <Diagnostics />;
      case 'demo-lab': return <DemoLab />;
      case 'settings': return <Settings />;
      case 'about': return <About />;
      default: return <CommandCenter onNavigate={setPage} />;
    }
  };

  return (
    <ToastProvider>
      <VaxGuardProvider>
        <AppLayout currentPage={page} onNavigate={setPage}>
          <div key={page} className="animate-fade-in">
            {renderPage()}
          </div>
        </AppLayout>
      </VaxGuardProvider>
    </ToastProvider>
  );
}

export default App;
