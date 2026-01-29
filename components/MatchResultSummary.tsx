
import React from 'react';
import { MatchState, Team, Player } from '../types.ts';
import { getBattingStats, getBowlingStats } from '../scoring/MatchSelectors.ts';

interface MatchResultSummaryProps {
  matchState: MatchState;
  teamA: Team;
  teamB: Team;
  onExit: () => void;
}

export const MatchResultSummary: React.FC<MatchResultSummaryProps> = ({ matchState, teamA, teamB, onExit }) => {
  // 1. Calculate Result Text
  const scoreAData = matchState.inningsScores.find(i => i.teamId === teamA.id);
  const scoreBData = matchState.inningsScores.find(i => i.teamId === teamB.id) || (matchState.innings === 2 && matchState.battingTeamId === teamB.id ? { score: matchState.score, wickets: matchState.wickets, overs: '' } : null);
  
  const scoreA = scoreAData?.score || 0;
  const scoreB = scoreBData?.score || 0;
  const wicketsB = scoreBData?.wickets || 0;

  let winnerId: string | null = null;
  let resultText = "Match Concluded";
  let marginText = "";

  if (scoreA > scoreB) {
    winnerId = teamA.id;
    resultText = `${teamA.name} Won`;
    marginText = `by ${scoreA - scoreB} runs`;
  } else if (scoreB > scoreA) {
    winnerId = teamB.id;
    resultText = `${teamB.name} Won`;
    // Estimate wickets left based on typical 11 players
    const wicketsLeft = 10 - wicketsB; 
    marginText = `by ${Math.max(1, wicketsLeft)} wickets`;
  } else {
    resultText = "Match Tied";
    marginText = "Scores Level";
  }

  // 2. Identify Top Performers
  const getTopPerformer = (team: Team, innings: number) => {
    let bestBatter: { p: Player, stats: any } | null = null;
    let bestBowler: { p: Player, stats: any } | null = null;

    // Batting
    team.players.forEach(p => {
      const stats = getBattingStats(p.id, matchState.history, innings);
      if (!bestBatter || stats.runs > bestBatter.stats.runs) {
        bestBatter = { p, stats };
      }
    });

    // Bowling (Opposite team bowled in this innings)
    const bowlingTeam = team.id === teamA.id ? teamB : teamA;
    bowlingTeam.players.forEach(p => {
      const stats = getBowlingStats(p.id, matchState.history, innings);
      if (!bestBowler || stats.wickets > bestBowler.stats.wickets || (stats.wickets === bestBowler.stats.wickets && parseFloat(stats.econ) < parseFloat(bestBowler.stats.econ))) {
        bestBowler = { p, stats };
      }
    });

    return { bestBatter, bestBowler };
  };

  // Assuming Innings 1 = Team A Batting, Innings 2 = Team B Batting
  // Adjust logic if Team B batted first
  const firstBattingTeamId = matchState.inningsScores[0]?.teamId;
  const innings1Stats = getTopPerformer(firstBattingTeamId === teamA.id ? teamA : teamB, 1);
  const innings2Stats = getTopPerformer(firstBattingTeamId === teamA.id ? teamB : teamA, 2);

  return (
    <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col items-center justify-center p-4 overflow-y-auto animate-in zoom-in duration-500">
      {/* Confetti Background Effect (CSS only simplification) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
         <div className="absolute top-10 right-1/4 w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300"></div>
         <div className="absolute top-5 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-700"></div>
      </div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        
        {/* Result Header */}
        <div className="text-center space-y-2">
           <div className="inline-block px-6 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-indigo-300 font-black uppercase text-xs tracking-[0.3em] mb-4">
              Match Result
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 leading-tight">
              {resultText}
           </h1>
           <p className="text-xl text-slate-400 font-bold uppercase tracking-widest">{marginText}</p>
        </div>

        {/* Scores Summary */}
        <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-700/50">
           <div className={`text-center p-4 rounded-2xl ${winnerId === teamA.id ? 'bg-indigo-600/20 border border-indigo-500/50' : ''}`}>
              <img src={teamA.logoUrl} className="w-16 h-16 rounded-full mx-auto mb-3 bg-white object-cover" />
              <div className="text-3xl font-black text-white">{scoreA}/{scoreAData?.wickets || 0}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{teamA.name}</div>
           </div>
           <div className={`text-center p-4 rounded-2xl ${winnerId === teamB.id ? 'bg-indigo-600/20 border border-indigo-500/50' : ''}`}>
              <img src={teamB.logoUrl} className="w-16 h-16 rounded-full mx-auto mb-3 bg-white object-cover" />
              <div className="text-3xl font-black text-white">{scoreB}/{wicketsB}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{teamB.name}</div>
           </div>
        </div>

        {/* Top Performers Grid */}
        <div className="space-y-4">
           <h3 className="text-center text-xs font-black text-slate-500 uppercase tracking-widest">Match Heroes</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Batter MVP */}
              {[innings1Stats.bestBatter, innings2Stats.bestBatter].filter(Boolean).sort((a,b) => b!.stats.runs - a!.stats.runs).slice(0,1).map((b, i) => (
                 <div key={i} className="bg-slate-800 p-4 rounded-2xl flex items-center gap-4 border border-slate-700">
                    <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden shrink-0 border-2 border-amber-500">
                       <img src={b!.p.photoUrl || `https://ui-avatars.com/api/?name=${b!.p.name}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Top Scorer</div>
                       <div className="font-bold text-white text-lg leading-none">{b!.p.name}</div>
                       <div className="text-xs text-slate-400 mt-1"><span className="text-white font-black">{b!.stats.runs}</span> runs ({b!.stats.balls} balls)</div>
                    </div>
                 </div>
              ))}

              {/* Bowler MVP */}
              {[innings1Stats.bestBowler, innings2Stats.bestBowler].filter(Boolean).sort((a,b) => b!.stats.wickets - a!.stats.wickets).slice(0,1).map((b, i) => (
                 <div key={i} className="bg-slate-800 p-4 rounded-2xl flex items-center gap-4 border border-slate-700">
                    <div className="w-14 h-14 rounded-full bg-slate-700 overflow-hidden shrink-0 border-2 border-emerald-500">
                       <img src={b!.p.photoUrl || `https://ui-avatars.com/api/?name=${b!.p.name}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Best Spell</div>
                       <div className="font-bold text-white text-lg leading-none">{b!.p.name}</div>
                       <div className="text-xs text-slate-400 mt-1"><span className="text-white font-black">{b!.stats.wickets}</span> wkts ({b!.stats.runs} runs)</div>
                    </div>
                 </div>
              ))}

           </div>
        </div>

        <button 
          onClick={onExit}
          className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shadow-xl"
        >
           Return to Dashboard
        </button>

      </div>
    </div>
  );
};
