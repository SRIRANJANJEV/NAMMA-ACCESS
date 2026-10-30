import React, { useState } from 'react';
import { nammaStorage } from '@/services/nammaStorage';
import { ParentingActivity } from '@/types';

interface ParentingSupportProps {
  onNavigate: (page: string) => void;
}

export function ParentingSupport({ onNavigate }: ParentingSupportProps) {
  const [activities, setActivities] = useState<ParentingActivity[]>(nammaStorage.getParentingActivities());
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [childName, setChildName] = useState('Aarav');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [category, setCategory] = useState<ParentingActivity['category']>('routine');

  const handleToggleComplete = (id: string) => {
    const updated = activities.map(a => {
      if (a.id === id) {
        return { ...a, completed: !a.completed, completedAt: !a.completed ? Date.now() : undefined };
      }
      return a;
    });
    setActivities(updated);
    nammaStorage.saveParentingActivities(updated);
    nammaStorage.addAudit('parenting', 'Parenting Activity Toggled', `Updated activity status for ${id}`);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const newAct: ParentingActivity = {
      id: `p_${Date.now()}`,
      childName,
      title,
      category,
      scheduledTime,
      scheduledDate: new Date().toISOString().split('T')[0],
      completed: false
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    nammaStorage.saveParentingActivities(updated);
    setTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <button onClick={() => onNavigate('home')} className="text-teal-600 text-sm font-semibold hover:underline mb-1 block">
            &larr; Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900">Parenting Support & Family Reminders</h1>
          <p className="text-stone-600 text-sm mt-1">Manage child routines, healthcare appointments, and family coordination safely.</p>
        </div>
        <button
          onClick={() => onNavigate('emergency')}
          className="px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          🚨 Emergency SOS
        </button>
      </div>

      {/* Activities List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Today's Schedule & Reminders</h2>
            <p className="text-stone-500 text-sm">Authorized caregiver view for family activities.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700"
          >
            + Add Reminder
          </button>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={act.completed}
                  onChange={() => handleToggleComplete(act.id)}
                  className="w-5 h-5 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-bold uppercase">
                      {act.category}
                    </span>
                    <span className="text-xs text-stone-500">Child: {act.childName}</span>
                  </div>
                  <h3 className={`font-bold text-stone-900 mt-1 ${act.completed ? 'line-through text-stone-400' : ''}`}>
                    {act.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Scheduled at {act.scheduledTime}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${act.completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {act.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900">Add Family / Child Reminder</h3>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Child Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Activity Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pediatric Vaccination / School Pickup"
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ParentingActivity['category'])}
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  <option value="medicine">Medicine Reminder</option>
                  <option value="appointment">Healthcare Appointment</option>
                  <option value="school">School Activity</option>
                  <option value="routine">Daily Routine</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase mb-1">Scheduled Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
