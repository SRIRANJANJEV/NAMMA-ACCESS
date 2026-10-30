// Global Voice Controller - Complete Touch-Free Experience
// Handles voice commands across entire app in Kannada, Hindi, and English

export type Language = 'en' | 'kn' | 'hi';

export interface VoiceCommand {
  command: string;
  action: () => void;
  page?: string;
  description: {
    en: string;
    kn: string;
    hi: string;
  };
}

export interface VoiceResponse {
  text: string;
  action?: 'navigate' | 'open_modal' | 'submit_form' | 'call' | 'read_content';
  payload?: any;
}

class GlobalVoiceController {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private isContinuousMode: boolean = false;
  private currentLanguage: Language = 'en';
  private onCommandCallback: ((response: VoiceResponse) => void) | null = null;
  private onListeningStateChange: ((isListening: boolean) => void) | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    this.initializeSpeechRecognition();
    this.synthesis = window.speechSynthesis;
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.handleVoiceCommand(transcript);
      };

      this.recognition.onerror = () => {
        this.isListening = false;
        this.notifyListeningState(false);
        if (this.isContinuousMode) {
          setTimeout(() => this.startListening(), 1000);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyListeningState(false);
        if (this.isContinuousMode) {
          setTimeout(() => this.startListening(), 500);
        }
      };
    }
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    if (this.recognition) {
      const langCodes = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };
      this.recognition.lang = langCodes[lang];
    }
    localStorage.setItem('namma_voice_language', lang);
  }

  public getLanguage(): Language {
    return this.currentLanguage;
  }

  public startListening() {
    if (!this.recognition) {
      this.speak(this.getTranslation('voiceNotSupported'), this.currentLanguage);
      return;
    }

    if (this.isListening) return;

    try {
      this.recognition.start();
      this.isListening = true;
      this.notifyListeningState(true);
    } catch (e) {
      console.error('Speech recognition error:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.isContinuousMode = false;
      this.notifyListeningState(false);
    }
  }

  public toggleContinuousMode() {
    this.isContinuousMode = !this.isContinuousMode;

    if (this.isContinuousMode) {
      this.speak(this.getTranslation('continuousModeOn'), this.currentLanguage);
      this.startListening();
    } else {
      this.speak(this.getTranslation('continuousModeOff'), this.currentLanguage);
      this.stopListening();
    }

    return this.isContinuousMode;
  }

  public speak(text: string, language: Language = this.currentLanguage, interrupt: boolean = false) {
    if (!this.synthesis) return;

    if (interrupt && this.isSpeaking) {
      this.synthesis.cancel();
    }

    this.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);

    const langCodes = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };
    utterance.lang = langCodes[language];
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = this.synthesis.getVoices();
    const matchingVoice = voices.find(voice => voice.lang.startsWith(langCodes[language].split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.synthesis.speak(utterance);
  }

  public onCommand(callback: (response: VoiceResponse) => void) {
    this.onCommandCallback = callback;
  }

  public onListeningChange(callback: (isListening: boolean) => void) {
    this.onListeningStateChange = callback;
  }

  private notifyListeningState(isListening: boolean) {
    if (this.onListeningStateChange) {
      this.onListeningStateChange(isListening);
    }
  }

  private handleVoiceCommand(transcript: string) {
    const response = this.processCommand(transcript);

    // Speak the response
    this.speak(response.text, this.currentLanguage);

    // Notify callback
    if (this.onCommandCallback) {
      this.onCommandCallback(response);
    }
  }

  private processCommand(userMessage: string): VoiceResponse {
    const lower = userMessage.toLowerCase().trim();

    // Auto-detect language from message
    const hasKannada = /[ಀ-೿]/.test(userMessage);
    const hasHindi = /[ऀ-ॿ]/.test(userMessage);
    const effectiveLang = hasKannada ? 'kn' : hasHindi ? 'hi' : this.currentLanguage;

    // Helper for pattern matching
    const matchesAny = (patterns: string[]) => {
      return patterns.some(pattern => {
        if (/[^\x00-\x7F]/.test(pattern)) {
          return userMessage.includes(pattern);
        }
        return lower.includes(pattern.toLowerCase());
      });
    };

    // === NAVIGATION COMMANDS ===

    // Go to Home
    if (matchesAny(['go home', 'home page', 'take me home', 'ಮನೆ', 'ಮುಖಪುಟ', 'घर', 'होम पेज'])) {
      return {
        text: this.getTranslation('goingHome', effectiveLang),
        action: 'navigate',
        payload: 'home'
      };
    }

    // Go to Medicines
    if (matchesAny(['medicines', 'my medicines', 'medicine page', 'show medicines',
                     'ಔಷಧಗಳು', 'ನನ್ನ ಔಷಧಗಳು', 'दवाएं', 'मेरी दवाएं'])) {
      return {
        text: this.getTranslation('goingToMedicines', effectiveLang),
        action: 'navigate',
        payload: 'medicines'
      };
    }

    // Go to Emergency
    if (matchesAny(['emergency', 'emergency page', 'sos', 'ತುರ್ತು', 'ತುರ್ತು ಪುಟ', 'आपातकाल'])) {
      return {
        text: this.getTranslation('goingToEmergency', effectiveLang),
        action: 'navigate',
        payload: 'emergency'
      };
    }

    // Go to Groceries
    if (matchesAny(['groceries', 'shopping list', 'grocery list',
                     'ದಿನಸಿ', 'ಶಾಪಿಂಗ್ ಪಟ್ಟಿ', 'किराना', 'खरीदारी सूची'])) {
      return {
        text: this.getTranslation('goingToGroceries', effectiveLang),
        action: 'navigate',
        payload: 'groceries'
      };
    }

    // Go to Settings
    if (matchesAny(['settings', 'preferences', 'ಸೆಟ್ಟಿಂಗ್ಸ್', 'सेटिंग्स'])) {
      return {
        text: this.getTranslation('goingToSettings', effectiveLang),
        action: 'navigate',
        payload: 'settings'
      };
    }

    // === ACTION COMMANDS ===

    // Add Medicine
    if (matchesAny(['add medicine', 'new medicine', 'medicine', 'med',
                     'ಔಷಧ ಸೇರಿಸು', 'ಔಷಧ', 'ಹೊಸ ಔಷಧ',
                     'दवा जोड़ें', 'दवा', 'नई दवा'])) {
      return {
        text: this.getTranslation('openingMedicineForm', effectiveLang),
        action: 'open_modal',
        payload: 'add_medicine'
      };
    }

    // Emergency Help
    if (matchesAny(['help', 'i need help', 'emergency', 'call help',
                     'ಸಹಾಯ', 'ಸಹಾಯ ಬೇಕು', 'ಸಹಾಯ ಮಾಡಿ',
                     'मदद', 'मदद चाहिए', 'हेल्प'])) {
      return {
        text: this.getTranslation('activatingEmergency', effectiveLang),
        action: 'navigate',
        payload: 'emergency'
      };
    }

    // Call Emergency Number
    if (matchesAny(['call 112', 'call emergency', 'dial 112',
                     '112 ಗೆ ಕರೆ ಮಾಡಿ', '112 कॉल करें'])) {
      return {
        text: this.getTranslation('calling112', effectiveLang),
        action: 'call',
        payload: '112'
      };
    }

    // Read Schedule
    if (matchesAny(['read my schedule', 'what is my schedule', "today's schedule",
                     'ನನ್ನ ವೇಳಾಪಟ್ಟಿ ಓದು', 'ವೇಳಾಪಟ್ಟಿ ತೋರಿಸು',
                     'मेरा शेड्यूल पढ़ें', 'शेड्यूल बताएं'])) {
      return {
        text: this.getTranslation('readingSchedule', effectiveLang),
        action: 'read_content',
        payload: 'schedule'
      };
    }

    // === LANGUAGE SWITCHING ===
    if (matchesAny(['switch to english', 'english', 'change to english'])) {
      this.setLanguage('en');
      return {
        text: 'Switched to English. I can help you with medicines, emergencies, and more!',
        action: undefined
      };
    }

    if (matchesAny(['switch to kannada', 'kannada', 'ಕನ್ನಡ', 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸು'])) {
      this.setLanguage('kn');
      return {
        text: 'ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ಔಷಧಗಳು, ತುರ್ತು ಸಹಾಯ ಮತ್ತು ಹೆಚ್ಚಿನದರಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು!',
        action: undefined
      };
    }

    if (matchesAny(['switch to hindi', 'hindi', 'हिंदी', 'हिंदी में बदलें'])) {
      this.setLanguage('hi');
      return {
        text: 'हिंदी में बदल गया। मैं दवाओं, आपातकाल और अधिक में मदद कर सकता हूं!',
        action: undefined
      };
    }

    // === HELP COMMANDS ===
    if (matchesAny(['what can you do', 'help me', 'commands', 'features',
                     'ನೀವು ಏನು ಮಾಡಬಹುದು', 'ಸಹಾಯ',
                     'आप क्या कर सकते हैं', 'मदद'])) {
      return {
        text: this.getTranslation('helpMessage', effectiveLang),
        action: undefined
      };
    }

    // Unknown command
    return {
      text: this.getTranslation('unknownCommand', effectiveLang),
      action: undefined
    };
  }

  private getTranslation(key: string, lang: Language = this.currentLanguage): string {
    const translations: Record<string, Record<Language, string>> = {
      voiceNotSupported: {
        en: 'Voice recognition is not supported in this browser',
        kn: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ',
        hi: 'इस ब्राउज़र में वॉइस पहचान समर्थित नहीं है'
      },
      continuousModeOn: {
        en: 'Continuous listening activated. I will listen for your commands.',
        kn: 'ನಿರಂತರ ಆಲಿಸುವಿಕೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ನಾನು ನಿಮ್ಮ ಆಜ್ಞೆಗಳನ್ನು ಕೇಳುತ್ತೇನೆ.',
        hi: 'निरंतर सुनना सक्रिय। मैं आपके आदेशों को सुनूंगा।'
      },
      continuousModeOff: {
        en: 'Continuous listening deactivated.',
        kn: 'ನಿರಂತರ ಆಲಿಸುವಿಕೆ ನಿಷ್ಕ್ರಿಯಗೊಂಡಿದೆ.',
        hi: 'निरंतर सुनना निष्क्रिय।'
      },
      goingHome: {
        en: 'Going to home page',
        kn: 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದೆ',
        hi: 'होम पेज पर जा रहे हैं'
      },
      goingToMedicines: {
        en: 'Opening medicines page',
        kn: 'ಔಷಧಗಳ ಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
        hi: 'दवाओं का पृष्ठ खोल रहे हैं'
      },
      goingToEmergency: {
        en: 'Opening emergency page',
        kn: 'ತುರ್ತು ಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
        hi: 'आपातकालीन पृष्ठ खोल रहे हैं'
      },
      goingToGroceries: {
        en: 'Opening groceries page',
        kn: 'ದಿನಸಿ ಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
        hi: 'किराना पृष्ठ खोल रहे हैं'
      },
      goingToSettings: {
        en: 'Opening settings',
        kn: 'ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
        hi: 'सेटिंग्स खोल रहे हैं'
      },
      openingMedicineForm: {
        en: 'Opening medicine form',
        kn: 'ಔಷಧ ಫಾರ್ಮ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
        hi: 'दवा फॉर्म खोल रहे हैं'
      },
      activatingEmergency: {
        en: 'Activating emergency mode',
        kn: 'ತುರ್ತು ಮೋಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ',
        hi: 'आपातकालीन मोड सक्रिय कर रहे हैं'
      },
      calling112: {
        en: 'Calling emergency number 112',
        kn: 'ತುರ್ತು ಸಂಖ್ಯೆ 112 ಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ',
        hi: 'आपातकालीन नंबर 112 पर कॉल कर रहे हैं'
      },
      readingSchedule: {
        en: 'Reading your schedule',
        kn: 'ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿ ಓದುತ್ತಿದ್ದೇನೆ',
        hi: 'आपका शेड्यूल पढ़ रहे हैं'
      },
      helpMessage: {
        en: 'I can help you with: Navigate pages, Add medicines, Emergency calls, Read schedule, Switch languages. Just speak naturally!',
        kn: 'ನಾನು ಇವುಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ: ಪುಟಗಳಿಗೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ, ಔಷಧಗಳನ್ನು ಸೇರಿಸಿ, ತುರ್ತು ಕರೆಗಳು, ವೇಳಾಪಟ್ಟಿ ಓದಿ, ಭಾಷೆಗಳನ್ನು ಬದಲಿಸಿ. ನೈಸರ್ಗಿಕವಾಗಿ ಮಾತನಾಡಿ!',
        hi: 'मैं इनमें मदद कर सकता हूं: पृष्ठों पर नेविगेट करें, दवाएं जोड़ें, आपातकालीन कॉल, शेड्यूल पढ़ें, भाषाएं बदलें। बस स्वाभाविक रूप से बोलें!'
      },
      unknownCommand: {
        en: 'I did not understand that. Try saying: "Help", "Add medicine", or "Emergency"',
        kn: 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಪ್ರಯತ್ನಿಸಿ: "ಸಹಾಯ", "ಔಷಧ ಸೇರಿಸು", ಅಥವಾ "ತುರ್ತು"',
        hi: 'मुझे समझ नहीं आया। कोशिश करें: "मदद", "दवा जोड़ें", या "आपातकाल"'
      }
    };

    return translations[key]?.[lang] || translations[key]?.en || '';
  }

  public cleanup() {
    this.stopListening();
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

// Singleton instance
export const globalVoiceController = new GlobalVoiceController();
