import React from 'react';

type UserType = 'senior' | 'disabled' | 'parent' | null;
type LockedSection = 'senior-support' | 'disability-support' | 'parenting-support' | null;

interface WelcomeHomeProps {
  onNavigate: (page: string) => void;
  userType: UserType;
  onLockSection: (section: LockedSection) => void;
}

export function WelcomeHome({ onNavigate, userType, onLockSection }: WelcomeHomeProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header / Branding */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-teal-800 tracking-tight">Namma Access</h1>
        <p className="text-lg text-stone-600 font-medium">Inclusive Bengaluru</p>
        <p className="text-sm text-stone-500 max-w-xl mx-auto">
          Accessible digital services for senior citizens, people with disabilities, and families in Bengaluru.
        </p>
      </div>

      {/* Main Feature Entry Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Senior Citizen Support */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👵
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Senior Citizen Support</h2>
              <p className="text-stone-500 text-sm mt-1">
                Medicine reminders, fraud scam alerts, simplified voice controls, and emergency support.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => onNavigate('senior-support')}
              className="flex-1 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              Open
            </button>
            <button
              onClick={() => onLockSection('senior-support')}
              className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-semibold rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
              title="Lock to this section for focused voice navigation"
            >
              🔒 Lock
            </button>
          </div>
        </div>

        {/* Disability Support */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ♿
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Disability Support</h2>
              <p className="text-stone-500 text-sm mt-1">
                Vision & hearing modes, accessible barrier reporting for Bengaluru, and assistive voice controls.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => onNavigate('disability-support')}
              className="flex-1 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              Open
            </button>
            <button
              onClick={() => onLockSection('disability-support')}
              className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-semibold rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
              title="Lock to this section for focused voice navigation"
            >
              🔒 Lock
            </button>
          </div>
        </div>

        {/* Parenting Support */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👨‍👩‍👧
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">Parenting Support</h2>
              <p className="text-stone-500 text-sm mt-1">
                Child schedules, routines, healthcare appointments, and authorized caregiver coordination.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => onNavigate('parenting-support')}
              className="flex-1 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              Open
            </button>
            <button
              onClick={() => onLockSection('parenting-support')}
              className="px-4 py-2 bg-amber-100 text-amber-800 text-sm font-semibold rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
              title="Lock to this section for focused voice navigation"
            >
              🔒 Lock
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Quick Action */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl animate-pulse">
            🚨
          </div>
          <div>
            <h3 className="font-bold text-red-900 text-lg">Emergency SOS & Bengaluru Directory</h3>
            <p className="text-red-700 text-sm">
              Quick 2-step activation, official verified numbers (112, 1090), and caregiver contacts.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('emergency')}
          className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow hover:bg-red-700 transition-colors shrink-0"
        >
          Emergency SOS
        </button>
      </div>

      {/* Footer Navigation Links */}
      <div className="flex justify-center gap-6 text-sm font-medium text-stone-600">
        <button onClick={() => onNavigate('audit')} className="hover:text-teal-600">
          Personal History & Exports
        </button>
      </div>
    </div>
  );
}
