
import React, { useState } from 'react';
import { Organization, UserProfile, PlayerWithContext } from '../types.ts';
import { Can } from './Can.tsx';

interface OrganizationViewProps {
  organization: Organization;
  userRole: UserProfile['role'];
  onBack: () => void;
  onViewTournament: (id: string) => void;
  onViewPlayer: (player: PlayerWithContext) => void;
  onRequestAddTeam: () => void;
  onRequestAddTournament: () => void;
  players: PlayerWithContext[];
}

type OrgTab = 'SQUADS' | 'PLAYERS' | 'TOURNAMENTS';

export const OrganizationView: React.FC<OrganizationViewProps> = ({ 
  organization, userRole, onBack, onViewTournament, onViewPlayer, 
  onRequestAddTeam, onRequestAddTournament, players 
}) => {
  const [activeTab, setActiveTab] = useState<OrgTab>('SQUADS');
  const [playerSearch, setPlayerSearch] = useState('');

  return (
    <div className="animate-in slide-in-from-right-8 duration-500">
      <div className="flex items-center gap-6 mb-10">
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-black transition-all shadow-sm">←</button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{organization.name}</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Management View • {organization.memberTeams.length} Squads</p>
        </div>
      </div>

      <div className="bg-white p-1 rounded-2xl inline-flex gap-1 mb-10 border border-slate-200 shadow-sm">
        {(['SQUADS', 'PLAYERS', 'TOURNAMENTS'] as OrgTab[]).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {activeTab === 'SQUADS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Can role={userRole} perform="team:add">
            <button onClick={onRequestAddTeam} className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 hover:bg-white hover:border-indigo-400 hover:shadow-lg transition-all text-slate-400 hover:text-indigo-600 gap-4 min-h-[200px] bg-slate-50/50">
              <span className="text-5xl font-thin">+</span>
              <span className="text-xs font-black uppercase tracking-widest">Register Team</span>
            </button>
          </Can>
          {organization.memberTeams.map(team => (
            <div key={team.id} className="bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all">
              <h3 className="text-2xl font-black text-slate-900">{team.name}</h3>
              <p className="text-xs text-indigo-500 font-bold uppercase mt-1 tracking-wider">📍 {team.location || 'Home Ground'}</p>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{team.players.length} Roster</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'PLAYERS' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <input 
              value={playerSearch} 
              onChange={e => setPlayerSearch(e.target.value)} 
              placeholder="Search organizational roster..." 
              className="w-full bg-slate-50 border-none outline-none p-4 rounded-xl font-bold text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {players.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase())).map(p => (
              <div key={p.id} onClick={() => onViewPlayer(p)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:border-indigo-400 transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">👤</div>
                <div>
                  <div className="font-black text-slate-900 text-sm">{p.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{p.teamName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'TOURNAMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {organization.tournaments.map(trn => (
            <div 
              key={trn.id} 
              onClick={() => onViewTournament(trn.id)} 
              className="bg-slate-900 p-10 rounded-[2.5rem] relative overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all group"
            >
              <div className="relative z-10">
                <div className="inline-block bg-white/10 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-4">{trn.format} Series</div>
                <h3 className="text-4xl font-black text-white mb-8 tracking-tight">{trn.name}</h3>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Enter Dashboard →</div>
              </div>
              <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 text-white rotate-12">🏆</div>
            </div>
          ))}
          <Can role={userRole} perform="tournament:add">
            <button onClick={onRequestAddTournament} className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all min-h-[250px]">
               <span className="text-4xl mb-4">+</span>
               <span className="text-xs font-black uppercase tracking-widest">Launch New Season</span>
            </button>
          </Can>
        </div>
      )}
    </div>
  );
};
