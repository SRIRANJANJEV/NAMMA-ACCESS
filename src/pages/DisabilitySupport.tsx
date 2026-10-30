import React, { useState, useEffect, useRef } from 'react';
import { DisabilityMode } from '@/types';

interface DisabilitySupportProps {
  onNavigate: (page: string) => void;
}

export function DisabilitySupport({ onNavigate }: DisabilitySupportProps) {
  const [activeMode, setActiveMode] = useState<DisabilityMode>('vision');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceControlActive, setVoiceControlActive] = useState(false);
  const [environmentalSoundEnabled, setEnvironmentalSoundEnabled] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    setVibrationSupported('vibrate' in navigator);

    const savedLargeText = localStorage.getItem('accessibility_largeText') === 'true';
    const savedHighContrast = localStorage.getItem('accessibility_highContrast') === 'true';

    if (savedLargeText) {
      setLargeText(true);
      document.body.classList.add('large-text');
    }
    if (savedHighContrast) {
      setHighContrast(true);
      document.body.classList.add('high-contrast');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const speakText = (text: string, callback?: () => void) => {
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel();
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = true;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        isSpeakingRef.current = false;
        if (callback) callback();
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        if (callback) callback();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      if (callback) callback();
    }
  };

  const handleToggleLargeText = () => {
    const next = !largeText;
    setLargeText(next);
    localStorage.setItem('accessibility_largeText', String(next));
    if (next) {
      document.body.classList.add('large-text');
      speakText('Large text mode enabled. Font size increased across the app.');
    } else {
      document.body.classList.remove('large-text');
      speakText('Large text mode disabled. Font size reset to normal.');
    }
  };

  const handleToggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem('accessibility_highContrast', String(next));
    if (next) {
      document.body.classList.add('high-contrast');
      speakText('High contrast mode enabled. Interface switched to dark theme.');
    } else {
      document.body.classList.remove('high-contrast');
      speakText('High contrast mode disabled. Interface returned to normal colors.');
    }
  };

  const handleToggleVoiceControl = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speakText('Sorry, voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge for full voice control features.');
      return;
    }

    if (!voiceControlActive) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onstart = () => {
        setVoiceControlActive(true);
        speakText('Voice control activated. I am now listening continuously. You can control the entire app with your voice. Say commands like: go home, add medicine, check messages for scam, turn on large text, or emergency SOS. Say stop listening to deactivate voice control.');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        setLastCommand(transcript);
        handleVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Don't announce no-speech errors, just keep listening
        } else if (event.error === 'network') {
          speakText('Network error. Voice recognition requires internet connection.');
        }
      };

      recognitionRef.current.onend = () => {
        if (voiceControlActive) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Recognition restart failed');
          }
        }
      };

      try {
        recognitionRef.current.start();
      } catch (e) {
        speakText('Could not start voice recognition. Please check your microphone permissions.');
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setVoiceControlActive(false);
      speakText('Voice control deactivated. You will need to use buttons to navigate.');
    }
  };

  const handleVoiceCommand = (command: string) => {
    if (isProcessingCommand) return;
    setIsProcessingCommand(true);

    console.log('Processing voice command:', command);

    // NAVIGATION COMMANDS - Essential for touch-free operation
    if (command.includes('go home') || command.includes('home page') || command.includes('main menu') || command.includes('dashboard')) {
      speakText('Going to home page', () => {
        setTimeout(() => {
          onNavigate('home');
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    else if (command.includes('medicine') || command.includes('senior support') || command.includes('senior citizen')) {
      speakText('Opening senior citizen support for medicine reminders and scam detection', () => {
        setTimeout(() => {
          onNavigate('senior-support');
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    else if (command.includes('grocery') || command.includes('shopping list')) {
      speakText('Opening senior citizen support for grocery reminders', () => {
        setTimeout(() => {
          onNavigate('senior-support');
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    else if (command.includes('emergency') || command.includes('sos') || command.includes('help needed')) {
      speakText('Opening emergency services and SOS', () => {
        setTimeout(() => {
          onNavigate('emergency');
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    else if (command.includes('parenting') || command.includes('family') || command.includes('child schedule')) {
      speakText('Opening parenting support', () => {
        setTimeout(() => {
          onNavigate('parenting-support');
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    else if (command.includes('settings') || command.includes('preferences')) {
      speakText('Opening settings', () => {
        setTimeout(() => {
          onNavigate('settings');
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    // Mode switching within this page
    else if (command.includes('vision') || command.includes('vision mode') || command.includes('vision support')) {
      speakText('Switching to vision support mode', () => {
        setActiveMode('vision');
        setIsProcessingCommand(false);
      });
    }
    else if (command.includes('hearing') || command.includes('hearing mode') || command.includes('hearing support')) {
      speakText('Switching to hearing support mode', () => {
        setActiveMode('hearing');
        setIsProcessingCommand(false);
      });
    }
    // Accessibility feature controls
    else if (command.includes('large text') || command.includes('bigger text') || command.includes('increase text') || command.includes('enable large text')) {
      if (!largeText) {
        handleToggleLargeText();
      } else {
        speakText('Large text is already enabled.', () => {
          setIsProcessingCommand(false);
        });
      }
    }
    else if (command.includes('normal text') || command.includes('disable large text') || command.includes('smaller text')) {
      if (largeText) {
        handleToggleLargeText();
      } else {
        speakText('Large text is already disabled.', () => {
          setIsProcessingCommand(false);
        });
      }
    }
    else if (command.includes('high contrast') || command.includes('dark mode') || command.includes('enable contrast')) {
      if (!highContrast) {
        handleToggleHighContrast();
      } else {
        speakText('High contrast is already enabled.', () => {
          setIsProcessingCommand(false);
        });
      }
    }
    else if (command.includes('normal contrast') || command.includes('disable contrast') || command.includes('light mode')) {
      if (highContrast) {
        handleToggleHighContrast();
      } else {
        speakText('High contrast is already disabled.', () => {
          setIsProcessingCommand(false);
        });
      }
    }
    else if (command.includes('start sound detection') || command.includes('enable sound detection') || command.includes('turn on sound')) {
      if (!environmentalSoundEnabled) {
        handleToggleEnvironmentalSound();
      } else {
        speakText('Environmental sound detection is already active.', () => {
          setIsProcessingCommand(false);
        });
      }
    }
    else if (command.includes('stop sound detection') || command.includes('disable sound detection') || command.includes('turn off sound')) {
      if (environmentalSoundEnabled) {
        handleToggleEnvironmentalSound();
      } else {
        speakText('Environmental sound detection is not active.', () => {
          setIsProcessingCommand(false);
        });
      }
    }
    // Information commands
    else if (command.includes('read page') || command.includes('read screen') || command.includes('what is on screen') || command.includes('describe page')) {
      const modeDescription = activeMode === 'vision'
        ? 'vision support mode. Available features: voice control for hands-free navigation, large text mode to increase font size, high contrast mode for better visibility, and text to speech for all buttons and content.'
        : 'hearing support mode. Available features: environmental sound detection that converts loud sounds into vibrations, visual notifications for alerts, and customizable vibration patterns.';

      speakText(`You are on the disability support page in ${modeDescription} You can switch modes by saying vision mode or hearing mode.`, () => {
        setIsProcessingCommand(false);
      });
    }
    else if (command.includes('help') || command.includes('what can you do') || command.includes('available commands') || command.includes('show commands')) {
      const navigationCommands = 'For navigation, you can say: go home, medicine reminders, grocery list, emergency SOS, parenting support, or settings. ';
      const settingsCommands = activeMode === 'vision'
        ? 'For vision support: enable large text, disable large text, enable high contrast, disable high contrast, or switch to hearing mode. '
        : 'For hearing support: start sound detection, stop sound detection, or switch to vision mode. ';
      const otherCommands = 'You can also say: read page to hear what is on screen, or stop listening to deactivate voice control.';

      speakText(navigationCommands + settingsCommands + otherCommands, () => {
        setIsProcessingCommand(false);
      });
    }
    else if (command.includes('stop listening') || command.includes('stop voice') || command.includes('deactivate') || command.includes('turn off voice')) {
      speakText('Stopping voice control now. You will need to press the start voice control button to reactivate.', () => {
        setTimeout(() => {
          handleToggleVoiceControl();
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    else if (command.includes('settings') || command.includes('preferences')) {
      speakText('Opening settings page where you can change your profile, view app information, and manage data.', () => {
        setTimeout(() => {
          onNavigate('settings');
          setIsProcessingCommand(false);
        }, 500);
      });
    }
    // Unrecognized command
    else {
      speakText(`I heard you say: ${command}. I did not recognize that command. Say help to hear all available voice commands, or try saying: go home, senior support, emergency SOS, large text, or read page.`, () => {
        setIsProcessingCommand(false);
      });
    }
  };

  const handleToggleEnvironmentalSound = async () => {
    if (!environmentalSoundEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        setEnvironmentalSoundEnabled(true);

        const detectSound = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          const normalizedLevel = Math.min(100, Math.round((average / 255) * 100));

          setSoundLevel(normalizedLevel);

          if (vibrationSupported && normalizedLevel > 30) {
            const vibrationIntensity = Math.min(200, normalizedLevel * 2);
            navigator.vibrate(vibrationIntensity);
          }

          if (normalizedLevel > 70) {
            document.body.style.outline = '5px solid red';
            setTimeout(() => {
              document.body.style.outline = '';
            }, 300);
          }

          animationFrameRef.current = requestAnimationFrame(detectSound);
        };

        detectSound();
        speakText('Environmental sound detection activated. You will now feel vibrations based on surrounding noise levels. Loud sounds like vehicles or alarms will create strong vibrations. This helps you sense danger without hearing it. The vibration intensity changes based on the decibel level of sounds around you.');

      } catch (error) {
        console.error('Microphone access denied:', error);
        speakText('Could not access microphone. Please allow microphone permission in your browser settings to use environmental sound detection.');
      }
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setEnvironmentalSoundEnabled(false);
      setSoundLevel(0);
      speakText('Environmental sound detection deactivated. Vibration alerts have stopped.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Voice Control Status Banner */}
      {voiceControlActive && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎤</span>
            <div>
              <p className="font-bold text-sm">Voice Control Active - Listening</p>
              {lastCommand && <p className="text-xs opacity-90">Last: "{lastCommand}"</p>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <button onClick={() => onNavigate('home')} className="text-teal-600 text-sm font-semibold hover:underline mb-1 block">
            &larr; Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900">Disability Support Dashboard</h1>
          <p className="text-stone-600 text-sm mt-1">Complete voice control, environmental awareness, and accessibility features</p>
        </div>
        <button
          onClick={() => onNavigate('emergency')}
          className="px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          🚨 Emergency SOS
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex rounded-2xl bg-stone-200/60 p-1.5 gap-2">
        <button
          onClick={() => {
            setActiveMode('vision');
            speakText('Vision support selected');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeMode === 'vision' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          👁️ Vision Support
        </button>
        <button
          onClick={() => {
            setActiveMode('hearing');
            speakText('Hearing support selected');
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeMode === 'hearing' ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          🦻 Hearing Support
        </button>
      </div>

      {/* VISION SUPPORT */}
      {activeMode === 'vision' && (
        <div className="space-y-6 animate-fade-in">
          {/* Voice Control Feature */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl shadow-lg border-2 border-purple-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-purple-900 flex items-center gap-2">
                  🎙️ Complete Voice Control - Hands Free
                </h2>
                <p className="text-purple-700 text-sm mt-2">
                  Control the ENTIRE app with just your voice. No buttons needed. Navigate, add reminders, check scams - all through natural speech commands!
                </p>
              </div>
              <button
                onClick={handleToggleVoiceControl}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  voiceControlActive
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {voiceControlActive ? '🔴 Listening' : '🎤 Start Voice Control'}
              </button>
            </div>

            {voiceControlActive && (
              <div className="bg-white/50 p-4 rounded-xl space-y-3">
                <p className="font-bold text-purple-900">🎯 Available Voice Commands:</p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-semibold text-purple-800">Navigate:</p>
                    <p className="text-stone-700 text-xs">"Go home", "Senior support", "Emergency SOS", "Parenting support"</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-semibold text-purple-800">Actions:</p>
                    <p className="text-stone-700 text-xs">"Add medicine", "Check message for scam"</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-semibold text-purple-800">Accessibility:</p>
                    <p className="text-stone-700 text-xs">"Large text", "High contrast"</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="font-semibold text-purple-800">Help:</p>
                    <p className="text-stone-700 text-xs">"Read page", "Help", "Stop listening"</p>
                  </div>
                </div>
                <p className="text-xs text-purple-700 italic mt-2">
                  🎤 Continuous listening mode active. All responses spoken aloud automatically.
                </p>
              </div>
            )}
          </div>

          {/* Visual Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Visual Accessibility Settings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-800">Large Text Mode</h3>
                  <p className="text-stone-500 text-xs">115% larger fonts</p>
                </div>
                <button
                  onClick={handleToggleLargeText}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm ${largeText ? 'bg-teal-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                >
                  {largeText ? 'ON ✓' : 'OFF'}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-800">High Contrast</h3>
                  <p className="text-stone-500 text-xs">Dark theme</p>
                </div>
                <button
                  onClick={handleToggleHighContrast}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm ${highContrast ? 'bg-teal-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                >
                  {highContrast ? 'ON ✓' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEARING SUPPORT */}
      {activeMode === 'hearing' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl shadow-lg border-2 border-orange-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-orange-900">📊 Environmental Sound Detection</h2>
                <p className="text-orange-700 text-sm mt-2">
                  Uses your device microphone to detect sound levels and provide vibration alerts.
                </p>
              </div>
              <button
                onClick={handleToggleEnvironmentalSound}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg ${
                  environmentalSoundEnabled ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {environmentalSoundEnabled ? '🔴 Active' : '🔊 Start'}
              </button>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-300 rounded-xl p-3 text-sm mb-4">
              <p className="font-semibold text-blue-900">ℹ️ Important Limitations</p>
              <p className="text-blue-800 mt-1">
                This feature measures relative audio levels from your microphone, not calibrated decibel (dB SPL) measurements.
                It cannot reliably detect specific sounds like sirens or horns. Use it as a general awareness tool, not for safety-critical situations.
                Requires microphone permission and works best in quiet environments.
              </p>
            </div>

            {environmentalSoundEnabled && (
              <div className="space-y-4">
                <div className="bg-white/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-orange-900">Sound Level:</span>
                    <span className="text-2xl font-extrabold text-orange-900">{soundLevel} dB</span>
                  </div>
                  <div className="w-full h-8 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        soundLevel > 70 ? 'bg-red-600' : soundLevel > 40 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${soundLevel}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white/50 p-4 rounded-xl text-sm">
                  <p className="font-bold text-orange-900 mb-2">📳 Vibration Status:</p>
                  {vibrationSupported ? (
                    <div className="space-y-1 text-stone-700">
                      <p>• Quiet: Gentle vibration</p>
                      <p>• Moderate: Medium vibration</p>
                      <p>• Loud: Strong vibration (vehicles/alarms)</p>
                    </div>
                  ) : (
                    <p className="text-amber-700">Vibration not available on this device</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
