// Accessibility Service - High Contrast, Screen Reader, Visual Alerts
// For users with sight loss (blind) and hearing loss (deaf)

export type ContrastMode = 'normal' | 'high-contrast' | 'dark-high-contrast';
export type TextSize = 'normal' | 'large' | 'extra-large';

interface AccessibilitySettings {
  contrastMode: ContrastMode;
  textSize: TextSize;
  screenReaderEnabled: boolean;
  visualAlertsEnabled: boolean;
  vibrationEnabled: boolean;
  audioDescriptionsEnabled: boolean;
}

class AccessibilityService {
  private settings: AccessibilitySettings;
  private announceQueue: string[] = [];
  private isAnnouncing: boolean = false;

  constructor() {
    // Load saved settings
    const saved = localStorage.getItem('namma_accessibility_settings');
    this.settings = saved ? JSON.parse(saved) : {
      contrastMode: 'normal',
      textSize: 'normal',
      screenReaderEnabled: false,
      visualAlertsEnabled: false,
      vibrationEnabled: true,
      audioDescriptionsEnabled: false
    };

    this.applySettings();
  }

  // === CONTRAST & VISUAL SETTINGS ===

  setContrastMode(mode: ContrastMode) {
    this.settings.contrastMode = mode;
    this.applyContrastMode(mode);
    this.saveSettings();
    this.announce(`Contrast mode changed to ${mode}`);
  }

  private applyContrastMode(mode: ContrastMode) {
    const root = document.documentElement;

    // Remove existing mode classes
    root.classList.remove('contrast-normal', 'contrast-high', 'contrast-dark-high');

    switch (mode) {
      case 'high-contrast':
        root.classList.add('contrast-high');
        root.style.setProperty('--color-bg', '#FFFFFF');
        root.style.setProperty('--color-text', '#000000');
        root.style.setProperty('--color-primary', '#0000FF');
        root.style.setProperty('--color-error', '#FF0000');
        root.style.setProperty('--color-success', '#008000');
        root.style.setProperty('--color-border', '#000000');
        break;

      case 'dark-high-contrast':
        root.classList.add('contrast-dark-high');
        root.style.setProperty('--color-bg', '#000000');
        root.style.setProperty('--color-text', '#FFFFFF');
        root.style.setProperty('--color-primary', '#FFFF00');
        root.style.setProperty('--color-error', '#FF4444');
        root.style.setProperty('--color-success', '#00FF00');
        root.style.setProperty('--color-border', '#FFFFFF');
        break;

      default: // normal
        root.classList.add('contrast-normal');
        root.style.removeProperty('--color-bg');
        root.style.removeProperty('--color-text');
        root.style.removeProperty('--color-primary');
        root.style.removeProperty('--color-error');
        root.style.removeProperty('--color-success');
        root.style.removeProperty('--color-border');
    }
  }

  setTextSize(size: TextSize) {
    this.settings.textSize = size;
    this.applyTextSize(size);
    this.saveSettings();
    this.announce(`Text size changed to ${size}`);
  }

  private applyTextSize(size: TextSize) {
    const root = document.documentElement;

    switch (size) {
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'extra-large':
        root.style.fontSize = '24px';
        break;
      default:
        root.style.fontSize = '16px';
    }
  }

  // === SCREEN READER SUPPORT ===

  enableScreenReader(enabled: boolean) {
    this.settings.screenReaderEnabled = enabled;
    this.saveSettings();

    if (enabled) {
      this.announce('Screen reader enabled. All actions will be announced.');
    }
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.settings.screenReaderEnabled) return;

    // Add to queue
    this.announceQueue.push(message);

    // Create or update live region
    let liveRegion = document.getElementById('namma-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'namma-live-region';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
      document.body.appendChild(liveRegion);
    }

