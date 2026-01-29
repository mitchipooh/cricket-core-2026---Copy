
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Scorer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !handle) return;

    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      role,
      createdAt: Date.now(),
    };
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 overflow-hidden relative">
      {/* Background blobs for aesthetics */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full bg-slate-800 rounded-[32px] p-10 border border-slate-700 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-indigo-600/40 mb-6">🏏</div>
          <h1 className="text-3xl font-black text-white text-center">Cricket-Core 2026</h1>
          <p className="text-slate-400 text-center mt-2">Initialize your professional scoring profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Richard Kettleborough"
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">System Handle</label>
            <input 
              type="text" 
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. scorer_prime"
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Primary Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
            >
              <option value="Administrator">Administrator</option>
              <option value="Scorer">Scorer</option>
              <option value="Match Official">Match Official</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 uppercase tracking-widest mt-4"
          >
            Create Profile & Enter
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-500 mt-8 font-medium">
          YOUR DATA IS STORED LOCALLY ON THIS DEVICE FOR ZERO-LATENCY ACCESS.
        </p>
      </div>
    </div>
  );
};
