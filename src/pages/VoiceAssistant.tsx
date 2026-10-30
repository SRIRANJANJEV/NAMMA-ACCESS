import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, VolumeX, Trash2, Bot, User } from 'lucide-react';
import { useVaxGuard } from '@/hooks/useVaxGuard';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { Slider } from '@/components/ui/Slider';
import { aiAssistant, createChatMessage, type AIAssistantContext } from '@/services/aiAssistantService';
import { SpeechRecognitionService } from '@/services/voiceService';
import { cn } from '@/utils/cn';

const SUGGESTED_QUESTIONS = [
  'What is the current temperature?',
  'Is the system safe?',
  'Why is the system in warning?',
  'What happened recently?',
  'What is the device status?',
  'What is the temperature trend?',
  'Summarize today\'s events.',
  'What should I inspect?',
];

export function VoiceAssistant() {
  const { telemetry, alerts, incidents, timeline, settings, systemStatus, latestReading, vibrationEvents, chat, addChatMessage, clearChat, voiceService } = useVaxGuard();
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [speakResponses, setSpeakResponses] = useState(settings.voice.assistantEnabled);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    recognitionRef.current = new SpeechRecognitionService();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const voiceSupported = voiceService.isSupported();
  const recognitionSupported = recognitionRef.current?.isSupported() ?? false;

  const askQuestion = (question: string) => {
    if (!question.trim()) return;
    const userMsg = createChatMessage('user', question);
    addChatMessage(userMsg);

    const ctx: AIAssistantContext = {
      telemetry, alerts, incidents, timeline, settings,
      currentStatus: systemStatus, latestReading,
      vibrationEventCount: vibrationEvents.length,
    };
    const answer = aiAssistant.ask(question, ctx);
    const assistantMsg = createChatMessage('assistant', answer);
    addChatMessage(assistantMsg);

    if (speakResponses && voiceSupported) {
      voiceService.speak(answer, { rate: 1 });
    }
    setInput('');
  };

  const handleMic = async () => {
    if (!recognitionSupported) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    setListening(true);
    try {
      const transcript = await recognitionRef.current!.listen();
      setInput(transcript);
      setListening(false);
    } catch {
      setListening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="info" dot pulse>LOCAL ADVISORY MODE</Badge>
        <Badge variant={voiceSupported ? 'success' : 'warning'}>
          {voiceSupported ? 'Voice Synthesis: AVAILABLE' : 'Voice Synthesis: NOT SUPPORTED'}
        </Badge>
        <Badge variant={recognitionSupported ? 'success' : 'warning'}>
          {recognitionSupported ? 'Speech Recognition: AVAILABLE' : 'Speech Recognition: NOT SUPPORTED'}
        </Badge>
      </div>

      {/* Settings */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle
              checked={speakResponses}
              onChange={setSpeakResponses}
              label="Read Responses Aloud"
              description="Use browser text-to-speech for assistant responses"
            />
            <Slider
              label="Volume"
              value={Math.round(settings.voice.volume * 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => voiceService.setVolume(v / 100)}
              color="primary"
            />
          </div>
        </CardBody>
      </Card>

      {/* Chat interface */}
      <Card variant="strong" className="flex flex-col h-[500px]">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot size={16} className="text-primary-400" />
            VaxGuard Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={clearChat}>Clear</Button>
        </CardHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {chat.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 rounded-2xl bg-primary-500/10 mb-4">
                <Bot size={32} className="text-primary-400" />
              </div>
              <p className="text-sm text-slate-300 font-medium">Ask me anything about your cold-chain system</p>
              <p className="text-xs text-slate-500 mt-1">I can answer questions about temperature, status, alerts, and more.</p>
            </div>
          ) : (
            chat.map(msg => (
              <div key={msg.id} className={cn('flex gap-3 animate-slide-up', msg.role === 'user' && 'flex-row-reverse')}>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  msg.role === 'assistant' ? 'bg-primary-500/15 text-primary-400' : 'bg-surface-300/30 text-slate-400')}>
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={cn('max-w-[80%] p-3 rounded-xl text-sm',
                  msg.role === 'assistant' ? 'bg-surface-200/40 text-slate-200' : 'bg-primary-500/15 text-slate-100')}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-surface-300/15">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMic}
              disabled={!recognitionSupported}
              className={cn('p-2.5 rounded-xl transition-all flex-shrink-0',
                listening ? 'bg-danger-500/20 text-danger-400 animate-pulse' : 'bg-surface-200/40 text-slate-400 hover:text-slate-200',
                !recognitionSupported && 'opacity-30 cursor-not-allowed')}
              title={recognitionSupported ? 'Voice input' : 'Speech recognition not supported'}
            >
              <Mic size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askQuestion(input)}
              placeholder={listening ? 'Listening...' : 'Ask a question...'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-200/40 border border-surface-300/20 text-sm text-slate-200 placeholder-slate-600 focus:border-primary-500/30"
            />
            <Button variant="primary" size="md" icon={<Send size={16} />} onClick={() => askQuestion(input)} disabled={!input.trim()}>
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Suggested questions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Questions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => askQuestion(q)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-200/20 hover:bg-surface-200/40 text-sm text-slate-300 hover:text-slate-100 text-left transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                {q}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
