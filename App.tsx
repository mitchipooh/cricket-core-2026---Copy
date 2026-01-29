
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout.tsx';
import { Scorer } from './components/Scorer.tsx';
import { AdminCenter } from './components/AdminCenter.tsx';
import { MatchSetup } from './components/MatchSetup.tsx';
import { StatsAnalytics } from './components/StatsAnalytics.tsx';
import { ProfileSetup } from './components/ProfileSetup.tsx';
import { Organization, Team, MatchFixture, UserProfile, Player, MatchState, Group, Tournament, MediaPost } from './types.ts';

// Mock Data Generator for Development
const createMockPlayer = (name: string, role: Player['role']): Player => ({
  id: `p-${Math.random().toString(36).substr(2, 9)}`,
  name,
  role,
  stats: {
    runs: Math.floor(Math.random() * 1000),
    wickets: Math.floor(Math.random() * 50),
    ballsFaced: Math.floor(Math.random() * 800),
    ballsBowled: Math.floor(Math.random() * 1200),
    runsConceded: Math.floor(Math.random() * 1500),
    matches: Math.floor(Math.random() * 30),
    catches: Math.floor(Math.random() * 15),
    runOuts: Math.floor(Math.random() * 5),
    stumpings: Math.floor(Math.random() * 3),
    highestScore: Math.floor(Math.random() * 150),
    bestBowling: `${Math.floor(Math.random() * 7)}/${Math.floor(Math.random() * 30)}`
  }
});

const MOCK_TEAMS_A: Team[] = [
  { 
    id: 'tm-lions', 
    name: 'Lions XI', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/805/805403.png',
    location: 'Mumbai', 
    management: 'Ravi Shastri', 
    players: [
      createMockPlayer('Rohit Sharma', 'Batsman'),
      createMockPlayer('Yashasvi Jaiswal', 'Batsman'),
      createMockPlayer('Virat Kohli', 'Batsman'),
      createMockPlayer('Suryakumar Yadav', 'Batsman'),
      createMockPlayer('Rishabh Pant', 'Wicket-keeper'),
      createMockPlayer('Hardik Pandya', 'All-rounder'),
      createMockPlayer('Ravindra Jadeja', 'All-rounder'),
      createMockPlayer('Ravichandran Ashwin', 'Bowler'),
      createMockPlayer('Jasprit Bumrah', 'Bowler'),
      createMockPlayer('Mohammed Shami', 'Bowler'),
      createMockPlayer('Mohammed Siraj', 'Bowler'),
      createMockPlayer('Shubman Gill', 'Batsman'),
      createMockPlayer('Kuldeep Yadav', 'Bowler')
    ] 
  },
  { 
    id: 'tm-tigers', 
    name: 'Tigers Utd', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/743/743952.png',
    location: 'Dhaka', 
    management: 'Chandika H', 
    players: [
      createMockPlayer('Fakhar Zaman', 'Batsman'),
      createMockPlayer('Litton Das', 'Wicket-keeper'),
      createMockPlayer('Babar Azam', 'Batsman'),
      createMockPlayer('Shakib Al Hasan', 'All-rounder'),
      createMockPlayer('Mushfiqur Rahim', 'Batsman'),
      createMockPlayer('Iftikhar Ahmed', 'All-rounder'),
      createMockPlayer('Shadab Khan', 'All-rounder'),
      createMockPlayer('Mehidy Hasan Miraz', 'All-rounder'),
      createMockPlayer('Shaheen Afridi', 'Bowler'),
      createMockPlayer('Haris Rauf', 'Bowler'),
      createMockPlayer('Mustafizur Rahman', 'Bowler'),
      createMockPlayer('Naseem Shah', 'Bowler')
    ] 
  }
];