    // Process queue
    if (!this.isAnnouncing) {
      this.processAnnounceQueue(liveRegion);
    }
  }

  private processAnnounceQueue(liveRegion: HTMLElement) {
    if (this.announceQueue.length === 0) {
      this.isAnnouncing = false;
      return;
    }

    this.isAnnouncing = true;
    const message = this.announceQueue.shift()!;

    liveRegion.textContent = message;

    // Wait for screen reader to announce, then process next
    setTimeout(() => {
      this.processAnnounceQueue(liveRegion);
    }, 2000);
  }

  // === VISUAL ALERTS (FOR DEAF USERS) ===

  enableVisualAlerts(enabled: boolean) {
    this.settings.visualAlertsEnabled = enabled;
    this.saveSettings();

    if (enabled) {
      this.showVisualAlert('Visual alerts enabled', 'success');
    }
  }

  showVisualAlert(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 5000) {
    if (!this.settings.visualAlertsEnabled) return;

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `visual-alert visual-alert-${type}`;
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'assertive');

    // Color coding for different alert types
    const colors = {
      info: 'bg-blue-600 border-blue-800',
      success: 'bg-green-600 border-green-800',
      warning: 'bg-amber-600 border-amber-800',
      error: 'bg-red-600 border-red-800'
    };

    alert.innerHTML = `
      <div class="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] ${colors[type]} text-white px-8 py-6 rounded-2xl shadow-2xl border-4 animate-visual-alert max-w-2xl">
        <div class="flex items-center gap-4">
          <div class="text-6xl animate-pulse">
            ${type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : type === 'success' ? '✅' : 'ℹ️'}
          </div>
          <div>
            <p class="text-3xl font-black mb-2">${this.getAlertTitle(type)}</p>
            <p class="text-2xl font-bold">${message}</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(alert);

    // Vibrate if enabled
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      // Different vibration patterns for different alerts
      const patterns = {
        info: [100],
        success: [100, 50, 100],
        warning: [200, 100, 200],
        error: [300, 100, 300, 100, 300]
      };
      navigator.vibrate(patterns[type]);
    }

    // Remove after duration
    setTimeout(() => {
      alert.classList.add('opacity-0');
      setTimeout(() => alert.remove(), 300);
    }, duration);

    // Also announce for screen readers
    this.announce(message, 'assertive');
  }

  private getAlertTitle(type: string): string {
    const titles = {
      info: 'INFORMATION',
      success: 'SUCCESS',
      warning: 'WARNING',
      error: 'ALERT'
    };
    return titles[type as keyof typeof titles] || 'NOTICE';
  }

  // === VIBRATION (FOR DEAF USERS) ===

  enableVibration(enabled: boolean) {
    this.settings.vibrationEnabled = enabled;
    this.saveSettings();

    if (enabled && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // Confirmation vibration
    }
  }

  vibrate(pattern: number | number[]) {
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // === AUDIO DESCRIPTIONS ===

  enableAudioDescriptions(enabled: boolean) {
    this.settings.audioDescriptionsEnabled = enabled;
    this.saveSettings();
  }

  // === SETTINGS MANAGEMENT ===

  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  private applySettings() {
    this.applyContrastMode(this.settings.contrastMode);
    this.applyTextSize(this.settings.textSize);
  }

  private saveSettings() {
    localStorage.setItem('namma_accessibility_settings', JSON.stringify(this.settings));
  }

  // === KEYBOARD NAVIGATION HELPERS ===

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt+H: Toggle high contrast
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        const modes: ContrastMode[] = ['normal', 'high-contrast', 'dark-high-contrast'];
        const currentIndex = modes.indexOf(this.settings.contrastMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        this.setContrastMode(nextMode);
      }

      // Alt+Plus: Increase text size
      if (e.altKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const sizes: TextSize[] = ['normal', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(this.settings.textSize);
        if (currentIndex < sizes.length - 1) {
          this.setTextSize(sizes[currentIndex + 1]);
        }
      }

      // Alt+Minus: Decrease text size
      if (e.altKey && e.key === '-') {
        e.preventDefault();
        const sizes: TextSize[] = ['normal', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(this.settings.textSize);
        if (currentIndex > 0) {
          this.setTextSize(sizes[currentIndex - 1]);
        }
      }

      // Alt+V: Toggle visual alerts
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        this.enableVisualAlerts(!this.settings.visualAlertsEnabled);
      }

      // Alt+R: Toggle screen reader
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        this.enableScreenReader(!this.settings.screenReaderEnabled);
      }
    });
  }

  // === FOCUS MANAGEMENT ===

  trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });

    firstFocusable?.focus();
  }
}

// Singleton instance
export const accessibilityService = new AccessibilityService();

// Initialize keyboard shortcuts
if (typeof window !== 'undefined') {
  accessibilityService.setupKeyboardShortcuts();
}
