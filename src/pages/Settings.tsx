import React from 'react';

type UserType = 'senior' | 'disabled' | 'parent' | null;

interface SettingsProps {
  onNavigate: (page: string) => void;
  onResetSetup: () => void;
  userType: UserType;
}

export function Settings({ onNavigate, onResetSetup, userType }: SettingsProps) {
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const handleReset = () => {
    onResetSetup();
  };

  const userTypeLabels = {
    senior: 'Senior Citizen',
    disabled: 'Person with Disability',
    parent: 'Parent/Caregiver'
  };

  const userTypeIcons = {
    senior: '👵',
    disabled: '♿',
    parent: '👨‍👩‍👧'
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL app data? This cannot be undone.')) {
      localStorage.clear();
      alert('All data cleared. The app will now reload.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <button onClick={() => onNavigate('home')} className="text-teal-600 text-sm font-semibold hover:underline mb-1 block">
          &larr; Back to Home
        </button>
        <h1 className="text-3xl font-extrabold text-stone-900">Settings</h1>
        <p className="text-stone-600 text-sm mt-1">Manage your profile and app preferences</p>
      </div>

      {/* Current Profile */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-2xl shadow-sm border-2 border-teal-200">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Current Profile</h2>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl">
          <div className="text-5xl">{userType ? userTypeIcons[userType] : '❓'}</div>
          <div className="flex-1">
            <p className="text-lg font-bold text-stone-900">
              {userType ? userTypeLabels[userType] : 'Not Set'}
            </p>
            <p className="text-sm text-stone-600">Your personalized experience is active</p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors"
          >
            Change Profile
          </button>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        <h2 className="text-xl font-bold text-stone-900">App Information</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-sm font-bold text-stone-700 mb-1">Version</p>
            <p className="text-lg font-semibold text-teal-700">1.0.0</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-sm font-bold text-stone-700 mb-1">Data Storage</p>
            <p className="text-lg font-semibold text-teal-700">Local Only</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-sm font-bold text-stone-700 mb-1">Languages</p>
            <p className="text-sm text-stone-700">English, ಕನ್ನಡ, हिंदी</p>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-sm font-bold text-stone-700 mb-1">Privacy</p>
            <p className="text-sm text-stone-700">No data sent to servers</p>
          </div>
        </div>
      </div>

      {/* Accessibility Settings Link */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Quick Access</h2>
        <div className="space-y-3">
          <button
            onClick={() => onNavigate('disability-support')}
            className="w-full p-4 bg-stone-50 hover:bg-stone-100 rounded-xl text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">♿</span>
              <div>
                <p className="font-bold text-stone-900">Accessibility Settings</p>
                <p className="text-xs text-stone-600">Voice control, high contrast, large text</p>
              </div>
            </div>
            <span className="text-teal-600">→</span>
          </button>

          <button
            onClick={() => onNavigate('audit')}
            className="w-full p-4 bg-stone-50 hover:bg-stone-100 rounded-xl text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-bold text-stone-900">Activity History</p>
                <p className="text-xs text-stone-600">View and export your activity logs</p>
              </div>
            </div>
            <span className="text-teal-600">→</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-red-50 p-6 rounded-2xl shadow-sm border-2 border-red-200">
        <h2 className="text-xl font-bold text-red-900 mb-2">Data Management</h2>
        <p className="text-sm text-red-700 mb-4">
          These actions will permanently delete your data. Use with caution.
        </p>
        <div className="space-y-3">
          <button
            onClick={clearAllData}
            className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm"
          >
            Clear All App Data
          </button>
          <p className="text-xs text-red-600 text-center">
            This will delete medicines, contacts, groceries, and all settings
          </p>
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 rounded-2xl text-white">
        <h3 className="text-xl font-bold mb-2">About Namma Access</h3>
        <p className="text-sm opacity-90 mb-4">
          Bengaluru's first fully accessible civic platform, designed for senior citizens, people with disabilities, and families.
          Built with privacy, accessibility, and local context in mind.
        </p>
        <div className="flex gap-4 text-xs">
          <span>🏛️ Verified Emergency Numbers</span>
          <span>🔒 Privacy First</span>
          <span>♿ Fully Accessible</span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900">Change Your Profile?</h3>
            <p className="text-sm text-stone-600">
              This will return you to the setup screen. Your data (medicines, contacts, etc.) will be preserved.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold text-sm hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700"
              >
                Change Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
