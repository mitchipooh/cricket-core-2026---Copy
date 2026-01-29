
import React from 'react';
import { Organization, UserProfile } from '../types.ts';
import { Can } from './Can.tsx';

interface OrgCardProps {
  org: Organization;
  userRole: UserProfile['role'];
  onOpen: (id: string) => void;
  onDeleteRequest: (org: Organization) => void;
}

export const OrgCard: React.FC<OrgCardProps> = ({ org, userRole, onOpen, onDeleteRequest }) => {
  return (
    <div 
      onClick={() => onOpen(org.id)} 
      className="group bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl font-black text-black group-hover:opacity-[0.06] transition-opacity select-none">
        {org.name.charAt(0)}
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">
            🏟️
          </div>
          <Can role={userRole} perform="org:delete">
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteRequest(org); }}
              className="text-slate-300 hover:text-red-500 p-2 transition-colors"
            >
              ✕
            </button>
          </Can>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{org.name}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{org.country || 'Global Entity'}</p>
        <div className="flex gap-6 border-t border-slate-100 pt-6">
          <div>
            <div className="text-2xl font-black text-slate-900">{org.memberTeams.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Squads</div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{org.tournaments.length}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Seasons</div>
          </div>
        </div>
      </div>
    </div>
  );
};
