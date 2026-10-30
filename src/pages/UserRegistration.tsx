import React, { useState } from 'react';

type UserType = 'senior' | 'disabled' | 'parent' | null;

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

interface UserRegistrationProps {
  onComplete: (profile: UserProfile) => void;
}

export function UserRegistration({ onComplete }: UserRegistrationProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [mobile, setMobile] = useState('');
  const [userType, setUserType] = useState<UserType>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactMobile, setNewContactMobile] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit Indian mobile number';
    }
    if (!userType) newErrors.userType = 'Please select your category';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleAddContact = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newContactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!newContactRelation.trim()) newErrors.contactRelation = 'Relationship is required';
    if (!newContactMobile.trim()) {
      newErrors.contactMobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(newContactMobile)) {
      newErrors.contactMobile = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newContact: EmergencyContact = {
        id: `contact_${Date.now()}`,
        name: newContactName.trim(),
        relationship: newContactRelation.trim(),
        mobile: newContactMobile.trim()
      };
      setEmergencyContacts([...emergencyContacts, newContact]);
      setNewContactName('');
      setNewContactRelation('');
      setNewContactMobile('');
      setErrors({});
    }
  };

  const handleRemoveContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const handleComplete = () => {
    if (emergencyContacts.length === 0) {
      setErrors({ contacts: 'Please add at least one emergency contact' });
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      age: age.trim(),
      mobile: mobile.trim(),
      userType,
      emergencyContacts
    };

    onComplete(profile);
  };

  const handleSkipContacts = () => {
    const profile: UserProfile = {
      name: name.trim(),
      age: age.trim(),
      mobile: mobile.trim(),
      userType,
      emergencyContacts: []
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-teal-800 mb-2">Welcome to Namma Access</h1>
          <p className="text-stone-600">Let's set up your profile for personalized support</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step === 1 ? 'bg-teal-600 text-white' : 'bg-teal-200 text-teal-800'}`}>
            1
          </div>
          <div className={`h-1 w-16 ${step === 2 ? 'bg-teal-600' : 'bg-stone-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step === 2 ? 'bg-teal-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
            2
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-stone-800 mb-4">📝 Basic Information</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-stone-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-lg`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className={`w-full px-4 py-3 rounded-xl border ${errors.age ? 'border-red-500' : 'border-stone-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-lg`}
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`w-full px-4 py-3 rounded-xl border ${errors.mobile ? 'border-red-500' : 'border-stone-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-lg`}
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                I am a <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('senior')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'senior'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-stone-200 hover:border-teal-300'
                  }`}
                >
                  <div className="text-3xl mb-2">👵</div>
                  <div className="font-semibold text-stone-800">Senior Citizen</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('disabled')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'disabled'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-stone-200 hover:border-teal-300'
                  }`}
                >
                  <div className="text-3xl mb-2">♿</div>
                  <div className="font-semibold text-stone-800">Person with Disability</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('parent')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'parent'
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-stone-200 hover:border-teal-300'
                  }`}
                >
                  <div className="text-3xl mb-2">👨‍👩‍👧</div>
                  <div className="font-semibold text-stone-800">Parent/Caregiver</div>
                </button>
              </div>
              {errors.userType && <p className="text-red-500 text-sm mt-2">{errors.userType}</p>}
            </div>

            {/* Next Button */}
            <button
              onClick={handleStep1Next}
              className="w-full py-4 bg-teal-600 text-white font-bold text-lg rounded-xl hover:bg-teal-700 transition-colors shadow-lg"
            >
              Next: Add Emergency Contacts →
            </button>
          </div>
        )}

        {/* Step 2: Emergency Contacts */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-stone-800 mb-2">🚨 Emergency Contacts</h2>
              <p className="text-sm text-stone-600">Add family members or caregivers who should be auto-dialed during SOS</p>
            </div>

            {/* Add Contact Form */}
            <div className="bg-stone-50 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-stone-800">Add Emergency Contact</h3>

              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Contact Name (e.g., Daughter, Son, Caretaker)"
                className={`w-full px-4 py-3 rounded-lg border ${errors.contactName ? 'border-red-500' : 'border-stone-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none`}
              />
              {errors.contactName && <p className="text-red-500 text-sm">{errors.contactName}</p>}

              <input
                type="text"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                placeholder="Relationship (e.g., Daughter, Son, Neighbor)"
                className={`w-full px-4 py-3 rounded-lg border ${errors.contactRelation ? 'border-red-500' : 'border-stone-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none`}
              />
              {errors.contactRelation && <p className="text-red-500 text-sm">{errors.contactRelation}</p>}

              <input
                type="tel"
                value={newContactMobile}
                onChange={(e) => setNewContactMobile(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                className={`w-full px-4 py-3 rounded-lg border ${errors.contactMobile ? 'border-red-500' : 'border-stone-300'} focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none`}
              />
              {errors.contactMobile && <p className="text-red-500 text-sm">{errors.contactMobile}</p>}

              <button
                onClick={handleAddContact}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
              >
                ➕ Add Contact
              </button>
            </div>

            {/* Emergency Contacts List */}
            {emergencyContacts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-stone-800">Added Emergency Contacts ({emergencyContacts.length})</h3>
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <div>
                      <div className="font-semibold text-stone-800">{contact.name}</div>
                      <div className="text-sm text-stone-600">{contact.relationship} • {contact.mobile}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      aria-label="Remove contact"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.contacts && <p className="text-red-500 text-sm">{errors.contacts}</p>}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-300 transition-colors"
              >
                ← Back
              </button>
              {emergencyContacts.length > 0 ? (
                <button
                  onClick={handleComplete}
                  className="flex-1 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg"
                >
                  Complete Setup ✓
                </button>
              ) : (
                <button
                  onClick={handleSkipContacts}
                  className="flex-1 py-4 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                >
                  Skip for Now →
                </button>
              )}
            </div>

            {emergencyContacts.length === 0 && (
              <p className="text-center text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                ⚠️ You can add emergency contacts later in Settings, but we recommend adding at least one now for safety.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
