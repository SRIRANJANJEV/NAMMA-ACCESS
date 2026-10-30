// Voice Feedback Display - Visual + Audio feedback component
import React, { useState, useEffect } from 'react';
import { globalVoiceController, type Language } from '@/services/globalVoiceController';

interface VoiceFeedbackDisplayProps {
  language: Language;
}

export function VoiceFeedbackDisplay({ language }: VoiceFeedbackDisplayProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isContinuous, setIsContinuous] = useState(false);

  useEffect(() => {
    // Subscribe to listening state changes
    globalVoiceController.onListeningChange((listening) => {
      setIsListening(listening);
    });

    // Subscribe to command responses
    globalVoiceController.onCommand((response) => {
      setLastResponse(response.text);
      setTimeout(() => setLastResponse(''), 5000); // Clear after 5 seconds
    });

    // Set initial language
    globalVoiceController.setLanguage(language);

    return () => {
      globalVoiceController.cleanup();
    };
  }, []);

  useEffect(() => {
    globalVoiceController.setLanguage(language);
  }, [language]);

  const handleMicClick = () => {
    if (isListening) {
      globalVoiceController.stopListening();
    } else {
      globalVoiceController.startListening();
    }
  };

  const handleContinuousToggle = () => {
    const newState = globalVoiceController.toggleContinuousMode();
    setIsContinuous(newState);
  };

  const translations = {
    listening: { en: 'Listening...', kn: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...', hi: 'सुन रहा हूँ...' },
    tapToSpeak: { en: 'Tap to speak', kn: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ', hi: 'बोलने के लिए टैप करें' },
    continuousMode: { en: 'Continuous Mode', kn: 'ನಿರಂತರ ಮೋಡ್', hi: 'निरंतर मोड' },
    voiceCommands: { en: 'Voice Commands', kn: 'ಧ್ವನಿ ಆಜ್ಞೆಗಳು', hi: 'वॉइस कमांड' },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Response Display */}
      {lastResponse && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-semibold text-sm mb-1">AI Response:</p>
              <p className="text-base leading-relaxed">{lastResponse}</p>
            </div>
          </div>
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="w-1 h-6 bg-white rounded-full animate-wave-1"></span>
              <span className="w-1 h-6 bg-white rounded-full animate-wave-2"></span>
              <span className="w-1 h-6 bg-white rounded-full animate-wave-3"></span>
            </div>
            <span className="font-bold">{translations.listening[language]}</span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3">
        {/* Continuous Mode Toggle */}
        <button
          onClick={handleContinuousToggle}
          className={`p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 ${
            isContinuous
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
          aria-label={translations.continuousMode[language]}
          title={translations.continuousMode[language]}
        >
          <span className="text-2xl">{isContinuous ? '🔄' : '⏸️'}</span>
        </button>

        {/* Main Microphone Button */}
        <button
          onClick={handleMicClick}
          className={`p-6 rounded-full shadow-2xl transition-all transform hover:scale-110 ${
            isListening
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600'
          }`}
          aria-label={isListening ? translations.listening[language] : translations.tapToSpeak[language]}
          title={isListening ? translations.listening[language] : translations.tapToSpeak[language]}
        >
          <span className="text-4xl">{isListening ? '🔴' : '🎤'}</span>
        </button>
      </div>

      {/* Quick Help */}
      {!isListening && !isContinuous && (
        <div className="bg-white px-4 py-2 rounded-full shadow-lg text-xs text-stone-600 max-w-xs text-center">
          {language === 'en' && '💡 Say: "Help", "Add medicine", "Emergency"'}
          {language === 'kn' && '💡 ಹೇಳಿ: "ಸಹಾಯ", "ಔಷಧ", "ತುರ್ತು"'}
          {language === 'hi' && '💡 कहें: "मदद", "दवा", "आपातकाल"'}
        </div>
      )}
    </div>
  );
}

// Add custom animations to your global CSS or Tailwind config
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes wave-1 {
  0%, 100% { height: 1rem; }
  50% { height: 1.5rem; }
}

@keyframes wave-2 {
  0%, 100% { height: 1rem; }
  50% { height: 2rem; }
}

@keyframes wave-3 {
  0%, 100% { height: 1rem; }
  50% { height: 1.5rem; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-wave-1 {
  animation: wave-1 0.6s ease-in-out infinite;
}

.animate-wave-2 {
  animation: wave-2 0.6s ease-in-out infinite 0.2s;
}

.animate-wave-3 {
  animation: wave-3 0.6s ease-in-out infinite 0.4s;
}
`;
