// ===== NAMMA ACCESS - INCLUSIVE BENGALURU TYPES =====

export type SupportCategory = 'senior' | 'disability' | 'parenting';
export type DisabilityMode = 'vision' | 'hearing';
export type AppLanguage = 'en' | 'kn' | 'hi'; // English, Kannada, Hindi
export type RiskLevel = 'low' | 'suspicious' | 'high' | 'unable';

export interface AccessibilityPreferences {
  largeText: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  voiceAssistantEnabled: boolean;
  textToSpeechRate: number; // 0.8 to 1.5
  vibrationAlerts: boolean;
  visualAlerts: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isCaregiver: boolean;
  isPrimary: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  phone: string;
  preferredLanguage: AppLanguage;
  supportCategory: SupportCategory;
  disabilityModes: DisabilityMode[];
  accessibility: AccessibilityPreferences;
  emergencyContacts: EmergencyContact[];
  isCaregiverVerified: boolean;
  caregiverName?: string;
  caregiverPhone?: string;
  updatedAt: number;
}

// Medicine Reminder
export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  scheduledTimes: string[]; // e.g. ["08:00", "14:00", "20:00"]
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  startDate: string;
  endDate?: string;
  notes?: string;
  active: boolean;
  takenToday: boolean;
  lastTakenAt?: number;
}

export interface MedicineEventLog {
  id: string;
  reminderId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  action: 'taken' | 'snoozed' | 'missed';
  timestamp: number;
  notes?: string;
}

// Scam Alert Analysis
export interface ScamAnalysisResult {
  id: string;
  sourceType: 'sms' | 'whatsapp' | 'text' | 'link';
  inputContent: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  reasons: string[];
  recommendations: string[];
  analyzedAt: number;
  savedToHistory: boolean;
}

// Parenting Activity & Routine
export interface ParentingActivity {
  id: string;
  childName: string;
  title: string;
  category: 'medicine' | 'appointment' | 'school' | 'routine' | 'custom';
  scheduledTime: string;
  scheduledDate: string;
  notes?: string;
  completed: boolean;
  completedAt?: number;
}

// Official Bengaluru Verified Emergency Contact
export interface VerifiedEmergencyResource {
  id: string;
  organizationName: string;
  phone: string;
  category: 'karnataka_emergency' | 'senior_helpline' | 'disability_cell' | 'police' | 'ambulance';
  description: string;
  verificationSource: string;
  lastVerifiedDate: string;
  status: 'verified' | 'active';
}

// SOS Trigger Event
export interface SOSEvent {
  id: string;
  initiatedAt: number;
  confirmedAt?: number;
  cancelledAt?: number;
  status: 'ready' | 'awaiting_confirmation' | 'calling' | 'messaging_opened' | 'request_submitted' | 'failed' | 'cancelled';
  initiatedByVoice: boolean;
  locationShared?: { lat: number; lng: number; landmark?: string };
  notifiedContacts: string[];
}

// Audit & History Record
export interface AuditHistoryEntry {
  id: string;
  timestamp: number;
  category: 'medicine' | 'scam' | 'sos' | 'parenting' | 'profile' | 'security';
  action: string;
  details: string;
  actor: string;
  outcome: 'success' | 'warning' | 'cancelled' | 'failed';
}

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info';
export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

// Language Strings
export interface Translations {
  [key: string]: { en: string; kn: string; hi: string };
}
