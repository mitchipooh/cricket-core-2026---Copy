
import React, { useState, useMemo } from 'react';
import { Organization, MatchFixture, UserProfile, Team, Player, Tournament, TournamentFormat, PlayerWithContext, Group, MediaPost } from '../types.ts';
import { generateRoundRobin } from '../utils/cricket-engine.ts';
import { GlobalDashboard } from './GlobalDashboard.tsx';
import { OrganizationView } from './OrganizationView.tsx';
import { MediaCenter } from './MediaCenter.tsx';
import { TournamentDashboard } from './TournamentDashboard.tsx';
import { DeleteOrgModal } from './DeleteOrgModal.tsx';

interface AdminProps {
  organizations: Organization[];
  standaloneMatches: MatchFixture[];
  userRole: UserProfile['role'];
  onStartMatch: (match: MatchFixture) => void;
  onRequestSetup: () => void;
  onUpdateOrgs: (orgs: Organization[]) => void;
  onCreateOrg: (orgData: Partial<Organization>) => void;
  onAddTeam: (orgId: string, teamData: Omit<Team, 'id'>) => void;
  onRemoveTeam: (orgId: string, teamId: string) => void;
  onBulkAddPlayers: (teamId: string, newPlayers: Player[]) => void;
  onAddGroup: (orgId: string, groupName: string) => void;
  onUpdateGroupTeams: (orgId: string, groupId: string, teamIds: string[]) => void;
  onAddTournament: (orgId: string, tournament: Tournament) => void;
  mediaPosts: MediaPost[];
  onAddMediaPost: (post: MediaPost) => void;
}

type ViewScope = 'GLOBAL' | 'ORG_LEVEL' | 'TOURNAMENT_LEVEL' | 'MEDIA_CENTER';

