import React, { useState, useEffect, useRef } from 'react';
import { nammaStorage } from '@/services/nammaStorage';
import { MedicineReminder } from '@/types';

interface VoiceAssistantModalProps {
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

type Language = 'en' | 'kn' | 'hi';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  action?: {
    type: 'navigate' | 'add_medicine' | 'call' | 'open_modal';
    payload?: any;
  };
}

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  reminderDate: string;
  completed: boolean;
}

interface UserProfile {
  name: string;
  age: string;
  mobile: string;
  emergencyContacts: Array<{
    id: string;
    name: string;
    relationship: string;
    mobile: string;
  }>;
}

const translations = {
  listening: { en: 'Listening...', kn: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...', hi: 'सुन रहा हूँ...' },
  typeMessage: { en: 'Type your message...', kn: 'ನಿಮ್ಮ ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...', hi: 'अपना संदेश टाइप करें...' },
  send: { en: 'Send', kn: 'ಕಳುಹಿಸು', hi: 'भेजें' },
  close: { en: 'Close', kn: 'ಮುಚ್ಚು', hi: 'बंद करें' },
  voiceNotSupported: {
    en: 'Voice recognition not supported in this browser',
    kn: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ',
    hi: 'इस ब्राउज़र में वॉइस पहचान समर्थित नहीं है'
  },
  clear: { en: 'Clear', kn: 'ಅಳಿಸು', hi: 'साफ़ करें' }
};

export function VoiceAssistantModal({ onClose, onNavigate }: VoiceAssistantModalProps) {
  const [lang, setLang] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [prefilledMedicineName, setPrefilledMedicineName] = useState('');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);

    const savedLang = localStorage.getItem('voice_assistant_language') as Language;
    if (savedLang && ['en', 'kn', 'hi'].includes(savedLang)) {
      setLang(savedLang);
    }

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // OPTIMIZED: No delay, instant processing
        handleSendMessage(null, transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // AI Greeting based on time - OPTIMIZED: Reduced delay
    setTimeout(() => {
      const hour = new Date().getHours();
      let greeting = '';

      if (lang === 'en') {
        if (hour < 12) greeting = "Good morning! I'm your personal health companion. I can help you add medicines, check your schedule, search your data, and handle emergencies. What can I do for you?";
        else if (hour < 17) greeting = "Good afternoon! I'm here to help with medicines, reminders, emergencies, and more. Just tell me what you need!";
        else greeting = "Good evening! I can help you manage medicines, find information, or handle emergencies. How can I assist you tonight?";
      } else if (lang === 'kn') {
        greeting = "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಸಹಾಯಕ. ನಾನು ಔಷಧಗಳು, ತುರ್ತು ಸಹಾಯ ಮತ್ತು ಹೆಚ್ಚಿನದರಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು!";
      } else {
        greeting = "नमस्ते! मैं आपका व्यक्तिगत स्वास्थ्य साथी हूं। मैं दवाओं, आपातकालीन सहायता और अधिक में मदद कर सकता हूं!";
      }

      speakText(greeting, lang);
    }, 300);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      const langCodes = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };
      recognitionRef.current.lang = langCodes[lang];
    }
    localStorage.setItem('voice_assistant_language', lang);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string, language: Language = lang) => {
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel();
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = true;

      const utterance = new SpeechSynthesisUtterance(text);
      const langCodes = { en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN' };
      utterance.lang = langCodes[language];
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang.startsWith(langCodes[language].split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        isSpeakingRef.current = false;
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    if (!voiceSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ENHANCED AI Response Generator with COMPLETE MULTI-LANGUAGE SUPPORT
  const getAIResponse = (userMessage: string, language: Language, context: string[]): { text: string; action?: Message['action'] } => {
    const lower = userMessage.toLowerCase().trim();

    // AUTO-DETECT language from message (CRITICAL FIX!)
    const hasKannada = /[ಀ-೿]/.test(userMessage);
    const hasHindi = /[ऀ-ॿ]/.test(userMessage);
    const effectiveLang = hasKannada ? 'kn' : hasHindi ? 'hi' : language;

    // Helper function for better pattern matching - IMPROVED
    const matchesAny = (patterns: string[]) => {
      return patterns.some(pattern => {
        const patternLower = pattern.toLowerCase();
        // For non-Latin scripts, check in original message
        if (/[^\x00-\x7F]/.test(pattern)) {
          // Check if the pattern exists as a word or part of message
          return userMessage.includes(pattern);
        }
        // For English, use lowercase with word boundary awareness
        return lower.includes(patternLower);
      });
    };

    // ===== PHASE 1: SMART ACTION COMMANDS =====

    // 1. ADD MEDICINE COMMAND (COMPLETE Multi-language fix)
    const addMedicinePatterns = [
      // English
      'add medicine', 'add med', 'medicine', 'new medicine', 'med',
      // Kannada - ULTRA SIMPLIFIED (single word works!)
      'ಔಷಧ', 'ಹೊಸ ಔಷಧ', 'ಔಷಧ ಸೇರಿಸು', 'ಔಷಧ ಸೇರಿಸಿ',
      // Hindi - ULTRA SIMPLIFIED (single word works!)
      'दवा', 'दवाई', 'नई दवा', 'दवा जोड़ें', 'दवा जोड़ो'
    ];
    const isAddMedicine = matchesAny(addMedicinePatterns);

    if (isAddMedicine) {
      // COMPLETE FIX: Better medicine name extraction for all languages
      const patterns = [
        /(?:add medicine|add med|medicine|med)\s+(.+)/i,
        /(?:ಔಷಧ|ಹೊಸ ಔಷಧ|ಔಷಧ ಸೇರಿಸು|ಔಷಧ ಸೇರಿಸಿ)\s+(.+)/,
        /(?:दवा|दवाई|नई दवा|दवा जोड़ें|दवा जोड़ो)\s+(.+)/
      ];

      let medicineName = '';
      for (const pattern of patterns) {
        const match = userMessage.match(pattern);
        if (match && match[1]) {
          medicineName = match[1].trim();
          break;
        }
      }

      setPrefilledMedicineName(medicineName);
      setShowAddMedicineModal(true);

      const responses = {
        en: medicineName
          ? `✓ Opening medicine form with "${medicineName}". Add dosage details!`
          : "✓ Opening medicine form. Which medicine do you want to add?",
        kn: medicineName
          ? `✓ "${medicineName}" ಔಷಧ ಫಾರ್ಮ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ!`
          : "✓ ಔಷಧ ಫಾರ್ಮ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ. ಯಾವ ಔಷಧ ಬೇಕು?",
        hi: medicineName
          ? `✓ "${medicineName}" दवा फॉर्म खोल रहा हूं!`
          : "✓ दवा फॉर्म खोल रहा हूं। कौन सी दवा चाहिए?"
      };
      return { text: responses[effectiveLang] };
    }

    // 2. CHECK MEDICINES / TODAY'S SCHEDULE (Complete fix)
    const checkSchedulePatterns = [
      // English
      'check my medicine', 'my medicines', 'today', "what's my schedule", 'schedule today', 'schedule', 'medicines',
      // Kannada
      'ನನ್ನ ಔಷಧ', 'ಔಷಧಗಳು', 'ಇಂದು', 'ವೇಳಾಪಟ್ಟಿ', 'ಔಷಧ ತೋರಿಸು',
      // Hindi
      'मेरी दवा', 'दवाएं', 'आज', 'शेड्यूल', 'दवाएं दिखाओ'
    ];
    const isCheckSchedule = matchesAny(checkSchedulePatterns);

    if (isCheckSchedule) {
      const medicines = nammaStorage.getMedicines();
      const groceries: GroceryItem[] = JSON.parse(localStorage.getItem('namma_groceries') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const todayGroceries = groceries.filter(g => !g.completed && g.reminderDate === today);

      let response = '';
      if (effectiveLang === 'en') {
        response = `Here's your schedule for today:\n\n`;
        if (medicines.length > 0) {
          response += `💊 Medicines (${medicines.length}):\n`;
          medicines.forEach(med => {
            response += `• ${med.medicineName} - ${med.dosage} at ${med.scheduledTimes.join(', ')} ${med.takenToday ? '✓ Taken' : '⏰ Due'}\n`;
          });
        } else {
          response += `💊 No medicines scheduled.\n`;
        }
        if (todayGroceries.length > 0) {
          response += `\n🛒 Groceries due today (${todayGroceries.length}):\n`;
          todayGroceries.forEach(g => response += `• ${g.name} (${g.quantity})\n`);
        }
        if (medicines.length === 0 && todayGroceries.length === 0) {
          response = "You have no medicines or grocery reminders for today. Would you like to add something?";
        }
      } else if (effectiveLang === 'kn') {
        response = `ಇಂದಿನ ನಿಮ್ಮ ವೇಳಾಪಟ್ಟಿ:\n\n💊 ಔಷಧಗಳು (${medicines.length})\n`;
        medicines.forEach(med => {
          response += `• ${med.medicineName} - ${med.takenToday ? '✓ ತೆಗೆದುಕೊಂಡಿದೆ' : '⏰ ಬಾಕಿ'}\n`;
        });
      } else {
        response = `आज का आपका शेड्यूल:\n\n💊 दवाएं (${medicines.length})\n`;
        medicines.forEach(med => {
          response += `• ${med.medicineName} - ${med.takenToday ? '✓ ली गई' : '⏰ बाकी'}\n`;
        });
      }

      return { text: response };
    }

    // 3. CALL EMERGENCY / I NEED HELP (Complete fix)
    const emergencyPatterns = [
      // English
      'i need help', 'emergency', 'call emergency', 'sos', 'help me', 'help',
      // Kannada
      'ತುರ್ತು', 'ಸಹಾಯ', 'ಸಹಾಯ ಬೇಕು', 'ಸಹಾಯ ಮಾಡಿ',
      // Hindi
      'मदद', 'मदद चाहिए', 'आपातकाल', 'हेल्प'
    ];
    const isEmergency = matchesAny(emergencyPatterns);

    if (isEmergency) {
      const responses = {
        en: "🚨 EMERGENCY MODE ACTIVATED! I can:\n1. Open Emergency SOS page\n2. Call Karnataka Emergency (112)\n3. Call your emergency contacts\n\nShould I open the emergency page now?",
        kn: "🚨 ತುರ್ತು ಮೋಡ್ ಸಕ್ರಿಯಗೊಂಡಿದೆ! ನಾನು ತುರ್ತು ಪುಟವನ್ನು ತೆರೆಯಬೇಕೆ?",
        hi: "🚨 आपातकालीन मोड सक्रिय! मैं आपातकालीन पृष्ठ खोलूं?"
      };

      if (onNavigate) {
        setTimeout(() => onNavigate('emergency'), 1500);
        const navResponses = {
          en: "🚨 Opening Emergency SOS page now! You'll see verified Bengaluru emergency numbers and your saved contacts.",
          kn: "🚨 ತುರ್ತು SOS ಪುಟ ತೆರೆಯಲಾಗುತ್ತಿದೆ!",
          hi: "🚨 आपातकालीन SOS पृष्ठ खोल रहा हूं!"
        };
        return { text: navResponses[effectiveLang], action: { type: 'navigate', payload: 'emergency' } };
      }

      return { text: responses[effectiveLang] };
    }

    // 4. CALL SPECIFIC CONTACT
    if (lower.includes('call') && (lower.includes('emergency contact') || lower.includes('daughter') || lower.includes('son') || lower.includes('family'))) {
      const savedProfile = localStorage.getItem('namma_user_profile');
      if (savedProfile) {
        try {
          const profile: UserProfile = JSON.parse(savedProfile);
          if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
            const firstContact = profile.emergencyContacts[0];
            const responses = {
              en: `Calling your emergency contact: ${firstContact.name} (${firstContact.relationship}) at ${firstContact.mobile}`,
              kn: `ನಿಮ್ಮ ತುರ್ತು ಸಂಪರ್ಕಕ್ಕೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ: ${firstContact.name}`,
              hi: `आपके आपातकालीन संपर्क को कॉल कर रहा हूं: ${firstContact.name}`
            };

            // Trigger actual call
            setTimeout(() => {
              window.location.href = `tel:${firstContact.mobile}`;
            }, 1000);

            return { text: responses[effectiveLang], action: { type: 'call', payload: firstContact.mobile } };
          }
        } catch (e) {}
      }

      const responses = {
        en: "I couldn't find your emergency contacts. Please add them in Settings first.",
        kn: "ತುರ್ತು ಸಂಪರ್ಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಸೇರಿಸಿ.",
        hi: "आपातकालीन संपर्क नहीं मिले। कृपया सेटिंग्स में जोड़ें।"
      };
      return { text: responses[language] };
    }

    // 5. REMIND ME TO / ADD GROCERY
    if ((lower.includes('remind me to') || lower.includes('add grocery') || lower.includes('add to shopping')) && !lower.includes('medicine')) {
      const itemMatch = userMessage.match(/(?:remind me to|add grocery|add to shopping list)\s+(?:buy\s+)?(.+)/i);
      const itemName = itemMatch ? itemMatch[1].trim() : 'item';

      const groceries: GroceryItem[] = JSON.parse(localStorage.getItem('namma_groceries') || '[]');
      const newGrocery: GroceryItem = {
        id: `groc_${Date.now()}`,
        name: itemName,
        quantity: '1 unit',
        reminderDate: new Date().toISOString().split('T')[0],
        completed: false
      };
      groceries.unshift(newGrocery);
      localStorage.setItem('namma_groceries', JSON.stringify(groceries));

      const responses = {
        en: `✓ Added "${itemName}" to your shopping list! You can view it in Senior Support section.`,
        kn: `✓ "${itemName}" ನಿಮ್ಮ ಶಾಪಿಂಗ್ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!`,
        hi: `✓ "${itemName}" आपकी शॉपिंग लिस्ट में जोड़ा गया!`
      };
      return { text: responses[language] };
    }

    // ===== PHASE 2: VOICE SEARCH FEATURES =====

    // 1. FIND MEDICINE
    if (lower.includes('find medicine') || lower.includes('search medicine') || lower.includes('do i have')) {
      const medicines = nammaStorage.getMedicines();
      const searchTerm = userMessage.replace(/find medicine|search medicine|do i have/gi, '').trim();

      if (searchTerm) {
        const found = medicines.filter(m => m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()));
        if (found.length > 0) {
          const responses = {
            en: `Yes! I found ${found.length} medicine(s):\n${found.map(m => `• ${m.medicineName} - ${m.dosage} at ${m.scheduledTimes.join(', ')}`).join('\n')}`,
            kn: `ಹೌದು! ${found.length} ಔಷಧಗಳು ಕಂಡುಬಂದಿವೆ:\n${found.map(m => `• ${m.medicineName}`).join('\n')}`,
            hi: `हां! ${found.length} दवा(एं) मिली:\n${found.map(m => `• ${m.medicineName}`).join('\n')}`
          };
          return { text: responses[language] };
        } else {
          const responses = {
            en: `I couldn't find "${searchTerm}" in your medicine list. Would you like to add it?`,
            kn: `"${searchTerm}" ನಿಮ್ಮ ಔಷಧ ಪಟ್ಟಿಯಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ. ಸೇರಿಸಬೇಕೆ?`,
            hi: `"${searchTerm}" आपकी दवा सूची में नहीं मिली। जोड़ें?`
          };
          return { text: responses[language] };
        }
      }
    }

    // 2. WHEN IS MY NEXT REMINDER / UPCOMING
    if (lower.includes('next reminder') || lower.includes('upcoming') || lower.includes('when is')) {
      const groceries: GroceryItem[] = JSON.parse(localStorage.getItem('namma_groceries') || '[]');
      const upcoming = groceries.filter(g => !g.completed).sort((a, b) =>
        new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
      );

      if (upcoming.length > 0) {
        const next = upcoming[0];
        const responses = {
          en: `Your next reminder is: "${next.name}" (${next.quantity}) on ${new Date(next.reminderDate).toLocaleDateString()}. You have ${upcoming.length} total reminders pending.`,
          kn: `ನಿಮ್ಮ ಮುಂದಿನ ಜ್ಞಾಪನೆ: "${next.name}" - ${new Date(next.reminderDate).toLocaleDateString()}`,
          hi: `आपका अगला रिमाइंडर: "${next.name}" - ${new Date(next.reminderDate).toLocaleDateString()}`
        };
        return { text: responses[language] };
      } else {
        const responses = {
          en: "You have no pending grocery reminders. Would you like to add one?",
          kn: "ಯಾವುದೇ ಬಾಕಿ ಜ್ಞಾಪನೆಗಳಿಲ್ಲ. ಒಂದನ್ನು ಸೇರಿಸಬೇಕೆ?",
          hi: "कोई लंबित रिमाइंडर नहीं है। एक जोड़ें?"
        };
        return { text: responses[language] };
      }
    }

    // 3. SHOW EMERGENCY CONTACTS
    if (lower.includes('emergency contact') || lower.includes('my contacts') || lower.includes('who can i call')) {
      const savedProfile = localStorage.getItem('namma_user_profile');
      if (savedProfile) {
        try {
          const profile: UserProfile = JSON.parse(savedProfile);
          if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
            const contactList = profile.emergencyContacts.map(c =>
              `• ${c.name} (${c.relationship}): ${c.mobile}`
            ).join('\n');

            const responses = {
              en: `Your emergency contacts (${profile.emergencyContacts.length}):\n${contactList}\n\nI can call any of them for you - just say "call [name]"!`,
              kn: `ನಿಮ್ಮ ತುರ್ತು ಸಂಪರ್ಕಗಳು:\n${contactList}`,
              hi: `आपके आपातकालीन संपर्क:\n${contactList}`
            };
            return { text: responses[language] };
          }
        } catch (e) {}
      }

      const responses = {
        en: "You haven't added emergency contacts yet. Go to Settings to add them.",
        kn: "ತುರ್ತು ಸಂಪರ್ಕಗಳನ್ನು ಇನ್ನೂ ಸೇರಿಸಿಲ್ಲ. ಸೆಟ್ಟಿಂಗ್ಸ್‌ಗೆ ಹೋಗಿ.",
        hi: "आपने अभी तक आपातकालीन संपर्क नहीं जोड़े हैं। सेटिंग्स में जाएं।"
      };
      return { text: responses[language] };
    }

    // 4. WHAT DID I ADD YESTERDAY/TODAY
    if (lower.includes('what did i add') || lower.includes('history') || lower.includes('yesterday') || lower.includes('recent')) {
      const audits = nammaStorage.getAuditLogs().slice(0, 5);
      if (audits.length > 0) {
        const recentList = audits.map(a => {
          const timeAgo = Math.floor((Date.now() - a.timestamp) / 60000);
          return `• ${a.action} - ${timeAgo < 60 ? timeAgo + ' min ago' : Math.floor(timeAgo/60) + ' hours ago'}`;
        }).join('\n');

        const responses = {
          en: `Here's your recent activity:\n${recentList}`,
          kn: `ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ:\n${recentList}`,
          hi: `आपकी हाल की गतिविधि:\n${recentList}`
        };
        return { text: responses[language] };
      }
    }

    // ===== PHASE 3: EMERGENCY QUICK ACTIONS =====

    // 1. READ MY MEDICAL INFO
    if (lower.includes('read my') || lower.includes('my medical info') || lower.includes('my profile')) {
      const savedProfile = localStorage.getItem('namma_user_profile');
      if (savedProfile) {
        try {
          const profile: UserProfile = JSON.parse(savedProfile);
          const medicines = nammaStorage.getMedicines();

          const responses = {
            en: `Your Medical Profile:\n👤 Name: ${profile.name}\n📅 Age: ${profile.age} years\n📱 Mobile: ${profile.mobile}\n💊 Active Medicines: ${medicines.length}\n👨‍👩‍👧 Emergency Contacts: ${profile.emergencyContacts?.length || 0}`,
            kn: `ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಪ್ರೊಫೈಲ್:\n👤 ${profile.name}\n📅 ${profile.age} ವರ್ಷ\n💊 ${medicines.length} ಔಷಧಗಳು`,
            hi: `आपकी चिकित्सा प्रोफ़ाइल:\n👤 ${profile.name}\n📅 ${profile.age} वर्ष\n💊 ${medicines.length} दवाएं`
          };
          return { text: responses[language] };
        } catch (e) {}
      }
    }

    // 2. HOSPITAL NEARBY / NEAREST HOSPITAL
    if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('doctor nearby')) {
      const responses = {
        en: "🏥 For Bengaluru emergency medical services:\n• Karnataka Emergency (112) - Ambulance dispatch\n• BBMP Control Room (1533) - City ambulance\n• Manipal Hospital Emergency: 080-25023344\n• Apollo Hospital: 1860-500-1066\n\nShould I open the emergency directory with verified numbers?",
        kn: "🏥 ಬೆಂಗಳೂರು ತುರ್ತು ವೈದ್ಯಕೀಯ ಸೇವೆಗಳು:\n• ಕರ್ನಾಟಕ ತುರ್ತು (112)\n• BBMP (1533)",
        hi: "🏥 बेंगलुरु आपातकालीन चिकित्सा सेवाएं:\n• कर्नाटक आपातकालीन (112)\n• BBMP (1533)"
      };
      return { text: responses[language] };
    }

    // ===== EXISTING RESPONSES (Updated) =====

    const responses: any = {
      en: {
        greeting: [
          "Hello! I'm your smart AI companion. I can ADD medicines, CHECK schedules, SEARCH your data, CALL contacts, and handle EMERGENCIES. What would you like to do?",
          "Hi there! Try saying: 'Add medicine Paracetamol', 'Check my medicines', 'I need help', or 'Find medicine Aspirin'. I'm here to help!",
        ],
        thanks: [
          "You're welcome! Need anything else? I can add medicines, search data, or handle emergencies.",
          "Happy to help! Just say what you need - I'm always ready!",
        ],
        help: [
          "I can do lots of things:\n\n🎯 ACTIONS:\n• Add medicine [name]\n• Check my medicines\n• Call emergency\n• Remind me to [item]\n\n🔍 SEARCH:\n• Find medicine [name]\n• What's my next reminder?\n• Show emergency contacts\n\n🚨 EMERGENCY:\n• I need help\n• Call [contact name]\n• Read my medical info\n\nJust speak naturally - I'll understand!",
        ],
        unknown: [
          "I didn't quite catch that. Try:\n• 'Add medicine [name]'\n• 'Check my schedule'\n• 'I need help'\n• 'Find medicine [name]'\n• 'What's my next reminder?'",
        ]
      },
      kn: {
        greeting: ["ನಮಸ್ಕಾರ! ನಾನು ಔಷಧಗಳನ್ನು ಸೇರಿಸಬಲ್ಲೆ, ವೇಳಾಪಟ್ಟಿ ಪರಿಶೀಲಿಸಬಲ್ಲೆ ಮತ್ತು ತುರ್ತು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ!"],
        thanks: ["ಸ್ವಾಗತ! ಬೇರೆ ಏನಾದರೂ ಬೇಕೆ?"],
        help: ["ನಾನು ಔಷಧಗಳು, ಜ್ಞಾಪನೆಗಳು, ತುರ್ತು ಸಹಾಯದಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ!"],
        unknown: ["ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ. 'ಔಷಧ ಸೇರಿಸು', 'ನನ್ನ ವೇಳಾಪಟ್ಟಿ' ಎಂದು ಪ್ರಯತ್ನಿಸಿ."]
      },
      hi: {
        greeting: ["नमस्ते! मैं दवाएं जोड़ सकता हूं, शेड्यूल चेक कर सकता हूं और आपातकालीन मदद कर सकता हूं!"],
        thanks: ["स्वागत है! कुछ और चाहिए?"],
        help: ["मैं दवाएं, रिमाइंडर, आपातकालीन मदद में सहायता कर सकता हूं!"],
        unknown: ["कृपया फिर से बताएं। 'दवा जोड़ें', 'मेरा शेड्यूल' कोशिश करें।"]
      }
    };

    const langResponses = responses[language];

    // Greetings
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('ನಮಸ್ಕಾರ') || lower.includes('नमस्ते')) {
      return { text: langResponses.greeting[Math.floor(Math.random() * langResponses.greeting.length)] };
    }

    // Thanks
    if (lower.includes('thank') || lower.includes('thanks') || lower.includes('ಧನ್ಯವಾದ') || lower.includes('धन्यवाद')) {
      return { text: langResponses.thanks[Math.floor(Math.random() * langResponses.thanks.length)] };
    }

    // Help
    if (lower.includes('help') || lower.includes('what can') || lower.includes('features')) {
      return { text: langResponses.help[0] };
    }

    // Unknown
    return { text: langResponses.unknown[0] };
  };

  const handleSendMessage = (e: React.FormEvent | null, voiceText?: string) => {
    if (e) e.preventDefault();

    const messageText = voiceText || inputText;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: messageText,
      sender: 'user',
      timestamp: Date.now()
    };

    // Update context
    const newContext = [...conversationContext, messageText.toLowerCase()];
    setConversationContext(newContext.slice(-5));

    const aiResult = getAIResponse(messageText, lang, newContext);
    const assistantResponse: Message = {
      id: `msg_${Date.now() + 1}`,
      text: aiResult.text,
      sender: 'assistant',
      timestamp: Date.now() + 100,
      action: aiResult.action
    };

    setMessages(prev => [...prev, userMessage, assistantResponse]);
    setInputText('');

    // OPTIMIZED: Instant voice response, no delay
    speakText(aiResult.text, lang);
  };

  const handleClearConversation = () => {
    setMessages([]);
    setConversationContext([]);
    const freshGreeting = lang === 'en'
      ? "Conversation cleared! I can help you add medicines, check schedules, search data, or handle emergencies. What do you need?"
      : lang === 'kn'
      ? 'ಸಂಭಾಷಣೆ ಅಳಿಸಲಾಗಿದೆ! ನಾನು ಏನು ಸಹಾಯ ಮಾಡಬಹುದು?'
      : 'बातचीत साफ़ हो गई! मैं क्या मदद कर सकता हूं?';
    speakText(freshGreeting, lang);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    const langNames = { en: 'English', kn: 'Kannada', hi: 'Hindi' };
    const changeMsg = {
      en: `Switched to ${langNames[newLang]}. Try: "Add medicine Aspirin" or "Check my schedule"`,
      kn: `${langNames[newLang]} ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. "ಔಷಧ ಸೇರಿಸು" ಪ್ರಯತ್ನಿಸಿ`,
      hi: `${langNames[newLang]} में बदल गया। "दवा जोड़ें" प्रयास करें`
    };
    setTimeout(() => speakText(changeMsg[newLang], newLang), 100);
  };

  // Add Medicine Modal Handler
  const handleAddMedicineFromModal = (medicineName: string, dosage: string) => {
    const medicines = nammaStorage.getMedicines();
    const newMed: MedicineReminder = {
      id: `med_${Date.now()}`,
      medicineName: medicineName.trim(),
      dosage: dosage.trim() || 'As directed',
      scheduledTimes: ['09:00'],
      frequency: 'daily',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      takenToday: false
    };
    const updated = [newMed, ...medicines];
    nammaStorage.saveMedicines(updated);
    nammaStorage.addAudit('medicine', 'Medicine Added via Voice', `Added ${medicineName} using voice assistant`);

    setShowAddMedicineModal(false);
    setPrefilledMedicineName('');

    const confirmMsg = {
      en: `✓ Successfully added ${medicineName} to your medicine reminders!`,
      kn: `✓ ${medicineName} ಔಷಧ ಜ್ಞಾಪನೆಗೆ ಸೇರಿಸಲಾಗಿದೆ!`,
      hi: `✓ ${medicineName} दवा रिमाइंडर में जोड़ा गया!`
    };

    const confirmMessage: Message = {
      id: `msg_${Date.now()}`,
      text: confirmMsg[lang],
      sender: 'assistant',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, confirmMessage]);
    speakText(confirmMsg[lang], lang);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-teal-800">🎙️ AI Action Assistant</h2>
                <p className="text-xs text-teal-600 mt-1">🎯 Smart Actions • 🔍 Voice Search • 🚨 Emergency Ready</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Close assistant"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${lang === 'en' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('kn')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${lang === 'kn' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${lang === 'hi' ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <div className="text-6xl mb-4 animate-pulse">🤖</div>
                <p className="text-lg mb-2 font-semibold">
                  {lang === 'en' ? 'AI Action Assistant' : lang === 'kn' ? 'AI ಆಕ್ಷನ್ ಅಸಿಸ್ಟೆಂಟ್' : 'AI एक्शन असिस्टेंट'}
                </p>
                <div className="text-sm space-y-1">
                  {lang === 'en' && (
                    <>
                      <p className="font-semibold text-teal-700">Try these commands:</p>
                      <p>• "Add medicine Paracetamol"</p>
                      <p>• "Check my medicines"</p>
                      <p>• "I need help"</p>
                      <p>• "Find medicine Aspirin"</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gradient-to-br from-purple-50 to-blue-50 text-stone-900 border border-purple-200'
                      }`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🤖</span>
                          <span className="text-xs font-bold text-purple-700">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      {msg.sender === 'assistant' && (
                        <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
                          <span>🔊</span>
                          <span>Voice enabled</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-stone-200 bg-gradient-to-r from-teal-50 to-blue-50">
            {!voiceSupported && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
                {translations.voiceNotSupported[lang]}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              {voiceSupported && (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-3 rounded-xl font-semibold transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                  aria-label={isListening ? translations.listening[lang] : 'Voice input'}
                  title={isListening ? 'Listening...' : 'Tap to speak'}
                >
                  {isListening ? '🔴' : '🎤'}
                </button>
              )}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={translations.typeMessage[lang]}
                className="flex-1 p-3 rounded-xl border border-stone-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {translations.send[lang]}
              </button>
            </form>

            {messages.length > 0 && (
              <button
                onClick={handleClearConversation}
                className="mt-3 text-sm text-stone-600 hover:text-stone-900 underline"
              >
                {translations.clear[lang]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900">🎙️ Voice Command: Add Medicine</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const medicineName = formData.get('medicine_name') as string;
              const dosage = formData.get('dosage') as string;
              if (medicineName.trim()) {
                handleAddMedicineFromModal(medicineName, dosage);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Medicine Name</label>
                <input
                  type="text"
                  name="medicine_name"
                  defaultValue={prefilledMedicineName}
                  placeholder="e.g. Paracetamol"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Dosage Instructions</label>
                <input
                  type="text"
                  name="dosage"
                  placeholder="e.g. 500mg - 1 Tablet after food"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMedicineModal(false);
                    setPrefilledMedicineName('');
                  }}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700"
                >
                  ✓ Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