const MOCK_TEAMS_B: Team[] = [
  { 
    id: 'tm-eagles', 
    name: 'Eagles Cricket', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2822/2822557.png',
    location: 'London', 
    management: 'Brendon McCullum', 
    players: [
      createMockPlayer('David Warner', 'Batsman'),
      createMockPlayer('Travis Head', 'Batsman'),
      createMockPlayer('Joe Root', 'Batsman'),
      createMockPlayer('Steve Smith', 'Batsman'),
      createMockPlayer('Ben Stokes', 'All-rounder'),
      createMockPlayer('Jos Buttler', 'Wicket-keeper'),
      createMockPlayer('Glenn Maxwell', 'All-rounder'),
      createMockPlayer('Pat Cummins', 'Bowler'),
      createMockPlayer('Mitchell Starc', 'Bowler'),
      createMockPlayer('Jofra Archer', 'Bowler'),
      createMockPlayer('Adam Zampa', 'Bowler'),
      createMockPlayer('Mark Wood', 'Bowler')
    ] 
  },
  { 
    id: 'tm-falcons', 
    name: 'Falcons SC', 
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3094/3094894.png',
    location: 'Auckland', 
    management: 'Gary Stead', 
    players: [
      createMockPlayer('Devon Conway', 'Batsman'),
      createMockPlayer('Quinton de Kock', 'Wicket-keeper'),
      createMockPlayer('Kane Williamson', 'Batsman'),
      createMockPlayer('Aiden Markram', 'Batsman'),
      createMockPlayer('Heinrich Klaasen', 'Batsman'),
      createMockPlayer('Daryl Mitchell', 'All-rounder'),
      createMockPlayer('Marco Jansen', 'All-rounder'),
      createMockPlayer('Mitchell Santner', 'All-rounder'),
      createMockPlayer('Kagiso Rabada', 'Bowler'),
      createMockPlayer('Trent Boult', 'Bowler'),
      createMockPlayer('Tabraiz Shamsi', 'Bowler'),
      createMockPlayer('Tim Southee', 'Bowler')
    ] 
  }
];

const DEFAULT_ORGS: Organization[] = [
  {
    id: 'org-1',
    name: 'World Cricket League 2026',
    description: 'The premier global destination for elite club cricket, featuring top talent from around the world in a multi-stage league format.',
    country: 'United Kingdom',
    establishedYear: 2022,
    groundLocation: 'London Stadium',
    address: 'Queen Elizabeth Olympic Park, London E20 2ST',
    memberTeams: MOCK_TEAMS_A,
    tournaments: [],
    groups: [],
    fixtures: []
  },
  {
    id: 'org-2',
    name: 'Regional Zonal Series',
    description: 'Focusing on grassroots and regional excellence, this series brings together local clubs for competitive seasonal tournaments.',
    country: 'Australia',
    establishedYear: 2018,
    groundLocation: 'Melbourne Cricket Ground',
    address: 'Brunton Ave, Richmond VIC 3002',
    memberTeams: MOCK_TEAMS_B,
    tournaments: [],
    groups: [],
    fixtures: []
  }
];

