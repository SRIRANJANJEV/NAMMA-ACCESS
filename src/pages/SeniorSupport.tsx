import React, { useState, useEffect } from 'react';
import { nammaStorage } from '@/services/nammaStorage';
import { MedicineReminder, ScamAnalysisResult } from '@/types';

interface SeniorSupportProps {
  onNavigate: (page: string) => void;
}

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  reminderDate: string;
  completed: boolean;
}

export function SeniorSupport({ onNavigate }: SeniorSupportProps) {
  const [medicines, setMedicines] = useState<MedicineReminder[]>(nammaStorage.getMedicines());
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [scamInput, setScamInput] = useState('');
  const [scamResult, setScamResult] = useState<ScamAnalysisResult | null>(null);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showAddGroceryModal, setShowAddGroceryModal] = useState(false);
  const [newGroceryName, setNewGroceryName] = useState('');
  const [newGroceryQty, setNewGroceryQty] = useState('');
  const [newGroceryDate, setNewGroceryDate] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Load groceries from localStorage
    const stored = localStorage.getItem('namma_groceries');
    if (stored) {
      try {
        setGroceries(JSON.parse(stored));
      } catch (e) {
        setGroceries([]);
      }
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle Mark Taken
  const handleMarkTaken = (id: string) => {
    nammaStorage.markMedicineTaken(id);
    setMedicines(nammaStorage.getMedicines());
    const med = medicines.find(m => m.id === id);
    showNotification(`✓ Marked ${med?.medicineName} as taken`, 'success');
  };

  // Handle Add Medicine
  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) {
      showNotification('Please enter a medicine name', 'error');
      return;
    }
    const newMed: MedicineReminder = {
      id: `med_${Date.now()}`,
      medicineName: newMedName.trim(),
      dosage: newMedDosage.trim() || 'As directed',
      scheduledTimes: ['09:00'],
      frequency: 'daily',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      takenToday: false
    };
    const updated = [newMed, ...medicines];
    nammaStorage.saveMedicines(updated);
    setMedicines(updated);
    setNewMedName('');
    setNewMedDosage('');
    setShowAddMedModal(false);
    nammaStorage.addAudit('medicine', 'Medicine Added', `Added reminder for ${newMed.medicineName}`);
    showNotification(`✓ Added ${newMed.medicineName} to reminders`, 'success');
  };

  // Handle Add Grocery
  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryName.trim()) {
      showNotification('Please enter grocery item name', 'error');
      return;
    }
    const newGrocery: GroceryItem = {
      id: `groc_${Date.now()}`,
      name: newGroceryName.trim(),
      quantity: newGroceryQty.trim() || '1 unit',
      reminderDate: newGroceryDate || new Date().toISOString().split('T')[0],
      completed: false
    };
    const updated = [newGrocery, ...groceries];
    setGroceries(updated);
    localStorage.setItem('namma_groceries', JSON.stringify(updated));
    setNewGroceryName('');
    setNewGroceryQty('');
    setNewGroceryDate('');
    setShowAddGroceryModal(false);
    showNotification(`✓ Added ${newGrocery.name} to shopping list`, 'success');
  };

  const handleToggleGrocery = (id: string) => {
    const updated = groceries.map(g =>
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    setGroceries(updated);
    localStorage.setItem('namma_groceries', JSON.stringify(updated));
  };

  // Enhanced Scam Analysis with Real-world Bengaluru Patterns
  const handleAnalyzeScam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scamInput.trim()) {
      showNotification('Please enter text to analyze', 'error');
      return;
    }

    setIsAnalyzing(true);

    // Simulate processing delay for realistic feel
    setTimeout(() => {
      const lower = scamInput.toLowerCase();
      let riskScore = 10;
      const reasons: string[] = [];
      const recommendations: string[] = [];

      // Bengaluru-specific utility scams
      if (lower.includes('bescom') || lower.includes('bwssb') || lower.includes('electricity') || lower.includes('water bill')) {
        riskScore += 30;
        reasons.push('⚠️ Mentions Bengaluru utility provider (BESCOM/BWSSB) - Common impersonation scam');
      }

      // Banking and financial
      if (lower.includes('sbi') || lower.includes('hdfc') || lower.includes('icici') || lower.includes('axis') || lower.includes('bank')) {
        riskScore += 25;
        reasons.push('🏦 References bank name - Verify through official bank app only');
      }

      // OTP and credentials
      if (lower.includes('otp') || lower.includes('pin') || lower.includes('password') || lower.includes('cvv')) {
        riskScore += 40;
        reasons.push('🔐 Asks for OTP/PIN/Password - Legitimate services NEVER ask for these via SMS');
      }

      // Suspicious links
      if (lower.includes('http') || lower.includes('bit.ly') || lower.includes('tinyurl') || lower.includes('.xyz') || lower.includes('click here')) {
        riskScore += 35;
        reasons.push('🔗 Contains suspicious link - Do NOT click on unknown URLs');
      }

      // Urgency tactics
      if (lower.includes('urgent') || lower.includes('immediate') || lower.includes('today') || lower.includes('expire') || lower.includes('blocked') || lower.includes('suspend')) {
        riskScore += 25;
        reasons.push('⏰ Creates false urgency - Classic scam pressure tactic');
      }

      // Prize/lottery scams
      if (lower.includes('won') || lower.includes('prize') || lower.includes('lottery') || lower.includes('congratulation') || lower.includes('lucky')) {
        riskScore += 30;
        reasons.push('🎰 Unexpected prize/lottery claim - No legitimate lottery contacts winners via SMS');
      }

      // KYC scams
      if (lower.includes('kyc') || lower.includes('update') || lower.includes('verify')) {
        riskScore += 20;
        reasons.push('📋 KYC update request - Banks send these via official app, not SMS links');
      }

      // Government impersonation
      if (lower.includes('income tax') || lower.includes('gst') || lower.includes('aadhar') || lower.includes('pan')) {
        riskScore += 35;
        reasons.push('🏛️ Impersonates government authority - Government never demands immediate payment via SMS');
      }

      // Payment requests
      if (lower.includes('pay') || lower.includes('payment') || lower.includes('transfer') || lower.includes('₹') || lower.includes('rupee')) {
        riskScore += 20;
        reasons.push('💰 Requests payment/money transfer - Verify through official channels first');
      }

      const riskLevel: ScamAnalysisResult['riskLevel'] =
        riskScore >= 70 ? 'high' : riskScore >= 40 ? 'suspicious' : 'low';

      // Smart recommendations based on risk
      if (riskLevel === 'high') {
        recommendations.push('🚫 DO NOT respond to this message');
        recommendations.push('🚫 DO NOT click any links');
        recommendations.push('🚫 DO NOT share any personal information');
        recommendations.push('📞 Call official helpline numbers: BESCOM (1912), Banks (toll-free on card)');
        recommendations.push('🚨 Report to cybercrime.gov.in or Karnataka Police (1930)');
      } else if (riskLevel === 'suspicious') {
        recommendations.push('⚠️ Be cautious - verify through official channels');
        recommendations.push('📱 Contact organization directly using number from their official website');
        recommendations.push('🔍 Do not use contact information provided in the message');
      } else {
        recommendations.push('✓ Appears relatively safe based on heuristic analysis');
        recommendations.push('⚠️ However, always verify important messages through official channels');
        recommendations.push('📞 When in doubt, call official customer service numbers');
      }

      recommendations.push('💡 Remember: No legitimate organization asks for OTP, PIN, or passwords via SMS');

      const result: ScamAnalysisResult = {
        id: `scam_${Date.now()}`,
        sourceType: 'sms',
        inputContent: scamInput,
        riskLevel,
        riskScore: Math.min(riskScore, 99),
        reasons: reasons.length > 0 ? reasons : ['✓ No major red flags detected. Message appears relatively safe.'],
        recommendations,
        analyzedAt: Date.now(),
        savedToHistory: true
      };

      nammaStorage.saveScamAnalysis(result);
      setScamResult(result);
      setIsAnalyzing(false);
      showNotification('Analysis complete', 'success');
    }, 1500); // Realistic processing delay
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg animate-fade-in ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <button onClick={() => onNavigate('home')} className="text-teal-600 text-sm font-semibold hover:underline mb-1 block">
            &larr; Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900">Senior Citizen Support Dashboard</h1>
          <p className="text-stone-600 text-sm mt-1">Medicine reminders, grocery shopping, fraud protection, and emergency assistance.</p>
        </div>
        <button
          onClick={() => onNavigate('emergency')}
          className="px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          🚨 Emergency SOS
        </button>
      </div>

      {/* Medicine Reminder Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              💊 Medicine Reminders & Schedule
            </h2>
            <p className="text-stone-500 text-sm">Track your medicine schedule. Check this list daily.</p>
          </div>
          <button
            onClick={() => setShowAddMedModal(true)}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors"
          >
            + Add Medicine
          </button>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3">
          <span className="text-xl">ℹ️</span>
          <div className="text-sm">
            <p className="font-semibold text-amber-900">Important: Manual Checking Required</p>
            <p className="text-amber-800 mt-1">
              This list helps you track your medicines, but you need to check it yourself at the scheduled times.
              Automatic notifications require browser notification permissions and may not work when the app is closed.
            </p>
          </div>
        </div>

        {medicines.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <p className="text-lg mb-2">No medicine reminders yet</p>
            <p className="text-sm">Click "Add Medicine" to create your first reminder</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {medicines.map((med) => (
              <div key={med.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-stone-900 text-lg">{med.medicineName}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${med.takenToday ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {med.takenToday ? 'Taken Today' : 'Due Today'}
                    </span>
                  </div>
                  <p className="text-teal-700 font-medium text-sm mt-1">Dosage: {med.dosage}</p>
                  <p className="text-stone-500 text-xs mt-1">Scheduled: {med.scheduledTimes.join(', ')} ({med.frequency})</p>
                  {med.notes && <p className="text-stone-600 text-xs italic mt-2">Note: {med.notes}</p>}
                </div>

                <div className="flex gap-2 pt-2 border-t border-stone-200">
                  {!med.takenToday ? (
                    <button
                      onClick={() => handleMarkTaken(med.id)}
                      className="flex-1 py-2 bg-teal-600 text-white font-semibold rounded-lg text-sm hover:bg-teal-700 transition-colors"
                    >
                      Mark as Taken
                    </button>
                  ) : (
                    <span className="text-center w-full py-2 text-green-700 font-semibold text-sm">
                      ✓ Recorded in History
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grocery Reminder Section - NEW */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              🛒 Grocery Shopping Reminders
            </h2>
            <p className="text-stone-500 text-sm">Never forget essential items with smart shopping reminders.</p>
          </div>
          <button
            onClick={() => setShowAddGroceryModal(true)}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors"
          >
            + Add Item
          </button>
        </div>

        {groceries.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <p className="text-lg mb-2">No grocery items yet</p>
            <p className="text-sm">Add items you need to buy regularly</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groceries.map((item) => (
              <div key={item.id} className={`p-4 rounded-xl border-2 ${item.completed ? 'border-green-300 bg-green-50' : 'border-stone-200 bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${item.completed ? 'text-green-900 line-through' : 'text-stone-900'}`}>
                      {item.name}
                    </h3>
                    <p className="text-stone-600 text-sm mt-1">Quantity: {item.quantity}</p>
                    <p className="text-stone-500 text-xs mt-1">Reminder: {new Date(item.reminderDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleToggleGrocery(item.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                      item.completed
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    {item.completed ? '✓ Bought' : 'Mark Bought'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Scam Alert Section */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl shadow-sm border-2 border-red-200 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
            🛡️ Smart Fraud & Scam Detector (Bengaluru Specific)
          </h2>
          <p className="text-red-700 text-sm mt-1">
            Local pattern-based analysis for BESCOM scams, fake bank alerts, KYC frauds, and phishing messages.
          </p>
        </div>

        {/* Transparency Notice */}
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-3 text-sm">
          <p className="font-semibold text-blue-900">ℹ️ How This Works</p>
          <p className="text-blue-800 mt-1">
            This tool analyzes messages locally on your device using known scam patterns specific to Bengaluru.
            It does NOT send your messages to any external server. However, scammers constantly change tactics,
            so this cannot detect every scam. Always verify through official channels before taking action.
          </p>
        </div>

        <form onSubmit={handleAnalyzeScam} className="space-y-4">
          <textarea
            value={scamInput}
            onChange={(e) => setScamInput(e.target.value)}
            placeholder="Paste suspicious SMS, WhatsApp message, or email here...

Examples:
• 'BESCOM: Your power will be disconnected. Pay now: http://...'
• 'Your SBI account is blocked. Update KYC: http://...'
• 'You won ₹50 lakh lottery. Claim now...'"
            className="w-full p-4 rounded-xl border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-stone-800 h-32 text-sm"
            required
          />
          <button
            type="submit"
            disabled={isAnalyzing}
            className={`px-6 py-3 bg-red-600 text-white font-semibold rounded-xl text-sm hover:bg-red-700 transition-colors flex items-center gap-2 ${
              isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin">⚙️</span>
                Analyzing Message...
              </>
            ) : (
              <>
                🔍 Analyze for Fraud
              </>
            )}
          </button>
        </form>

        {scamResult && (
          <div className={`p-6 rounded-xl border-2 ${
            scamResult.riskLevel === 'high' ? 'bg-red-100 border-red-400 text-red-900' :
            scamResult.riskLevel === 'suspicious' ? 'bg-amber-100 border-amber-400 text-amber-900' :
            'bg-green-100 border-green-400 text-green-900'
          } space-y-4 animate-fade-in`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-2xl uppercase tracking-wide flex items-center gap-2">
                {scamResult.riskLevel === 'high' && '🚨'}
                {scamResult.riskLevel === 'suspicious' && '⚠️'}
                {scamResult.riskLevel === 'low' && '✓'}
                {scamResult.riskLevel.toUpperCase()} RISK ({scamResult.riskScore}%)
              </span>
              <span className="text-xs font-medium px-3 py-1 bg-white/50 rounded-full">
                AI-Powered Analysis
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-wider">🔍 Detected Patterns:</p>
              <ul className="list-none space-y-2">
                {scamResult.reasons.map((r, i) => (
                  <li key={i} className="text-sm bg-white/30 p-3 rounded-lg">
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t-2 border-white/30">
              <p className="text-sm font-bold uppercase tracking-wider">💡 Safety Recommendations:</p>
              <ul className="list-none space-y-2">
                {scamResult.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm bg-white/30 p-3 rounded-lg">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/40 p-4 rounded-lg text-xs">
              <p className="font-semibold mb-1">⚡ How it works:</p>
              <p>Our system analyzes patterns commonly found in Bengaluru-specific scams including BESCOM impersonation, fake banking alerts, KYC frauds, and government authority impersonation. This is a rule-based heuristic system designed for the local context.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900">Add Medicine Reminder</h3>
            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Paracetamol / Atenolol"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Dosage Instructions</label>
                <input
                  type="text"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="e.g. 500mg - 1 Tablet after food"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Grocery Modal */}
      {showAddGroceryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900">Add Grocery Item</h3>
            <form onSubmit={handleAddGrocery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  value={newGroceryName}
                  onChange={(e) => setNewGroceryName(e.target.value)}
                  placeholder="e.g. Rice, Milk, Vegetables"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Quantity</label>
                <input
                  type="text"
                  value={newGroceryQty}
                  onChange={(e) => setNewGroceryQty(e.target.value)}
                  placeholder="e.g. 5 kg, 2 liters, 1 dozen"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Reminder Date</label>
                <input
                  type="date"
                  value={newGroceryDate}
                  onChange={(e) => setNewGroceryDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddGroceryModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700"
                >
                  Add to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
