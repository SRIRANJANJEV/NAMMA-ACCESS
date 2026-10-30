export class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private volume: number = 0.7;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  speak(text: string, opts?: { rate?: number; pitch?: number; interrupt?: boolean }): void {
    if (!this.synth || !this.isSupported()) return;
    if (opts?.interrupt) {
      this.synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.volume;
    utterance.rate = opts?.rate ?? 1;
    utterance.pitch = opts?.pitch ?? 1;
    if (this.voices.length > 0) {
      const preferred = this.voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || this.voices[0];
      utterance.voice = preferred;
    }
    this.synth.speak(utterance);
  }

  cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  speakEmergencyAlert(message: string): void {
    if (!this.isSupported()) return;
    this.speak(`VaxGuard critical alert. ${message}`, { rate: 0.9, pitch: 1.1, interrupt: true });
  }
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private supported = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        this.recognition = new SR();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.supported = true;
      }
    }
  }

  isSupported(): boolean {
    return this.supported;
  }

  listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };
      this.recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };
      this.recognition.onend = () => {
        // handled by onresult or onerror
      };
      this.recognition.start();
    });
  }

  stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // already stopped
      }
    }
  }
}