const MOCK_MEDIA_POSTS: MediaPost[] = [
  {
    id: 'post-1',
    type: 'VIDEO',
    authorName: 'Official Highlights',
    authorAvatar: '',
    contentUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', 
    caption: 'WHAT A CATCH! The diving effort at point changes the momentum of the game entirely. 🦅🏏',
    timestamp: Date.now() - 1000 * 60 * 15,
    likes: 1240,
    shares: 45,
    comments: [
      { id: 'c1', author: 'fan_123', text: 'Unbelievable athleticism!', timestamp: Date.now() - 1000 * 60 * 10 }
    ],
  },
  {
    id: 'post-2',
    type: 'IMAGE',
    authorName: 'Lions XI Media',
    authorAvatar: 'https://cdn-icons-png.flaticon.com/512/805/805403.png',
    contentUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000&auto=format&fit=crop',
    caption: 'Squad warming up for the big final. The atmosphere is electric here at the Oval! 🔥',
    timestamp: Date.now() - 1000 * 60 * 60,
    likes: 856,
    shares: 120,
    comments: []
  },
  {
    id: 'post-3',
    type: 'LIVE_STATUS',
    authorName: 'Match Centre',
    caption: 'INNINGS BREAK: Tigers Utd have set a target of 185. Lions XI need 9.25 RPO to win. Stay tuned for the chase!',
    timestamp: Date.now() - 1000 * 60 * 5,
    likes: 342,
    shares: 89,
    comments: [],
  }
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'admin-dev',
  name: 'Richard Kettleborough',
  handle: '@kettle_official',
  role: 'Administrator',
  createdAt: Date.now()
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cc_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });

  const [orgs, setOrgs] = useState<Organization[]>(() => {
    try {
      const saved = localStorage.getItem('cc_orgs');
      if (!saved) return DEFAULT_ORGS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ORGS;
    } catch { return DEFAULT_ORGS; }
  });

  const [standaloneMatches, setStandaloneMatches] = useState<MatchFixture[]>(() => {
    try {
      const saved = localStorage.getItem('cc_standalone_matches');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [mediaPosts, setMediaPosts] = useState<MediaPost[]>(() => {
    try {
      const saved = localStorage.getItem('cc_media_posts');
      return saved ? JSON.parse(saved) : MOCK_MEDIA_POSTS;
    } catch { return MOCK_MEDIA_POSTS; }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cc_theme') as 'dark' | 'light') || 'light';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'setup' | 'scorer' | 'stats'>('home');
  const [activeMatch, setActiveMatch] = useState<MatchFixture | null>(null);

  useEffect(() => {
    if (profile) localStorage.setItem('cc_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cc_orgs', JSON.stringify(orgs));
  }, [orgs]);

  useEffect(() => {
    localStorage.setItem('cc_standalone_matches', JSON.stringify(standaloneMatches));
  }, [standaloneMatches]);

  useEffect(() => {
    localStorage.setItem('cc_media_posts', JSON.stringify(mediaPosts));
  }, [mediaPosts]);

  useEffect(() => {
    localStorage.setItem('cc_theme', theme);
    if (theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }, [theme]);

  const allTeams = useMemo(() => {
    const teamsMap = new Map<string, Team>();
    orgs.forEach(org => org.memberTeams.forEach(team => teamsMap.set(team.id, team)));
    return Array.from(teamsMap.values());
  }, [orgs]);

  // Transitions
  const handleRequestSetup = () => {
    setActiveTab('setup');
  };

  const handleSetupComplete = (newMatch: MatchFixture) => {
    setStandaloneMatches(prev => [newMatch, ...prev]);
    setActiveMatch(newMatch);
    setActiveTab('scorer');
  };

  const handleStartMatch = (match: MatchFixture) => {
    setActiveMatch(match);
    setActiveTab('scorer');
  };

  const handleScorerComplete = () => {
    setActiveMatch(null);
    setActiveTab('home');
  };

  const handleScorerNewMatch = () => {
    setActiveMatch(null);
    setActiveTab('setup');
  };

  const handleTeamUpdate = (teamId: string, newPlayer: Player) => {
    setOrgs(prev => prev.map(org => ({
      ...org,
      memberTeams: org.memberTeams.map(t => {
        if (t.id === teamId) {
          return { ...t, players: [...t.players, newPlayer] };
        }
        return t;
      })
    })));
  };

  const handleBulkAddPlayers = (teamId: string, newPlayers: Player[]) => {
    setOrgs(prev => prev.map(org => ({
      ...org,
      memberTeams: org.memberTeams.map(t => {
        if (t.id === teamId) {
          return { ...t, players: [...t.players, ...newPlayers] };
        }
        return t;
      })
    })));
  };

  const handleCreateOrg = (orgData: Partial<Organization>) => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: orgData.name || 'Untitled Organization',
      description: orgData.description || 'Professional cricket organization.',
      address: orgData.address || '',
      country: orgData.country || '',
      groundLocation: orgData.groundLocation || '',
      establishedYear: orgData.establishedYear || new Date().getFullYear(),
      logoUrl: '',
      tournaments: [],
      groups: [],
      memberTeams: [],
      fixtures: []
    };
    setOrgs(prev => [...prev, newOrg]);
  };

  const handleAddTeam = (orgId: string, teamData: Omit<Team, 'id'>) => {
    // GENERATE 15 PLACEHOLDER PLAYERS
    const placeholderPlayers: Player[] = Array.from({ length: 15 }, (_, i) => {
      const num = i + 1;
      let role: Player['role'] = 'Batsman';
      
      // Distribute roles for a balanced squad
      if (i === 0) role = 'Wicket-keeper';
      else if (i >= 1 && i <= 5) role = 'Batsman';
      else if (i >= 6 && i <= 9) role = 'All-rounder';
      else role = 'Bowler';

      return {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${teamData.name} Player ${num}`,
        role: role,
        stats: {
          runs: 0,
          wickets: 0,
          ballsFaced: 0,
          ballsBowled: 0,
          runsConceded: 0,
          matches: 0,
          catches: 0,
          runOuts: 0,
          stumpings: 0
        }
      };
    });

    const newTeam: Team = {
      ...teamData,
      id: `tm-${Date.now()}`,
      logoUrl: `https://ui-avatars.com/api/?name=${teamData.name}&background=random&color=fff&size=128`,
      players: placeholderPlayers
    };

    setOrgs(prev => prev.map(org => {
      if (org.id === orgId) {
        return { ...org, memberTeams: [...org.memberTeams, newTeam] };
      }
      return org;
    }));
  };
  
  const handleRemoveTeam = (orgId: string, teamId: string) => {
    setOrgs(prev => prev.map(org => {
      if (org.id === orgId) {
        return {
          ...org,
          memberTeams: org.memberTeams.filter(t => t.id !== teamId)
        };
      }
      return org;
    }));
  };

  const handleAddGroup = (orgId: string, groupName: string) => {
    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      name: groupName,
      teams: []
    };
    setOrgs(prev => prev.map(org => {
      if (org.id === orgId) {
        return { ...org, groups: [...(org.groups || []), newGroup] };
      }
      return org;
    }));
  };

  const handleAddTournament = (orgId: string, tournament: Tournament) => {
    setOrgs(prev => prev.map(org => {
      if (org.id === orgId) {
        return { ...org, tournaments: [...org.tournaments, tournament] };
      }
      return org;
    }));
  };

  const handleUpdateGroupTeams = (orgId: string, groupId: string, teamIds: string[]) => {
    setOrgs(prev => prev.map(org => {
      if (org.id === orgId) {
        const teamsToAdd = org.memberTeams.filter(t => teamIds.includes(t.id));
        return {
          ...org,
          groups: org.groups.map(g => {
            if (g.id === groupId) {
              return { ...g, teams: teamsToAdd };
            }
            return g;
          })
        };
      }
      return org;
    }));
  };

  const handleUpdateMatchState = (matchId: string, newState: MatchState, finalStatus?: MatchFixture['status']) => {
    const teamAScore = newState.inningsScores.find(i => i.teamId === activeMatch?.teamAId)?.score || (newState.innings === 1 && newState.battingTeamId === activeMatch?.teamAId ? newState.score : '0');
    const teamAWickets = newState.inningsScores.find(i => i.teamId === activeMatch?.teamAId)?.wickets || (newState.innings === 1 && newState.battingTeamId === activeMatch?.teamAId ? newState.wickets : '0');
    const teamBScore = newState.inningsScores.find(i => i.teamId === activeMatch?.teamBId)?.score || (newState.innings === 2 && newState.battingTeamId === activeMatch?.teamBId ? newState.score : '0');
    const teamBWickets = newState.inningsScores.find(i => i.teamId === activeMatch?.teamBId)?.wickets || (newState.innings === 2 && newState.battingTeamId === activeMatch?.teamBId ? newState.wickets : '0');

    // Update global stores
    setStandaloneMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return { 
          ...m, 
          savedState: newState, 
          status: finalStatus || (newState.isCompleted ? 'Completed' : 'Live'),
          teamAScore: `${teamAScore}/${teamAWickets}`,
          teamBScore: `${teamBScore}/${teamBWickets}`
        };
      }
      return m;
    }));

    setOrgs(prev => prev.map(org => ({
      ...org,
      fixtures: org.fixtures.map(f => {
        if (f.id === matchId) {
          return { 
            ...f, 
            savedState: newState, 
            status: finalStatus || (newState.isCompleted ? 'Completed' : 'Live'),
            teamAScore: `${teamAScore}/${teamAWickets}`,
            teamBScore: `${teamBScore}/${teamBWickets}`
          };
        }
        return f;
      })
    })));

    // CRITICAL: Update active match state so toggling tabs resumes correct state
    if (activeMatch && activeMatch.id === matchId) {
       setActiveMatch(prev => prev ? ({
          ...prev,
          savedState: newState,
          status: finalStatus || (newState.isCompleted ? 'Completed' : 'Live'),
          teamAScore: `${teamAScore}/${teamAWickets}`,
          teamBScore: `${teamBScore}/${teamBWickets}`
       }) : null);
    }
  };

  const handleCreateTeamFromSetup = (teamName: string) => {
    // Add the team to the first organization available or alert if none
    if (orgs.length > 0) {
      handleAddTeam(orgs[0].id, { name: teamName, players: [] });
    } else {
      alert("No organization found to host this new team. Please create an organization in the Admin Center first.");
    }
  };

  const handleAddMediaPost = (post: MediaPost) => {
    setMediaPosts(prev => [post, ...prev]);
  };

  if (!profile) return <ProfileSetup onComplete={setProfile} />;

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} profile={profile} theme={theme} onThemeToggle={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      <div id="csp-view-container" className="h-full">
        {activeTab === 'home' && (
          <AdminCenter 
            organizations={orgs} 
            standaloneMatches={standaloneMatches} 
            userRole={profile.role} 
            onStartMatch={handleStartMatch} 
            onRequestSetup={handleRequestSetup}
            onUpdateOrgs={setOrgs} 
            onCreateOrg={handleCreateOrg}
            onAddTeam={handleAddTeam}
            onRemoveTeam={handleRemoveTeam}
            onBulkAddPlayers={handleBulkAddPlayers}
            onAddGroup={handleAddGroup}
            onUpdateGroupTeams={handleUpdateGroupTeams}
            onAddTournament={handleAddTournament}
            mediaPosts={mediaPosts}
            onAddMediaPost={handleAddMediaPost}
          />
        )}
        {activeTab === 'setup' && (
          <MatchSetup 
             teams={allTeams} 
             onMatchReady={handleSetupComplete} 
             onCancel={() => setActiveTab('home')} 
             onTeamUpdate={handleTeamUpdate}
             onCreateTeam={handleCreateTeamFromSetup}
          />
        )}
        {activeTab === 'scorer' && (
          activeMatch ? (
            <Scorer 
              match={activeMatch} 
              teams={allTeams} 
              userRole={profile.role} 
              organizations={orgs} 
              onUpdateOrgs={setOrgs} 
              onUpdateMatchState={handleUpdateMatchState} 
              onComplete={handleScorerComplete} 
              onRequestNewMatch={handleScorerNewMatch}
              onAddMediaPost={handleAddMediaPost}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in zoom-in-95 pb-20">
               <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-4xl mb-4 shadow-sm">🏏</div>
               <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Ready to Score?</h2>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest max-w-md mx-auto">Start a standalone game or select an existing fixture from the command center.</p>
               </div>
               <button onClick={() => setActiveTab('setup')} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-500 hover:scale-105 transition-all">Start Quick Match</button>
            </div>
          )
        )}
        {activeTab === 'stats' && profile.role === 'Administrator' && <StatsAnalytics teams={allTeams} />}
      </div>
    </Layout>
  );
};

export default App;