export const AdminCenter: React.FC<AdminProps> = ({ 
  organizations, 
  standaloneMatches,
  userRole, 
  onStartMatch, 
  onRequestSetup, 
  onUpdateOrgs, 
  onCreateOrg, 
  onAddTeam, 
  onRemoveTeam,
  onBulkAddPlayers,
  onAddGroup,
  onUpdateGroupTeams,
  onAddTournament,
  mediaPosts,
  onAddMediaPost
}) => {
  // --- CORE NAVIGATION STATE ---
  const [viewScope, setViewScope] = useState<ViewScope>('GLOBAL');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  // --- MODAL STATE ---
  const [modals, setModals] = useState({ createOrg: false, deleteOrg: false, addTeam: false, addTournament: false });
  const [pendingOrg, setPendingOrg] = useState<Organization | null>(null);
  
  // --- FORM STATE ---
  const [orgForm, setOrgForm] = useState({ name: '', country: '' });
  const [teamForm, setTeamForm] = useState({ name: '', location: '' });
  const [trnForm, setTrnForm] = useState<{name: string, format: TournamentFormat}>({ name: '', format: 'T20' });

  // --- DERIVED DATA ---
  const activeOrg = useMemo(() => organizations.find(o => o.id === selectedOrgId), [organizations, selectedOrgId]);
  const activeTrn = useMemo(() => activeOrg?.tournaments.find(t => t.id === selectedTournamentId), [activeOrg, selectedTournamentId]);
  
  const allTeams = useMemo(() => {
    return organizations.flatMap(org => org.memberTeams);
  }, [organizations]);

  const globalPlayers = useMemo((): PlayerWithContext[] => {
    return organizations.flatMap(org => 
      org.memberTeams.flatMap(t => 
        t.players.map(p => ({ ...p, teamName: t.name, teamId: t.id, orgId: org.id, orgName: org.name }))
      )
    );
  }, [organizations]);

  const globalFixtures = useMemo((): MatchFixture[] => {
    // Combine Organization Fixtures and Standalone Matches
    const allFixtures = [
      ...organizations.flatMap(org => org.fixtures),
      ...standaloneMatches
    ];

    // Sort: Live -> Scheduled (Ascending Date) -> Completed (Descending Date)
    return allFixtures.sort((a, b) => {
      const statusWeight = { 'Live': 0, 'Scheduled': 1, 'Completed': 2 };
      const statusDiff = (statusWeight[a.status] || 1) - (statusWeight[b.status] || 1);
      
      if (statusDiff !== 0) return statusDiff;

      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (a.status === 'Completed') {
        return dateB - dateA; // Most recent completed first
      }
      return dateA - dateB; // Nearest upcoming first
    });
  }, [organizations, standaloneMatches]);

  const topBatsmen = useMemo(() => [...globalPlayers].sort((a,b) => b.stats.runs - a.stats.runs).slice(0, 5), [globalPlayers]);
  const topBowlers = useMemo(() => [...globalPlayers].sort((a,b) => b.stats.wickets - a.stats.wickets).slice(0, 5), [globalPlayers]);

  const currentOrgPlayers = useMemo((): PlayerWithContext[] => {
    if (!activeOrg) return [];
    return activeOrg.memberTeams.flatMap(t => 
      t.players.map(p => ({ ...p, teamName: t.name, teamId: t.id, orgId: activeOrg.id, orgName: activeOrg.name }))
    );
  }, [activeOrg]);

  // --- BUSINESS LOGIC HANDLERS ---
  const handleDeleteConfirm = () => {
    if (pendingOrg) {
      onUpdateOrgs(organizations.filter(o => o.id !== pendingOrg.id));
      setModals({ ...modals, deleteOrg: false });
      setPendingOrg(null);
      if (selectedOrgId === pendingOrg.id) setSelectedOrgId(null);
    }
  };

  const handleCreateOrg = () => { 
    if(orgForm.name) { 
      onCreateOrg(orgForm); 
      setModals({ ...modals, createOrg: false }); 
      setOrgForm({name:'', country:''});
    } 
  };

  const handleAddTeam = () => {
    if(selectedOrgId && teamForm.name) {
      onAddTeam(selectedOrgId, {...teamForm, players: []});
      setModals({...modals, addTeam: false});
      setTeamForm({name:'', location:''});
    }
  };

  const handleCreateTournament = () => { 
    if(selectedOrgId) { 
      onAddTournament(selectedOrgId, { 
        id: `trn-${Date.now()}`, name: trnForm.name, format: trnForm.format, overs: 20, groups: [], 
        pointsConfig: {win:2,loss:0,tie:1,noResult:1}, status:'Upcoming' 
      }); 
      setModals({ ...modals, addTournament: false }); 
      setTrnForm({name:'', format:'T20'});
    } 
  };

  // Specialized handlers for Tournaments to ensure deep updates work
  const handleTournamentAddGroup = (tournamentId: string, groupName: string) => {
    if (!activeOrg) return;
    const newGroup: Group = { id: `grp-${Date.now()}`, name: groupName, teams: [] };
    
    onUpdateOrgs(organizations.map(org => {
      if (org.id === activeOrg.id) {
        return {
          ...org,
          tournaments: org.tournaments.map(t => t.id === tournamentId ? { ...t, groups: [...t.groups, newGroup] } : t)
        };
      }
      return org;
    }));
  };

  const handleTournamentUpdateTeams = (tournamentId: string, groupId: string, teamIds: string[]) => {
    if (!activeOrg) return;
    
    onUpdateOrgs(organizations.map(org => {
      if (org.id === activeOrg.id) {
        // Find the actual Team objects from the Organization's pool
        const teamsToAdd = org.memberTeams.filter(t => teamIds.includes(t.id));
        return {
          ...org,
          tournaments: org.tournaments.map(t => {
            if (t.id === tournamentId) {
              return {
                ...t,
                groups: t.groups.map(g => g.id === groupId ? { ...g, teams: teamsToAdd } : g)
              };
            }
            return t;
          })
        };
      }
      return org;
    }));
  };

  const handleGenerateFixtures = () => {
    if(!activeOrg || !activeTrn) return;
    const newFix = activeTrn.groups.flatMap(g => generateRoundRobin(g.teams, activeTrn.id, g.id));
    onUpdateOrgs(organizations.map(o => o.id === activeOrg.id ? { ...o, fixtures: [...o.fixtures, ...newFix] } : o));
  };

  // --- VIEW ROUTER ---
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-screen">
      
      {viewScope === 'GLOBAL' && (
        <GlobalDashboard 
          organizations={organizations} userRole={userRole} 
          onSelectOrg={(id) => { setSelectedOrgId(id); setViewScope('ORG_LEVEL'); }} 
          onRequestDeleteOrg={(org) => { setPendingOrg(org); setModals({...modals, deleteOrg: true}); }} 
          onRequestCreateOrg={() => setModals({...modals, createOrg: true})} 
          onRequestQuickMatch={onRequestSetup}
          onOpenMediaStudio={() => setViewScope('MEDIA_CENTER')}
          fixtures={globalFixtures} topBatsmen={topBatsmen} topBowlers={topBowlers}
          onStartMatch={onStartMatch}
        />
      )}

      {viewScope === 'MEDIA_CENTER' && (
        <MediaCenter 
          onBack={() => setViewScope('GLOBAL')} 
          fixtures={globalFixtures} 
          teams={allTeams}
          mediaPosts={mediaPosts}
          onAddMediaPost={onAddMediaPost}
        />
      )}

      {viewScope === 'ORG_LEVEL' && activeOrg && (
        <OrganizationView 
          organization={activeOrg} userRole={userRole} 
          onBack={() => setViewScope('GLOBAL')} 
          onViewTournament={(id) => { setSelectedTournamentId(id); setViewScope('TOURNAMENT_LEVEL'); }}
          onViewPlayer={() => {}} // Could trigger a modal
          onRequestAddTeam={() => setModals({...modals, addTeam: true})}
          onRequestAddTournament={() => setModals({...modals, addTournament: true})}
          players={currentOrgPlayers}
        />
      )}

      {viewScope === 'TOURNAMENT_LEVEL' && activeTrn && activeOrg && (
        <TournamentDashboard 
          tournament={activeTrn} organization={activeOrg} 
          onBack={() => setViewScope('ORG_LEVEL')} 
          onStartMatch={onStartMatch} 
          onGenerateFixtures={handleGenerateFixtures}
          onAddGroup={handleTournamentAddGroup}
          onUpdateGroupTeams={handleTournamentUpdateTeams}
        />
      )}

      {/* --- MODAL LAYER --- */}

      {modals.deleteOrg && pendingOrg && (
        <DeleteOrgModal organization={pendingOrg} onConfirm={handleDeleteConfirm} onCancel={() => setModals({...modals, deleteOrg: false})} />
      )}

      {modals.createOrg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
             <h3 className="text-2xl font-black text-slate-900 mb-8">Register Organization</h3>
             <input value={orgForm.name} onChange={e => setOrgForm({...orgForm, name: e.target.value})} placeholder="Legal Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold outline-none mb-4" />
             <input value={orgForm.country} onChange={e => setOrgForm({...orgForm, country: e.target.value})} placeholder="Primary Country" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold outline-none mb-8" />
             <div className="flex gap-4"><button onClick={() => setModals({...modals, createOrg: false})} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs">Cancel</button><button onClick={handleCreateOrg} className="flex-1 py-4 bg-slate-900 text-white font-black uppercase text-xs rounded-xl shadow-xl">Create</button></div>
          </div>
        </div>
      )}

      {modals.addTeam && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
             <h3 className="text-2xl font-black text-slate-900 mb-8">New Squad</h3>
             <input value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} placeholder="Squad Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold outline-none mb-4" />
             <input value={teamForm.location} onChange={e => setTeamForm({...teamForm, location: e.target.value})} placeholder="Home Ground" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold outline-none mb-8" />
             <div className="flex gap-4"><button onClick={() => setModals({...modals, addTeam: false})} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs">Cancel</button><button onClick={handleAddTeam} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-xl shadow-xl">Confirm</button></div>
          </div>
        </div>
      )}

      {modals.addTournament && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
             <h3 className="text-2xl font-black text-slate-900 mb-8">New League</h3>
             <input value={trnForm.name} onChange={e => setTrnForm({...trnForm, name: e.target.value})} placeholder="Season Name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold outline-none mb-4" />
             <select value={trnForm.format} onChange={e => setTrnForm({...trnForm, format: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold outline-none mb-8">
                <option value="T20">Twenty20</option>
                <option value="T10">T10 Series</option>
                <option value="50-over">One Day Series</option>
                <option value="Test">Multi-day Series</option>
             </select>
             <div className="flex gap-4"><button onClick={() => setModals({...modals, addTournament: false})} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs">Cancel</button><button onClick={handleCreateTournament} className="flex-1 py-4 bg-slate-900 text-white font-black uppercase text-xs rounded-xl shadow-xl">Deploy</button></div>
          </div>
        </div>
      )}

    </div>
  );
};
