// Accessibility Controls Component - UI for blind and deaf users
import React, { useState, useEffect } from 'react';
import { accessibilityService, type ContrastMode, type TextSize } from '@/services/accessibilityService';

interface AccessibilityControlsProps {
  onClose?: () => void;
}

export function AccessibilityControls({ onClose }: AccessibilityControlsProps) {
  const [settings, setSettings] = useState(accessibilityService.getSettings());

  useEffect(() => {
    // Load settings on mount
    setSettings(accessibilityService.getSettings());
  }, []);

  const handleContrastChange = (mode: ContrastMode) => {
    accessibilityService.setContrastMode(mode);
    setSettings(accessibilityService.getSettings());
    accessibilityService.showVisualAlert(`Contrast mode: ${mode}`, 'success');
  };

  const handleTextSizeChange = (size: TextSize) => {
    accessibilityService.setTextSize(size);
    setSettings(accessibilityService.getSettings());
    accessibilityService.showVisualAlert(`Text size: ${size}`, 'success');
  };

  const handleScreenReaderToggle = () => {
    const newValue = !settings.screenReaderEnabled;
    accessibilityService.enableScreenReader(newValue);
    setSettings(accessibilityService.getSettings());
    accessibilityService.showVisualAlert(
      `Screen reader ${newValue ? 'enabled' : 'disabled'}`,
      'success'
    );
  };

  const handleVisualAlertsToggle = () => {
    const newValue = !settings.visualAlertsEnabled;
    accessibilityService.enableVisualAlerts(newValue);
    setSettings(accessibilityService.getSettings());
  };

  const handleVibrationToggle = () => {
    const newValue = !settings.vibrationEnabled;
    accessibilityService.enableVibration(newValue);
    setSettings(accessibilityService.getSettings());
    accessibilityService.showVisualAlert(
      `Vibration ${newValue ? 'enabled' : 'disabled'}`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        role="dialog"
        aria-labelledby="accessibility-title"
        aria-describedby="accessibility-description"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="accessibility-title" className="text-3xl font-extrabold text-teal-800">
                ♿ Accessibility Settings
              </h2>
              <p id="accessibility-description" className="text-sm text-teal-600 mt-1">
                Customize your experience for sight loss, hearing loss, or other needs
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Close accessibility settings"
              >
                <span className="text-3xl">✕</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* VISION ASSISTANCE */}
          <section aria-labelledby="vision-heading">
            <h3 id="vision-heading" className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              👁️ Vision Assistance (For Sight Loss)
            </h3>

            {/* Contrast Mode */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl mb-4">
              <label className="block text-lg font-bold text-stone-900 mb-3">
                Color Contrast Mode
              </label>
              <p className="text-sm text-stone-600 mb-4">
                Choose high contrast colors for better visibility
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleContrastChange('normal')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    settings.contrastMode === 'normal'
                      ? 'border-teal-600 bg-white shadow-lg scale-105'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                  aria-pressed={settings.contrastMode === 'normal'}
                  aria-label="Normal contrast mode"
                >
                  <div className="text-4xl mb-2">🌈</div>
                  <div className="font-bold text-lg">Normal</div>
                  <div className="text-xs text-stone-600 mt-1">Regular colors</div>
                </button>

                <button
                  onClick={() => handleContrastChange('high-contrast')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    settings.contrastMode === 'high-contrast'
                      ? 'border-blue-600 bg-white shadow-lg scale-105'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                  aria-pressed={settings.contrastMode === 'high-contrast'}
                  aria-label="High contrast mode with black text on white"
                >
                  <div className="text-4xl mb-2">⚫⚪</div>
                  <div className="font-bold text-lg">High Contrast</div>
                  <div className="text-xs text-stone-600 mt-1">Black on white</div>
                </button>

                <button
                  onClick={() => handleContrastChange('dark-high-contrast')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    settings.contrastMode === 'dark-high-contrast'
                      ? 'border-yellow-600 bg-black text-white shadow-lg scale-105'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                  aria-pressed={settings.contrastMode === 'dark-high-contrast'}
                  aria-label="Dark high contrast mode with white text on black"
                >
                  <div className="text-4xl mb-2">⚪⚫</div>
                  <div className="font-bold text-lg">Dark High Contrast</div>
                  <div className="text-xs text-stone-600 mt-1">White on black</div>
                </button>
              </div>
            </div>

            {/* Text Size */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl mb-4">
              <label className="block text-lg font-bold text-stone-900 mb-3">
                Text Size
              </label>
              <p className="text-sm text-stone-600 mb-4">
                Make text larger for easier reading
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleTextSizeChange('normal')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    settings.textSize === 'normal'
                      ? 'border-teal-600 bg-white shadow-lg scale-105'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                  aria-pressed={settings.textSize === 'normal'}
                  aria-label="Normal text size"
                >
                  <div className="text-2xl font-bold mb-2">Aa</div>
                  <div className="font-bold text-base">Normal</div>
                  <div className="text-xs text-stone-600 mt-1">16px</div>
                </button>

                <button
                  onClick={() => handleTextSizeChange('large')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    settings.textSize === 'large'
                      ? 'border-teal-600 bg-white shadow-lg scale-105'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                  aria-pressed={settings.textSize === 'large'}
                  aria-label="Large text size"
                >
                  <div className="text-3xl font-bold mb-2">Aa</div>
                  <div className="font-bold text-lg">Large</div>
                  <div className="text-xs text-stone-600 mt-1">18px</div>
                </button>

                <button
                  onClick={() => handleTextSizeChange('extra-large')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    settings.textSize === 'extra-large'
                      ? 'border-teal-600 bg-white shadow-lg scale-105'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                  aria-pressed={settings.textSize === 'extra-large'}
                  aria-label="Extra large text size"
                >
                  <div className="text-4xl font-bold mb-2">Aa</div>
                  <div className="font-bold text-xl">Extra Large</div>
                  <div className="text-xs text-stone-600 mt-1">24px</div>
                </button>
              </div>
            </div>

            {/* Screen Reader */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label htmlFor="screen-reader-toggle" className="block text-lg font-bold text-stone-900 mb-2">
                    🔊 Screen Reader Announcements
                  </label>
                  <p className="text-sm text-stone-600 mb-3">
                    Get audio announcements for all actions (recommended for blind users)
                  </p>
                  <p className="text-xs text-stone-500 italic">
                    Works with JAWS, NVDA, VoiceOver, and TalkBack
                  </p>
                </div>
                <button
                  id="screen-reader-toggle"
                  onClick={handleScreenReaderToggle}
                  className={`ml-4 relative inline-flex h-16 w-28 items-center rounded-full transition-colors ${
                    settings.screenReaderEnabled ? 'bg-teal-600' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={settings.screenReaderEnabled}
                  aria-label="Toggle screen reader announcements"
                >
                  <span
                    className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform ${
                      settings.screenReaderEnabled ? 'translate-x-14' : 'translate-x-2'
                    }`}
                  />
                  <span className="sr-only">
                    {settings.screenReaderEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* HEARING ASSISTANCE */}
          <section aria-labelledby="hearing-heading">
            <h3 id="hearing-heading" className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              👂 Hearing Assistance (For Hearing Loss / Deaf Users)
            </h3>

            {/* Visual Alerts */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label htmlFor="visual-alerts-toggle" className="block text-lg font-bold text-stone-900 mb-2">
                    👁️ Visual Alerts
                  </label>
                  <p className="text-sm text-stone-600 mb-3">
                    Show large visual notifications with colors and animations (essential for deaf users)
                  </p>
                  <p className="text-xs text-stone-500 italic">
                    Replaces audio alerts with visible on-screen messages
                  </p>
                </div>
                <button
                  id="visual-alerts-toggle"
                  onClick={handleVisualAlertsToggle}
                  className={`ml-4 relative inline-flex h-16 w-28 items-center rounded-full transition-colors ${
                    settings.visualAlertsEnabled ? 'bg-amber-600' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={settings.visualAlertsEnabled}
                  aria-label="Toggle visual alerts"
                >
                  <span
                    className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform ${
                      settings.visualAlertsEnabled ? 'translate-x-14' : 'translate-x-2'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Vibration */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label htmlFor="vibration-toggle" className="block text-lg font-bold text-stone-900 mb-2">
                    📳 Vibration Alerts
                  </label>
                  <p className="text-sm text-stone-600 mb-3">
                    Feel vibration patterns for different types of notifications (for deaf users on mobile)
                  </p>
                  <p className="text-xs text-stone-500 italic">
                    Different patterns: Info (1 buzz), Success (2 buzz), Warning (3 buzz), Error (4 buzz)
                  </p>
                </div>
                <button
                  id="vibration-toggle"
                  onClick={handleVibrationToggle}
                  className={`ml-4 relative inline-flex h-16 w-28 items-center rounded-full transition-colors ${
                    settings.vibrationEnabled ? 'bg-red-600' : 'bg-stone-300'
                  }`}
                  role="switch"
                  aria-checked={settings.vibrationEnabled}
                  aria-label="Toggle vibration alerts"
                >
                  <span
                    className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform ${
                      settings.vibrationEnabled ? 'translate-x-14' : 'translate-x-2'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* KEYBOARD SHORTCUTS */}
          <section aria-labelledby="shortcuts-heading">
            <h3 id="shortcuts-heading" className="text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              ⌨️ Keyboard Shortcuts
            </h3>
            <div className="bg-gradient-to-br from-stone-50 to-stone-100 p-6 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-white border-2 border-stone-300 rounded-lg font-mono text-sm font-bold">
                    Alt + H
                  </kbd>
                  <span className="text-sm">Toggle contrast mode</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-white border-2 border-stone-300 rounded-lg font-mono text-sm font-bold">
                    Alt + +
                  </kbd>
                  <span className="text-sm">Increase text size</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-white border-2 border-stone-300 rounded-lg font-mono text-sm font-bold">
                    Alt + -
                  </kbd>
                  <span className="text-sm">Decrease text size</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-white border-2 border-stone-300 rounded-lg font-mono text-sm font-bold">
                    Alt + R
                  </kbd>
                  <span className="text-sm">Toggle screen reader</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-white border-2 border-stone-300 rounded-lg font-mono text-sm font-bold">
                    Alt + V
                  </kbd>
                  <span className="text-sm">Toggle visual alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-2 bg-white border-2 border-stone-300 rounded-lg font-mono text-sm font-bold">
                    Tab
                  </kbd>
                  <span className="text-sm">Navigate between elements</span>
                </div>
              </div>
            </div>
          </section>

          {/* Test Buttons */}
          <section aria-labelledby="test-heading" className="pb-4">
            <h3 id="test-heading" className="text-2xl font-bold text-stone-900 mb-4">
              🧪 Test Your Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => accessibilityService.showVisualAlert('This is a test alert!', 'info', 3000)}
                className="p-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                aria-label="Test visual alert"
              >
                Test Visual Alert
              </button>
              <button
                onClick={() => accessibilityService.vibrate([200, 100, 200])}
                className="p-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                aria-label="Test vibration"
              >
                Test Vibration
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
