import {
  UserProfile,
  MedicineReminder,
  ScamAnalysisResult,
  ParentingActivity,
  AuditHistoryEntry,
  VerifiedEmergencyResource
} from '@/types';

const KEYS = {
  PROFILE: 'namma_user_profile',
  MEDICINES: 'namma_medicines',
  SCAMS: 'namma_scams',
  PARENTING: 'namma_parenting',
  AUDIT: 'namma_audit',
  SOS_EVENTS: 'namma_sos_events'
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const nammaStorage = {
  // Profile
  getProfile(): UserProfile {
    return getItem<UserProfile>(KEYS.PROFILE, {
      id: 'usr_001',
      name: 'Bengaluru Citizen',
      phone: '+91 98765 43210',
      preferredLanguage: 'en',
      supportCategory: 'senior',
      disabilityModes: [],
      accessibility: {
        largeText: false,
        highContrast: false,
        screenReaderOptimized: false,
        voiceAssistantEnabled: true,
        textToSpeechRate: 1.0,
        vibrationAlerts: true,
        visualAlerts: true
      },
      emergencyContacts: [
        {
          id: 'c1',
          name: 'Caregiver / Family Member',
          relationship: 'Child',
          phone: '+91 98765 00000',
          isCaregiver: true,
          isPrimary: true
        }
      ],
      isCaregiverVerified: true,
      updatedAt: Date.now()
    });
  },
  saveProfile(profile: UserProfile): void {
    setItem(KEYS.PROFILE, profile);
    this.addAudit('profile', 'Profile Updated', 'Updated accessibility and contact preferences');
  },

  // Medicine Reminders
  getMedicines(): MedicineReminder[] {
    return getItem<MedicineReminder[]>(KEYS.MEDICINES, [
      {
        id: 'med_1',
        medicineName: 'Amlodipine (Blood Pressure)',
        dosage: '5mg - 1 Tablet',
        scheduledTimes: ['08:00', '20:00'],
        frequency: 'twice_daily',
        startDate: new Date().toISOString().split('T')[0],
        active: true,
        takenToday: false,
        notes: 'Take with water after food'
      },
      {
        id: 'med_2',
        medicineName: 'Metformin (Diabetes)',
        dosage: '500mg - 1 Tablet',
        scheduledTimes: ['09:00'],
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        active: true,
        takenToday: true,
        lastTakenAt: Date.now() - 3600000,
        notes: 'Take with breakfast'
      }
    ]);
  },
  saveMedicines(medicines: MedicineReminder[]): void {
    setItem(KEYS.MEDICINES, medicines);
  },
  markMedicineTaken(id: string): void {
    const meds = this.getMedicines();
    const updated = meds.map(m => {
      if (m.id === id) {
        return { ...m, takenToday: true, lastTakenAt: Date.now() };
      }
      return m;
    });
    this.saveMedicines(updated);
    const med = meds.find(m => m.id === id);
    this.addAudit('medicine', 'Medicine Marked Taken', `Marked ${med?.medicineName || 'medicine'} as taken`);
  },

  // Scam Alert Analysis
  getScamHistory(): ScamAnalysisResult[] {
    return getItem<ScamAnalysisResult[]>(KEYS.SCAMS, [
      {
        id: 'scam_1',
        sourceType: 'sms',
        inputContent: 'Electricity power cut off at 9:30 PM due to unpaid bill. Pay immediately at link: http://bengaluru-bescom-update.com',
        riskLevel: 'high',
        riskScore: 92,
        reasons: ['Suspicious non-official domain URL', 'Urgency pressure tactic', 'Requests unverified payment'],
        recommendations: ['Do NOT click the link', 'Verify directly on BESCOM official website or app', 'Block the sender number'],
        analyzedAt: Date.now() - 86400000,
        savedToHistory: true
      }
    ]);
  },
  saveScamAnalysis(analysis: ScamAnalysisResult): void {
    const history = this.getScamHistory();
    setItem(KEYS.SCAMS, [analysis, ...history]);
    this.addAudit('scam', 'Scam Analysis Performed', `Analyzed message with risk level: ${analysis.riskLevel.toUpperCase()}`);
  },

  // Parenting Activities
  getParentingActivities(): ParentingActivity[] {
    return getItem<ParentingActivity[]>(KEYS.PARENTING, [
      {
        id: 'p_1',
        childName: 'Aarav',
        title: 'Polio Vaccination Appointment',
        category: 'appointment',
        scheduledTime: '10:00',
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: 'Primary Health Centre, Indiranagar',
        completed: false
      },
      {
        id: 'p_2',
        childName: 'Aarav',
        title: 'School Routine: Pack Homework & Water Bottle',
        category: 'school',
        scheduledTime: '07:30',
        scheduledDate: new Date().toISOString().split('T')[0],
        completed: true,
        completedAt: Date.now() - 7200000
      }
    ]);
  },
  saveParentingActivities(activities: ParentingActivity[]): void {
    setItem(KEYS.PARENTING, activities);
  },

  // Official Verified Bengaluru Emergency Directory
  getVerifiedEmergencyResources(): VerifiedEmergencyResource[] {
    return [
      {
        id: 'er_1',
        organizationName: 'Karnataka Emergency Response System',
        phone: '112',
        category: 'karnataka_emergency',
        description: 'Toll-free 24x7 unified emergency helpline for Police, Fire, and Medical assistance in Karnataka.',
        verificationSource: 'Karnataka State Police Official Portal',
        lastVerifiedDate: '2026-10-15',
        status: 'verified'
      },
      {
        id: 'er_2',
        organizationName: 'Bengaluru Senior Citizen Helpline',
        phone: '1090',
        category: 'senior_helpline',
        description: 'Dedicated Bengaluru City Police helpline for senior citizen support, security, and immediate intervention.',
        verificationSource: 'Bengaluru City Police Helpline Register',
        lastVerifiedDate: '2026-10-20',
        status: 'verified'
      },
      {
        id: 'er_3',
        organizationName: 'Karnataka Disability Welfare Helpline / Assistance Cell',
        phone: '080-22865481',
        category: 'disability_cell',
        description: 'Directorate for the Empowerment of Differently Abled and Senior Citizens, Vidhana Soudha, Bengaluru.',
        verificationSource: 'Government of Karnataka Official Directory',
        lastVerifiedDate: '2026-10-10',
        status: 'verified'
      },
      {
        id: 'er_4',
        organizationName: 'BBMP Control Room (Bengaluru Emergency Helpline)',
        phone: '1533',
        category: 'ambulance',
        description: 'Bruhat Bengaluru Mahanagara Palike unified civic emergency control room.',
        verificationSource: 'BBMP Official Public Service Portal',
        lastVerifiedDate: '2026-10-18',
        status: 'verified'
      }
    ];
  },

  // Audit Logs
  getAuditLogs(): AuditHistoryEntry[] {
    return getItem<AuditHistoryEntry[]>(KEYS.AUDIT, [
      {
        id: 'aud_1',
        timestamp: Date.now() - 3600000,
        category: 'medicine',
        action: 'Medicine Scheduled',
        details: 'Amlodipine (5mg) scheduled for daily reminder',
        actor: 'User (Self)',
        outcome: 'success'
      },
      {
        id: 'aud_2',
        timestamp: Date.now() - 7200000,
        category: 'security',
        action: 'App Session Authenticated',
        details: 'OTP verified successfully via authorized login',
        actor: 'System Auth',
        outcome: 'success'
      }
    ]);
  },
  addAudit(category: AuditHistoryEntry['category'], action: string, details: string, outcome: AuditHistoryEntry['outcome'] = 'success'): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditHistoryEntry = {
      id: `aud_${Date.now()}`,
      timestamp: Date.now(),
      category,
      action,
      details,
      actor: 'User',
      outcome
    };
    setItem(KEYS.AUDIT, [newEntry, ...logs]);
  }
};
