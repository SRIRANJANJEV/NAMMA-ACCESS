import React, { useState, useEffect } from 'react';
import { WelcomeHome } from '@/pages/WelcomeHome';
import { SeniorSupport } from '@/pages/SeniorSupport';
import { DisabilitySupport } from '@/pages/DisabilitySupport';
import { ParentingSupport } from '@/pages/ParentingSupport';
import { EmergencyDirectory } from '@/pages/EmergencyDirectory';
import { VoiceAssistantModal } from '@/components/VoiceAssistantModal';
import { VoiceFeedbackDisplay } from '@/components/VoiceFeedbackDisplay';
import { AuditHistory } from '@/pages/AuditHistory';
import { Settings } from '@/pages/Settings';
import { UserRegistration } from '@/pages/UserRegistration';
import { globalVoiceController, type Language } from '@/services/globalVoiceController';

type UserType = 'senior' | 'disabled' | 'parent' | null;
type LockedSection = 'senior-support' | 'disability-support' | 'parenting-support' | null;

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
  userType: UserType;
  emergencyContacts: EmergencyContact[];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [lockedSection, setLockedSection] = useState<LockedSection>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<Language>('en');

  useEffect(() => {
    // Check if user has completed setup
    const savedUserType = localStorage.getItem('namma_user_type') as UserType;
    const savedSetupComplete = localStorage.getItem('namma_setup_complete') === 'true';
    const savedLockedSection = localStorage.getItem('namma_locked_section') as LockedSection;
    const savedUserProfile = localStorage.getItem('namma_user_profile');
    const savedVoiceLang = (localStorage.getItem('namma_voice_language') as Language) || 'en';

    if (savedSetupComplete && savedUserType) {
      setUserType(savedUserType);
      setSetupComplete(true);
    }

    if (savedUserProfile) {
      try {
        setUserProfile(JSON.parse(savedUserProfile));
      } catch (e) {
        console.error('Failed to parse user profile');
      }
    }

    if (savedLockedSection) {
      setLockedSection(savedLockedSection);
      setCurrentPage(savedLockedSection);
    }

    setVoiceLanguage(savedVoiceLang);
    globalVoiceController.setLanguage(savedVoiceLang);

    // Setup global voice command handler
    globalVoiceController.onCommand((response) => {
      if (response.action === 'navigate' && response.payload) {
        handleNavigate(response.payload);
      } else if (response.action === 'open_modal' && response.payload === 'add_medicine') {
        setShowVoiceAssistant(true);
      } else if (response.action === 'call' && response.payload) {
        window.location.href = `tel:${response.payload}`;
      }
    });

    return () => {
      globalVoiceController.cleanup();
    };
  }, []);

  const handleUserSetup = (profile: UserProfile) => {
    setUserType(profile.userType);
    setUserProfile(profile);
    setSetupComplete(true);
    localStorage.setItem('namma_user_type', profile.userType || '');
    localStorage.setItem('namma_setup_complete', 'true');
    localStorage.setItem('namma_user_profile', JSON.stringify(profile));
  };

  const handleResetSetup = () => {
    setUserType(null);
    setSetupComplete(false);
    setLockedSection(null);
    setUserProfile(null);
    setCurrentPage('home');
    localStorage.removeItem('namma_user_type');
    localStorage.removeItem('namma_setup_complete');
    localStorage.removeItem('namma_locked_section');
    localStorage.removeItem('namma_user_profile');
  };

  const handleLockSection = (section: LockedSection) => {
    setLockedSection(section);
    if (section) {
      localStorage.setItem('namma_locked_section', section);
      setCurrentPage(section);
    }
  };

  const handleUnlockSection = () => {
    setLockedSection(null);
    localStorage.removeItem('namma_locked_section');
    setCurrentPage('home');
  };

  const handleNavigate = (page: string) => {
    // If section is locked, prevent navigation away from it
    if (lockedSection && page !== lockedSection) {
      return; // Do nothing - user is locked to their section
    }
    setCurrentPage(page);
  };

  // Show setup screen if not completed
  if (!setupComplete) {
    return <UserRegistration onComplete={handleUserSetup} />;
  }

  // Simple Router
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <WelcomeHome onNavigate={handleNavigate} userType={userType} onLockSection={handleLockSection} />;
      case 'senior-support': return <SeniorSupport onNavigate={handleNavigate} isLocked={lockedSection === 'senior-support'} />;
      case 'disability-support': return <DisabilitySupport onNavigate={handleNavigate} isLocked={lockedSection === 'disability-support'} />;
      case 'parenting-support': return <ParentingSupport onNavigate={handleNavigate} isLocked={lockedSection === 'parenting-support'} />;
      case 'emergency': return <EmergencyDirectory onNavigate={handleNavigate} />;
      case 'audit': return <AuditHistory onNavigate={handleNavigate} />;
      case 'settings': return <Settings onNavigate={handleNavigate} onResetSetup={handleResetSetup} userType={userType} />;
      default: return <WelcomeHome onNavigate={handleNavigate} userType={userType} onLockSection={handleLockSection} />;
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setVoiceLanguage(lang);
    globalVoiceController.setLanguage(lang);
    localStorage.setItem('namma_voice_language', lang);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Navigation Bar */}
      {currentPage !== 'home' && (
        <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => handleNavigate('home')}
              className={`flex items-center gap-2 font-semibold transition-colors ${
                lockedSection ? 'text-stone-400 cursor-not-allowed' : 'text-teal-700 hover:text-teal-800'
              }`}
              aria-label="Return to home"
              disabled={!!lockedSection}
            >
              <span className="text-xl">🏠</span>
              <span className="hidden sm:inline">Namma Access</span>
            </button>

            {/* Language Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  voiceLanguage === 'en' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
                aria-label="Switch to English"
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('kn')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  voiceLanguage === 'kn' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
                aria-label="Switch to Kannada"
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  voiceLanguage === 'hi' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
                aria-label="Switch to Hindi"
              >
                हिंदी
              </button>
            </div>

            {/* Section Lock Indicator */}
            {lockedSection && (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <span className="text-amber-700 text-sm font-semibold">🔒 Section Locked</span>
                <button
                  onClick={handleUnlockSection}
                  className="ml-2 px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition-colors"
                  aria-label="Unlock section"
                >
                  Unlock
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate('settings')}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Settings"
                title="Settings"
              >
                <span className="text-xl">⚙️</span>
              </button>
              <button
                onClick={() => handleNavigate('emergency')}
                className="px-3 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
                aria-label="Emergency SOS"
              >
                🚨 SOS
              </button>
            </div>
          </div>
        </nav>
      )}

      <main className="pb-20">
        {renderPage()}
      </main>

      {/* Voice Assistant Modal/Overlay */}
      {showVoiceAssistant && (
        <VoiceAssistantModal
          onClose={() => setShowVoiceAssistant(false)}
          onNavigate={handleNavigate}
        />
      )}

      {/* Global Voice Feedback Display - Always visible */}
      <VoiceFeedbackDisplay language={voiceLanguage} />
    </div>
  );
}
