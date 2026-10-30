import React, { useState } from 'react';

type UserType = 'senior' | 'disabled' | 'parent' | null;

interface UserSetupProps {
  onComplete: (type: UserType) => void;
}

export function UserSetup({ onComplete }: UserSetupProps) {
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleContinue = () => {
    if (selectedType) {
      onComplete(selectedType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-4xl font-extrabold text-teal-800 mb-2">Welcome to Namma Access</h1>
          <p className="text-lg text-stone-600">Inclusive Bengaluru - Digital Services for Everyone</p>
        </div>

        {/* Selection Question */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Who are you?</h2>
          <p className="text-stone-600">Select your category to personalize your experience</p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Senior Citizen */}
          <button
            onClick={() => setSelectedType('senior')}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              selectedType === 'senior'
                ? 'border-teal-600 bg-teal-50 shadow-lg scale-105'
                : 'border-stone-200 hover:border-teal-300 hover:shadow-md'
            }`}
          >
            <div className="text-5xl mb-4">👵</div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Senior Citizen</h3>
            <p className="text-sm text-stone-600">
              Medicine reminders, grocery lists, fraud detection, and emergency support
            </p>
            {selectedType === 'senior' && (
              <div className="mt-4 flex items-center gap-2 text-teal-700 font-semibold">
                <span>✓</span>
                <span>Selected</span>
              </div>
            )}
          </button>

          {/* Person with Disability */}
          <button
            onClick={() => setSelectedType('disabled')}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              selectedType === 'disabled'
                ? 'border-teal-600 bg-teal-50 shadow-lg scale-105'
                : 'border-stone-200 hover:border-teal-300 hover:shadow-md'
            }`}
          >
            <div className="text-5xl mb-4">♿</div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Person with Disability</h3>
            <p className="text-sm text-stone-600">
              Full voice control, environmental sound detection, high contrast, and accessibility features
            </p>
            {selectedType === 'disabled' && (
              <div className="mt-4 flex items-center gap-2 text-teal-700 font-semibold">
                <span>✓</span>
                <span>Selected</span>
              </div>
            )}
          </button>

          {/* Parent/Caregiver */}
          <button
            onClick={() => setSelectedType('parent')}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              selectedType === 'parent'
                ? 'border-teal-600 bg-teal-50 shadow-lg scale-105'
                : 'border-stone-200 hover:border-teal-300 hover:shadow-md'
            }`}
          >
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Parent/Caregiver</h3>
            <p className="text-sm text-stone-600">
              Family schedules, child appointments, routine reminders, and caregiver coordination
            </p>
            {selectedType === 'parent' && (
              <div className="mt-4 flex items-center gap-2 text-teal-700 font-semibold">
                <span>✓</span>
                <span>Selected</span>
              </div>
            )}
          </button>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType}
            className={`px-12 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              selectedType
                ? 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            Continue to App →
          </button>
          <p className="text-xs text-stone-500 mt-4">
            You can change this later in Settings
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🇮🇳</div>
              <p className="text-sm font-semibold text-stone-800">Multilingual</p>
              <p className="text-xs text-stone-600">English, Kannada, Hindi</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-semibold text-stone-800">Privacy First</p>
              <p className="text-xs text-stone-600">All data stays on your device</p>
            </div>
            <div>
              <div className="text-3xl mb-2">♿</div>
              <p className="text-sm font-semibold text-stone-800">Fully Accessible</p>
              <p className="text-xs text-stone-600">Voice control & vibration alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
