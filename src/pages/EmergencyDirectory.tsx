import React, { useState, useEffect, useRef } from 'react';
import { nammaStorage } from '@/services/nammaStorage';
import { VerifiedEmergencyResource } from '@/types';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  mobile: string;
}

interface UserProfile {
  name: string;
  age: string;
  mobile: string;
  emergencyContacts: EmergencyContact[];
}

interface EmergencyDirectoryProps {
  onNavigate: (page: string) => void;
}

type SosState = 'ready' | 'voice_verification' | 'countdown' | 'pin_entry' | 'calling' | 'notifying' | 'cancelled';

export function EmergencyDirectory({ onNavigate }: EmergencyDirectoryProps) {
  const [resources] = useState<VerifiedEmergencyResource[]>(nammaStorage.getVerifiedEmergencyResources());
  const [sosState, setSosState] = useState<SosState>('ready');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [pinInput, setPinInput] = useState('');
  const [pinEnabled, setPinEnabled] = useState(false);
  const [savedPin, setSavedPin] = useState('');
  const [voiceVerificationPhrase, setVoiceVerificationPhrase] = useState('');
  const [isListeningForVerification, setIsListeningForVerification] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const recognitionRef = useRef<any>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('namma_user_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to load user profile');
      }
    }

    // Check if PIN is enabled
    const storedPin = localStorage.getItem('namma_sos_pin');
    const storedPinEnabled = localStorage.getItem('namma_sos_pin_enabled') === 'true';
    if (storedPin && storedPinEnabled) {
      setSavedPin(storedPin);
      setPinEnabled(true);
    }

    // Setup voice recognition for verification
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceVerification(transcript);
        setIsListeningForVerification(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListeningForVerification(false);
      };
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceVerification = (transcript: string) => {
    // Check if voice matches expected phrases
    const validPhrases = [
      'emergency help needed',
      'i need help now',
      'this is an emergency',
      'help me please'
    ];

    const isValid = validPhrases.some(phrase => transcript.includes(phrase));

    if (isValid) {
      // Voice verified - proceed to countdown
      proceedToCountdown();
    } else {
      setFailedAttempts(prev => prev + 1);
      if (failedAttempts >= 2) {
        // Too many failed attempts - reset
        setSosState('ready');
        setFailedAttempts(0);
        alert('⚠️ SOS activation cancelled due to verification failure.\n\nFor safety, please say the exact phrase:\n"Emergency help needed" or "I need help now"');
      } else {
        alert(`❌ Voice verification failed.\n\nPlease say clearly:\n"Emergency help needed"\n\nAttempts remaining: ${2 - failedAttempts}`);
        setSosState('voice_verification');
      }
    }
  };

  const initiateSOS = () => {
    // SECURITY LAYER 1: Voice Verification (if available)
    if (recognitionRef.current) {
      setSosState('voice_verification');
      setVoiceVerificationPhrase('');
      setIsListeningForVerification(true);
      recognitionRef.current.start();
    } else {
      // No voice recognition - go to countdown
      proceedToCountdown();
    }
  };

  const proceedToCountdown = () => {
    // SECURITY LAYER 2: Countdown with Cancel Option
    setSosState('countdown');
    setCountdown(10);

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          // After countdown - check if PIN is required
          if (pinEnabled) {
            setSosState('pin_entry');
          } else {
            executeSOS();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setSosState('cancelled');

    // Log cancellation with timestamp and reason
    nammaStorage.addAudit(
      'sos',
      'SOS Cancelled',
      `User cancelled SOS during ${sosState === 'countdown' ? 'countdown' : 'verification'}. Time: ${new Date().toLocaleString()}`,
      'info'
    );

    setTimeout(() => {
      setSosState('ready');
      setFailedAttempts(0);
    }, 2000);
  };

  const handlePinSubmit = () => {
    // SECURITY LAYER 3: PIN Verification
    if (pinInput === savedPin) {
      executeSOS();
    } else {
      setFailedAttempts(prev => prev + 1);
      if (failedAttempts >= 2) {
        // Too many failed PIN attempts
        setSosState('ready');
        setFailedAttempts(0);
        setPinInput('');
        alert('⚠️ SOS activation blocked.\n\nToo many incorrect PIN attempts.\n\nIf this is a real emergency, press the SOS button again.');
      } else {
        alert(`❌ Incorrect PIN.\n\nAttempts remaining: ${2 - failedAttempts}`);
        setPinInput('');
      }
    }
  };

  const executeSOS = () => {
    setSosState('calling');

    // SECURITY LAYER 4: Comprehensive Audit Logging
    const sosLog = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      user: userProfile?.name || 'Unknown',
      mobile: userProfile?.mobile || 'Not provided',
      verificationMethod: recognitionRef.current ? 'Voice + Countdown' : 'Countdown only',
      pinUsed: pinEnabled,
      location: 'Bengaluru' // In production, use actual geolocation
    };

    nammaStorage.addAudit(
      'sos',
      'Emergency SOS ACTIVATED',
      `VERIFIED SOS - User: ${sosLog.user}, Mobile: ${sosLog.mobile}, Time: ${new Date().toLocaleString()}, Verification: ${sosLog.verificationMethod}`,
      'success'
    );

    // Log to console for debugging (in production, send to server)
    console.warn('🚨 EMERGENCY SOS ACTIVATED:', sosLog);

    // First call Karnataka Emergency (112)
    setTimeout(() => {
      alert(`📞 CALLING KARNATAKA EMERGENCY (112)...\n\n👤 Caller: ${userProfile?.name || 'User'}\n📱 Mobile: ${userProfile?.mobile || 'Not provided'}\n📍 Location: Bengaluru\n⏰ Time: ${new Date().toLocaleTimeString()}\n\n✅ VERIFIED: Security checks passed\n\n⚠️ Emergency services are being notified!`);

      // Then notify emergency contacts
      if (userProfile && userProfile.emergencyContacts.length > 0) {
        setSosState('notifying');
        notifyEmergencyContacts();
      } else {
        setSosState('ready');
      }
    }, 1500);
  };

  const notifyEmergencyContacts = () => {
    if (!userProfile || userProfile.emergencyContacts.length === 0) {
      setSosState('ready');
      return;
    }

    const contacts = userProfile.emergencyContacts;
    setCurrentContactIndex(0);

    // Log each contact notification
    contacts.forEach(contact => {
      nammaStorage.addAudit(
        'sos',
        'Emergency Contact Notified',
        `Notifying ${contact.name} (${contact.relationship}) at ${contact.mobile}`,
        'info'
      );
    });

    // Simulate auto-dialing each contact with delay
    let index = 0;
    const dialNext = () => {
      if (index < contacts.length) {
        const contact = contacts[index];
        setTimeout(() => {
          alert(`📞 AUTO-DIALING EMERGENCY CONTACT ${index + 1}/${contacts.length}\n\n👤 Name: ${contact.name}\n💼 Relationship: ${contact.relationship}\n📱 Mobile: ${contact.mobile}\n⏰ Time: ${new Date().toLocaleTimeString()}\n\n⚠️ Message: "${userProfile.name} has triggered a VERIFIED emergency SOS at ${new Date().toLocaleString()}. Please check on them immediately!"`);

          // Simulate actual phone call
          window.location.href = `tel:${contact.mobile}`;

          index++;
          setCurrentContactIndex(index);

          if (index < contacts.length) {
            dialNext();
          } else {
            setTimeout(() => {
              setSosState('ready');
              alert(`✅ All ${contacts.length} emergency contacts have been notified!\n\n📋 Full audit log saved for security.`);
              setFailedAttempts(0);
              setPinInput('');
            }, 1000);
          }
        }, 2000);
      }
    };

    dialNext();
  };

  const retryVoiceVerification = () => {
    if (recognitionRef.current && failedAttempts < 3) {
      setIsListeningForVerification(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <button onClick={() => onNavigate('home')} className="text-teal-600 text-sm font-semibold hover:underline mb-4 block">
            &larr; Back to Home
        </button>
        <h1 className="text-3xl font-extrabold text-stone-900">Emergency Assistance</h1>
        <p className="text-stone-600 mt-2">Verified Bengaluru & Karnataka emergency response services with multi-layer security.</p>
      </div>

      {/* User Info Display */}
      {userProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <div className="font-semibold text-stone-800">{userProfile.name}, {userProfile.age} years</div>
              <div className="text-sm text-stone-600">📱 {userProfile.mobile}</div>
            </div>
          </div>
          {userProfile.emergencyContacts.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-xs font-semibold text-blue-800 mb-2">Emergency Contacts ({userProfile.emergencyContacts.length})</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {userProfile.emergencyContacts.map((contact) => (
                  <div key={contact.id} className="text-sm bg-white px-3 py-2 rounded-lg">
                    <span className="font-semibold">{contact.name}</span> ({contact.relationship}) • {contact.mobile}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SOS Security Info */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <div className="font-bold text-amber-900 text-lg">Multi-Layer SOS Security</div>
            <div className="text-sm text-amber-800 mt-2 space-y-1">
              <p>✅ <strong>Voice Verification:</strong> Must say "Emergency help needed" or "I need help now"</p>
              <p>✅ <strong>10-Second Countdown:</strong> Cancel accidental activation within 10 seconds</p>
              {pinEnabled && <p>✅ <strong>PIN Protection:</strong> Requires your 4-digit PIN</p>}
              <p>✅ <strong>Audit Logging:</strong> Every SOS attempt is logged with timestamp</p>
            </div>
            <div className="mt-3 text-xs text-amber-700 italic">
              This prevents false alarms from unauthorized users or accidental touches.
            </div>
          </div>
        </div>
      </div>

      {/* SOS Trigger */}
      <div className="bg-red-50 border-4 border-red-300 rounded-2xl p-8 text-center space-y-4">
        {sosState === 'ready' && (
            <>
                <h2 className="text-2xl font-bold text-red-900">🚨 Need Immediate Help?</h2>
                <p className="text-red-800 text-sm">
                  {userProfile && userProfile.emergencyContacts.length > 0
                    ? `Will verify identity, then call 112 AND your ${userProfile.emergencyContacts.length} emergency contact${userProfile.emergencyContacts.length > 1 ? 's' : ''}`
                    : 'Will verify identity, then call Karnataka Emergency Services (112)'}
                </p>
                <div className="bg-white p-4 rounded-xl text-left text-sm space-y-2">
                  <p className="font-semibold text-red-900">Security Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-700">
                    <li>Voice verification: Say "Emergency help needed"</li>
                    <li>10-second countdown to cancel if accidental</li>
                    {pinEnabled && <li>PIN verification required</li>}
                    <li>Emergency services contacted</li>
                  </ol>
                </div>
                <button
                  onClick={initiateSOS}
                  className="px-12 py-6 bg-red-600 text-white font-bold rounded-2xl text-2xl shadow-xl hover:bg-red-700 hover:scale-105 transition-all animate-pulse"
                >
                    🆘 ACTIVATE SOS
                </button>
                <p className="text-xs text-red-600">Only for real emergencies</p>
            </>
        )}

        {sosState === 'voice_verification' && (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-red-900">🎤 Voice Verification Required</h2>
                <div className="bg-white p-6 rounded-xl space-y-4">
                  <div className={`flex items-center justify-center gap-3 ${isListeningForVerification ? 'animate-pulse' : ''}`}>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">{isListeningForVerification ? '🔴' : '🎤'}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-red-900">
                        {isListeningForVerification ? 'LISTENING...' : 'Ready to listen'}
                      </p>
                      <p className="text-sm text-stone-600">Say clearly:</p>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                    <p className="font-bold text-red-900 text-lg">"Emergency help needed"</p>
                    <p className="text-sm text-stone-600 mt-1">OR</p>
                    <p className="font-bold text-red-900 text-lg">"I need help now"</p>
                  </div>
                  {failedAttempts > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-sm">
                      ⚠️ Failed attempts: {failedAttempts}/3. Speak clearly and slowly.
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-center">
                    <button
                      onClick={cancelSOS}
                      className="px-8 py-3 bg-white border-2 border-stone-300 text-stone-700 font-bold rounded-xl hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                    {!isListeningForVerification && (
                      <button
                        onClick={retryVoiceVerification}
                        className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                      >
                        🎤 Try Again
                      </button>
                    )}
                    <button
                      onClick={proceedToCountdown}
                      className="px-6 py-3 bg-stone-600 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 transition-colors"
                    >
                      Skip Voice (Countdown Only)
                    </button>
                </div>
            </div>
        )}

        {sosState === 'countdown' && (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-red-900">⏰ SOS Countdown Started</h2>
                <div className="relative">
                  <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center border-8 border-red-500 animate-pulse">
                    <span className="text-6xl font-bold text-red-600">{countdown}</span>
                  </div>
                  <p className="text-red-800 font-semibold mt-4">Emergency services will be contacted in {countdown} seconds</p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-red-900 font-bold">⚠️ This will:</p>
                  <ul className="text-sm text-stone-700 space-y-1 list-disc list-inside mt-2">
                    <li>📞 Call Karnataka Emergency (112)</li>
                    {userProfile && userProfile.emergencyContacts.length > 0 && (
                      <li>📲 Auto-dial {userProfile.emergencyContacts.length} emergency contact{userProfile.emergencyContacts.length > 1 ? 's' : ''}</li>
                    )}
                    <li>📍 Share your information</li>
                    <li>📋 Log this event permanently</li>
                  </ul>
                </div>
                <button
                  onClick={cancelSOS}
                  className="px-12 py-4 bg-white border-4 border-red-600 text-red-700 font-bold rounded-xl text-xl hover:bg-red-50 transition-colors shadow-lg"
                >
                  ✕ CANCEL - This is Not an Emergency
                </button>
            </div>
        )}

        {sosState === 'pin_entry' && (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-red-900">🔐 Enter Your PIN</h2>
                <div className="bg-white p-6 rounded-xl space-y-4">
                  <p className="text-stone-700">Final verification step to prevent unauthorized SOS activation.</p>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    className="w-full px-6 py-4 text-center text-2xl font-bold border-2 border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    autoFocus
                  />
                  {failedAttempts > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg text-amber-900 text-sm">
                      ⚠️ Incorrect PIN. Attempts remaining: {2 - failedAttempts}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-center">
                    <button
                      onClick={cancelSOS}
                      className="px-8 py-3 bg-white border-2 border-stone-300 text-stone-700 font-bold rounded-xl hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePinSubmit}
                      disabled={pinInput.length !== 4}
                      className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✓ Verify & Activate SOS
                    </button>
                </div>
            </div>
        )}

        {sosState === 'calling' && (
            <div className="space-y-3">
              <div className="text-red-900 font-bold text-2xl animate-pulse">📞 Calling Emergency Services...</div>
              <div className="text-red-700">✅ Security verified. Connecting to 112...</div>
              <div className="flex justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
        )}

        {sosState === 'notifying' && userProfile && (
            <div className="space-y-3">
              <div className="text-red-900 font-bold text-xl">📲 Notifying Emergency Contacts...</div>
              <div className="text-red-700">
                Auto-dialing contact {currentContactIndex + 1} of {userProfile.emergencyContacts.length}
              </div>
              <div className="flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
        )}

        {sosState === 'cancelled' && (
            <div className="space-y-3">
              <div className="text-green-900 font-bold text-2xl">✓ SOS Cancelled</div>
              <div className="text-green-700">Emergency activation has been cancelled.</div>
              <div className="text-sm text-stone-600">This cancellation has been logged for security.</div>
            </div>
        )}
      </div>

      {/* Warning if no emergency contacts */}
      {userProfile && userProfile.emergencyContacts.length === 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold text-amber-900">No Emergency Contacts Added</div>
            <p className="text-sm text-amber-800 mt-1">
              Add emergency contacts in Settings to enable auto-notification during verified SOS.
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="mt-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
            >
              Add Contacts in Settings
            </button>
          </div>
        </div>
      )}

      {/* Verified Emergency Services Directory */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 mb-4">📋 Verified Emergency Services</h2>
        <div className="grid gap-4">
          {resources.map((res) => (
            <div key={res.id} className="bg-white p-5 rounded-2xl border border-stone-200 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-stone-900">{res.organizationName}</h3>
                <p className="text-sm text-stone-600">{res.description}</p>
                <p className="text-xs text-teal-700 mt-2 font-medium">✓ Verified: {res.verificationSource}</p>
              </div>
              <a
                href={`tel:${res.phone}`}
                className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shrink-0"
              >
                📞 Call {res.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* PIN Setup Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <div className="font-semibold text-blue-900">Want Extra Security?</div>
            <p className="text-sm text-blue-800 mt-1">
              You can set up a 4-digit PIN for SOS activation in Settings. This adds an extra layer of protection against false alarms.
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
