
import React from 'react';
import { Organization, UserProfile, MatchFixture, PlayerWithContext } from '../types.ts';
import { OrgCard } from './OrgCard.tsx';
import { Can } from './Can.tsx';

interface GlobalDashboardProps {
  organizations: Organization[];
  userRole: UserProfile['role'];
  onSelectOrg: (id: string) => void;
  onRequestDeleteOrg: (org: Organization) => void;
  onRequestCreateOrg: () => void;
  onRequestQuickMatch: () => void;
  onOpenMediaStudio: () => void;
  fixtures: MatchFixture[];
  topBatsmen: PlayerWithContext[];
  topBowlers: PlayerWithContext[];
  onStartMatch: (match: MatchFixture) => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ 
  organizations, userRole, onSelectOrg, onRequestDeleteOrg, onRequestCreateOrg, 
  onRequestQuickMatch, onOpenMediaStudio, fixtures, topBatsmen, topBowlers, onStartMatch 
}) => {
  const activeFixtures = fixtures.filter(f => f.status !== 'Completed' || f.id.includes('live')); // Show Live and Scheduled
  // Fallback to recent fixtures if no upcoming
  const displayFixtures = activeFixtures.length > 0 ? activeFixtures.slice(0, 3) : fixtures.slice(0, 3);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Command Center</h1>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] mt-2">Global Operations</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button onClick={onRequestQuickMatch} className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-400 hover:scale-105 transition-all flex items-center gap-2">
            <span>⚡</span> Quick Match
          </button>
          <button onClick={onOpenMediaStudio} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-pink-200 hover:shadow-pink-300 hover:scale-105 transition-all flex items-center gap-2">
            <span>🔴</span> Media Studio
          </button>
          <Can role={userRole} perform="org:create">
            <button onClick={onRequestCreateOrg} className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-xl">+ New Org</button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Active Entities</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizations.map(org => (
              <OrgCard 
                key={org.id} 
                org={org} 
                userRole={userRole} 
                onOpen={onSelectOrg} 
                onDeleteRequest={onRequestDeleteOrg} 
              />
            ))}
            <Can role={userRole} perform="org:create">
              <button onClick={onRequestCreateOrg} className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 hover:bg-slate-50 hover:border-indigo-300 transition-all text-slate-400 hover:text-indigo-600 gap-4 group min-h-[250px]">
                <span className="text-5xl font-thin group-hover:scale-110 transition-transform">+</span>
                <span className="text-xs font-black uppercase tracking-widest">Register New Org</span>
              </button>
            </Can>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xl shadow-slate-100">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Matches</h3>
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="space-y-3">
                 {displayFixtures.length === 0 ? <div className="text-center py-8 text-slate-400 text-xs italic">No matches scheduled</div> : displayFixtures.map(f => (
                    <div key={f.id} className={`p-4 rounded-2xl border ${f.status === 'Live' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                       <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          <span className={f.status === 'Live' ? 'text-red-500 animate-pulse' : ''}>{f.status === 'Live' ? '● LIVE NOW' : f.date}</span>
                          <span className={f.status === 'Live' ? 'text-slate-500' : 'text-indigo-500'}>{f.venue}</span>
                       </div>
                       <div className="flex justify-between items-center px-2">
                          <span className={`font-black text-xs ${f.status === 'Live' ? 'text-white' : 'text-slate-800'}`}>{f.teamAName}</span>
                          <span className="text-[10px] font-bold text-slate-300">VS</span>
                          <span className={`font-black text-xs ${f.status === 'Live' ? 'text-white' : 'text-slate-800'}`}>{f.teamBName}</span>
                       </div>
                       {f.status === 'Live' && (
                          <div className="mt-2 text-center text-white font-black text-sm tracking-tight bg-white/10 rounded py-1">
                             {f.teamAScore || '0/0'} - {f.teamBScore || '0/0'}
                          </div>
                       )}
                       <button onClick={() => onStartMatch(f)} className={`w-full mt-3 py-2 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${f.status === 'Live' ? 'bg-red-600 border-red-600 text-white hover:bg-red-500' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white'}`}>
                          {f.status === 'Live' ? 'Open Console' : 'Match Center'}
                       </button>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xl shadow-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Global Leaders</h3>
              <div className="space-y-6">
                <div>
                   <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Orange Cap</div>
                   {topBatsmen.slice(0,3).map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center text-xs mb-2">
                         <span className="font-bold text-slate-700">{p.name}</span>
                         <span className="font-black text-slate-900">{p.stats.runs}</span>
                      </div>
                   ))}
                </div>
                <div>
                   <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-3">Purple Cap</div>
                   {topBowlers.slice(0,3).map((p, i) => (
                      <div key={p.id} className="flex justify-between items-center text-xs mb-2">
                         <span className="font-bold text-slate-700">{p.name}</span>
                         <span className="font-black text-slate-900">{p.stats.wickets}</span>
                      </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
