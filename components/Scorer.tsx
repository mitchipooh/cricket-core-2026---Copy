
import React, { useState, useMemo, useEffect } from 'react';
import { MatchFixture, MatchState, Team, Player, Organization, UserProfile, BallEvent, MediaPost } from '../types.ts';
import { useMatchEngine } from '../scoring/hooks/useMatchEngine.ts';
import { useScoringPad, PadView } from '../scoring/hooks/useScoringPad.ts';
import { useWicketFlow } from '../scoring/hooks/useWicketFlow.ts';
import { useMatchRules } from '../scoring/hooks/useMatchRules.ts';
import { useDerivedStats } from '../scoring/hooks/useDerivedStats.ts';
import { useBallTimeline } from '../scoring/hooks/useBallTimeline.ts';
import { useInningsOverRateTimer } from '../scoring/hooks/useInningsOverRateTimer.ts';
import { ScoringPad } from './ScoringPad.tsx';
import { WicketModal } from './WicketModal.tsx';
import { NewBatterModal } from './NewBatterModal.tsx';
import { InningsBreakModal } from './InningsBreakModal.tsx';
import { EndOfOverModal } from './EndOfOverModal.tsx';
import { OverRateTimer } from './OverRateTimer.tsx';
import { BattingScorecard } from './BattingScorecard.tsx';
import { BowlingScorecard } from './BowlingScorecard.tsx';
import { CameraModal } from './CameraModal.tsx';
import { MatchResultSummary } from './MatchResultSummary.tsx';
import { buildBattingCard } from '../scorer/scorecard/buildBattingCard.ts';
import { buildBowlingCard } from '../scorer/scorecard/buildBowlingCard.ts';
import { checkEndOfInnings } from '../scoring/engines/inningsEngine.ts';

interface ScorerProps {
  match: MatchFixture;
  teams: Team[];
  userRole: UserProfile['role'];
  organizations: Organization[];
  onUpdateOrgs: React.Dispatch<React.SetStateAction<Organization[]>>;
  onUpdateMatchState: (matchId: string, newState: MatchState, finalStatus?: MatchFixture['status'], result?: string) => void;
  onComplete: () => void;
  onRequestNewMatch: () => void;
  onAddMediaPost: (post: MediaPost) => void;
}

type ScorerMainTab = 'CONSOLE' | 'SCORECARD';
type CorrectionType = 'STRIKER' | 'NON_STRIKER' | 'BOWLER' | null;

export const Scorer: React.FC<ScorerProps> = ({ 
  match, 
  teams, 
  onUpdateMatchState, 
  onComplete,
  onAddMediaPost
}) => {
  const initialState: MatchState = useMemo(() => {
    if (match.savedState) return match.savedState;
    const tossWinnerId = match.tossWinnerId || match.teamAId;
    const battingTeamId = match.tossDecision === 'Bat' ? tossWinnerId : (tossWinnerId === match.teamAId ? match.teamBId : match.teamAId);
    const bowlingTeamId = battingTeamId === match.teamAId ? match.teamBId : match.teamAId;
    
    // Inject initial players if provided by setup
    const initialStriker = match.initialPlayers?.strikerId || '';
    const initialNonStriker = match.initialPlayers?.nonStrikerId || '';
    const initialBowler = match.initialPlayers?.bowlerId || '';

    // Create a "Match Started" event if we have openers but no history
    const history: BallEvent[] = [];
    if (initialStriker && initialNonStriker && initialBowler) {
       history.push({
          timestamp: Date.now(),
          over: 0,
          ballNumber: 0,
          strikerId: initialStriker,
          nonStrikerId: initialNonStriker,
          bowlerId: initialBowler,
          runs: 0, batRuns: 0, extraRuns: 0, extraType: 'None', isWicket: false,
          commentary: 'EVENT: Match Started',
          innings: 1
       });
    }

    return {
      battingTeamId,
      bowlingTeamId,
      score: 0,
      wickets: 0,
      totalBalls: 0,
      strikerId: initialStriker,
      nonStrikerId: initialNonStriker,
      bowlerId: initialBowler,
      innings: 1,
      history: history,
      inningsScores: [],
      isCompleted: false,
      matchTimer: { startTime: null, totalAllowances: 0, isPaused: false, lastPauseTime: null }
    };
  }, [match]);

  const engine = useMatchEngine(initialState);
  const battingTeam = useMemo(() => teams.find(t => t.id === engine.state.battingTeamId), [teams, engine.state.battingTeamId]);
  const bowlingTeam = useMemo(() => teams.find(t => t.id === engine.state.bowlingTeamId), [teams, engine.state.bowlingTeamId]);

  const selectableBatters = useMemo(() => {
     if (!battingTeam) return [];
     const squadIds = battingTeam.id === match.teamAId ? match.teamASquadIds : match.teamBSquadIds;
     if (!squadIds || squadIds.length === 0 || match.allowFlexibleSquad) return battingTeam.players;
     return battingTeam.players.filter(p => squadIds.includes(p.id));
  }, [battingTeam, match]);

  const availableBatters = useMemo(() => {
    const activeInningsHistory = engine.state.history.filter(b => b.innings === engine.state.innings);
    const outPlayerIds = new Set(activeInningsHistory.filter(b => b.isWicket && b.outPlayerId).map(b => b.outPlayerId!));
    return selectableBatters.filter(p => 
      !outPlayerIds.has(p.id) && 
      p.id !== engine.state.strikerId && 
      p.id !== engine.state.nonStrikerId
    );
  }, [selectableBatters, engine.state.history, engine.state.strikerId, engine.state.nonStrikerId, engine.state.innings]);

  const selectableBowlers = useMemo(() => {
     if (!bowlingTeam) return [];
     const squadIds = bowlingTeam.id === match.teamAId ? match.teamASquadIds : match.teamBSquadIds;
     if (!squadIds || squadIds.length === 0 || match.allowFlexibleSquad) return bowlingTeam.players;
     return bowlingTeam.players.filter(p => squadIds.includes(p.id));
  }, [bowlingTeam, match]);

  const rules = useMatchRules(match, engine.state, bowlingTeam);
  const stats = useDerivedStats(engine.state, rules.totalOversAllowed, battingTeam, bowlingTeam);
  const timeline = useBallTimeline(engine.state);
  const pad = useScoringPad();
  const wicket = useWicketFlow();
  
  const timer = useInningsOverRateTimer(
    engine.state.matchTimer.startTime,
    engine.state.totalBalls,
    !engine.state.isCompleted
  );

  const [mainTab, setMainTab] = useState<ScorerMainTab>('CONSOLE');
  const [newBatterTarget, setNewBatterTarget] = useState<'Striker' | 'NonStriker' | null>(null);
  const [inningsBreak, setInningsBreak] = useState<{ open: boolean; reason: string }>({ open: false, reason: '' });
  const [correctionTarget, setCorrectionTarget] = useState<CorrectionType>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);

  const battingCardData = useMemo(() => {
    if (!battingTeam) return [];
    return buildBattingCard(engine.state.history, battingTeam.players, engine.state.innings, engine.state.strikerId, engine.state.nonStrikerId);
  }, [engine.state.history, engine.state.innings, battingTeam, engine.state.strikerId, engine.state.nonStrikerId]);

  const bowlingCardData = useMemo(() => {
    if (!bowlingTeam) return [];
    return buildBowlingCard(engine.state.history, bowlingTeam.players, engine.state.innings);
  }, [engine.state.history, engine.state.innings, bowlingTeam]);

  const striker = battingTeam?.players.find(p => p.id === engine.state.strikerId);
  const nonStriker = battingTeam?.players.find(p => p.id === engine.state.nonStrikerId);
  const bowler = bowlingTeam?.players.find(p => p.id === engine.state.bowlerId);

  // Check against the last *legal* bowler to see if a change has occurred
  const needsBowlerChange = useMemo(() => {
    const isOverBoundary = engine.state.totalBalls > 0 && engine.state.totalBalls % 6 === 0;
    if (!isOverBoundary) return false;

    // Find last actual ball delivered (ignoring events)
    const lastBall = engine.state.history.find(b => !b.commentary?.startsWith('EVENT'));
    if (!lastBall) return false;

    // If the bowler currently set in state is the SAME as the one who bowled the last ball
    // of the completed over, we need to force a change.
    return engine.state.bowlerId === lastBall.bowlerId;
  }, [engine.state.totalBalls, engine.state.history, engine.state.bowlerId]);

  useEffect(() => {
    onUpdateMatchState(match.id, engine.state);
  }, [engine.state, match.id]);

  // Handle detection of missing batters or innings end
  useEffect(() => {
    if (engine.state.isCompleted || inningsBreak.open || showResultScreen) return;
    
    // Check if match is over first
    const endReason = checkEndOfInnings(engine.state, rules.totalOversAllowed, selectableBatters.length, match.allowFlexibleSquad);
    if (endReason) {
      setInningsBreak({ open: true, reason: endReason });
      return;
    }

    if (!engine.state.strikerId && !engine.state.nonStrikerId && availableBatters.length >= 2) {
       setNewBatterTarget('Striker');
    } else if (!engine.state.strikerId && availableBatters.length > 0) {
       setNewBatterTarget('Striker');
    } else if (!engine.state.nonStrikerId && availableBatters.length > 0) {
       setNewBatterTarget('NonStriker');
    }
  }, [engine.state.strikerId, engine.state.nonStrikerId, engine.state.wickets, engine.state.isCompleted, availableBatters.length, engine.state.totalBalls, engine.state.adjustments?.declared]);

  const handleRun = (runs: number) => {
    engine.applyBall({
      timestamp: Date.now(),
      over: Math.floor(engine.state.totalBalls / 6),
      ballNumber: (engine.state.totalBalls % 6) + 1,
      strikerId: engine.state.strikerId, nonStrikerId: engine.state.nonStrikerId, bowlerId: engine.state.bowlerId,
      runs, batRuns: runs, extraType: 'None', isWicket: false, innings: engine.state.innings
    });
    pad.resetPad();
  };

  const handleCommitExtra = (type: any, runs: number) => {
    engine.applyBall({
      timestamp: Date.now(),
      over: Math.floor(engine.state.totalBalls / 6),
      ballNumber: (engine.state.totalBalls % 6) + 1,
      strikerId: engine.state.strikerId, nonStrikerId: engine.state.nonStrikerId, bowlerId: engine.state.bowlerId,
      runs: 0, batRuns: 0, extraRuns: runs, extraType: type, isWicket: false, innings: engine.state.innings
    });
    pad.resetPad();
  };

  const handleMediaUpload = (dataUrl: string, type: 'IMAGE' | 'VIDEO') => {
    const newPost: MediaPost = {
       id: `post-${Date.now()}`,
       type: type,
       authorName: 'Official Scorer',
       authorAvatar: '', // Could be scorer's avatar
       contentUrl: dataUrl,
       caption: `Live from the crease! ${engine.state.score}/${engine.state.wickets} (${stats.overs} ov)`,
       timestamp: Date.now(),
       likes: 0,
       shares: 0,
       comments: [],
       matchId: match.id
    };
    onAddMediaPost(newPost);
  };

  const handleMatchFinish = () => {
    // Commit the end of match state
    engine.endInnings(); // Ensure final stats are captured
    setInningsBreak({ open: false, reason: '' });
    setShowResultScreen(true);
  };

  const startNextInnings = () => {
    engine.endInnings(); // Save current innings score
    // Swap teams
    const nextBatting = engine.state.bowlingTeamId;
    const nextBowling = engine.state.battingTeamId;
    
    // Set Target
    const target = engine.state.score + 1;
    
    engine.startInnings(nextBatting, nextBowling, target);
    setInningsBreak({ open: false, reason: '' });
  };

  if (showResultScreen) {
    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);
    
    if (!teamA || !teamB) return <div>Error loading result data</div>;

    return <MatchResultSummary matchState={engine.state} teamA={teamA} teamB={teamB} onExit={onComplete} />;
  }

  return (
    <div className="h-[calc(100vh-5rem)] bg-slate-950 text-white flex flex-col overflow-hidden w-full max-w-lg mx-auto border-x border-slate-900 shadow-2xl">
      
      {/* 1. COMPACT MATCH HEADER */}
      <div className="bg-slate-900 px-3 py-2 shrink-0 flex items-center justify-between border-b border-slate-800 relative z-20 shadow-md">
         <div className="w-20 text-left">
            <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Overs</div>
            <div className="text-base font-black text-white leading-none">{stats.overs}</div>
         </div>
         <div className="flex-1 text-center flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-1">
               <img src={battingTeam?.logoUrl} className="w-4 h-4 rounded-full bg-white object-cover" />
               <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest truncate max-w-[120px]">{battingTeam?.name}</div>
            </div>
            <div className="text-2xl font-black text-white leading-none tracking-tighter">
               {engine.state.score}/{engine.state.wickets}
            </div>
            {engine.state.target && (
               <div className="text-[9px] font-bold text-slate-500 mt-0.5">Target: {engine.state.target}</div>
            )}
            <div className="mt-0.5">
               <OverRateTimer elapsedSeconds={timer.elapsedSeconds} actualOvers={timer.actualOvers} expectedOvers={timer.expectedOvers} behindRate={timer.behindRate} />
            </div>
         </div>
         <div className="w-20 text-right">
            <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">CRR</div>
            <div className="text-base font-black text-emerald-400 leading-none">{stats.runRate}</div>
         </div>
      </div>

      {/* 2. PLAYER STATS HUD (Refined & Tightened) */}
      <div className="bg-slate-100 p-2 shrink-0 border-b border-slate-200 flex flex-col gap-2">
         {/* Batters Row */}
         <div className="grid grid-cols-2 gap-2 h-[4.5rem]">
            {[ 
               { p: striker, id: engine.state.strikerId, label: 'Striker', active: true, target: 'STRIKER' as CorrectionType }, 
               { p: nonStriker, id: engine.state.nonStrikerId, label: 'Non-Striker', active: false, target: 'NON_STRIKER' as CorrectionType } 
            ].map(({ p, id, label, active, target }) => {
               const s = stats.batterStats[id];
               return (
                  <button 
                    key={label} 
                    onClick={() => setCorrectionTarget(target)}
                    className={`relative rounded-xl border text-left transition-all overflow-hidden shadow-sm flex items-center ${active ? 'bg-white border-indigo-500 ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 opacity-90'}`}
                  >
                     <div className="w-12 h-full bg-slate-100 shrink-0 border-r border-slate-100 relative">
                        {active && <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-500 z-10 ring-1 ring-white" />}
                        <img src={p?.photoUrl || `https://ui-avatars.com/api/?name=${p?.name || '?'}&background=random`} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                     </div>
                     <div className="flex-1 pl-2 pr-2 py-1 flex flex-col justify-center min-w-0">
                         <div className="truncate text-xs font-black text-slate-800 leading-tight mb-0.5">{p?.name || 'Select'}</div>
                         <div className="flex items-baseline gap-1 mt-auto">
                             <span className="text-lg font-black text-slate-900 leading-none">{s?.runs || 0}</span>
                             <span className="text-[9px] text-slate-500 font-bold">({s?.balls || 0})</span>
                             <div className="ml-auto flex flex-col items-end">
                                <span className="text-[9px] font-black text-indigo-600">SR {s?.strikeRate || '0.0'}</span>
                                <div className="flex gap-1 text-[7px] font-bold text-slate-400">
                                   <span>{s?.fours || 0}x4</span>
                                   <span>{s?.sixes || 0}x6</span>
                                </div>
                             </div>
                         </div>
                     </div>
                  </button>
               );
            })}
         </div>

         {/* Bowler Row */}
         <button 
           onClick={() => setCorrectionTarget('BOWLER')}
           className="h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm px-2 group overflow-hidden"
         >
            <div className="flex items-center gap-3 min-w-0">
               <img src={bowler?.photoUrl || `https://ui-avatars.com/api/?name=${bowler?.name || '?'}&background=random`} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-100" />
               <div className="text-left min-w-0">
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bowler</div>
                  <div className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">{bowler?.name || 'Select'}</div>
               </div>
            </div>

            <div className="flex items-center gap-3 pr-2">
               <div className="text-center"><div className="text-[7px] uppercase font-bold text-slate-400">Ov</div><div className="text-xs font-black text-slate-900">{stats.bowlerStats[engine.state.bowlerId]?.overs || '0.0'}</div></div>
               <div className="text-center"><div className="text-[7px] uppercase font-bold text-slate-400">Run</div><div className="text-xs font-black text-slate-900">{stats.bowlerStats[engine.state.bowlerId]?.runs || 0}</div></div>
               <div className="text-center"><div className="text-[7px] uppercase font-bold text-red-500">Wkt</div><div className="text-xs font-black text-red-600 bg-red-50 px-1 rounded">{stats.bowlerStats[engine.state.bowlerId]?.wickets || 0}</div></div>
               <div className="text-center"><div className="text-[7px] uppercase font-bold text-slate-400">Eco</div><div className="text-xs font-bold text-slate-600">{stats.bowlerStats[engine.state.bowlerId]?.economy || '0.0'}</div></div>
            </div>
         </button>
      </div>

      {/* 3. SCORING CONSOLE (FIT TO SCREEN) */}
      <div className="flex-1 min-h-0 bg-slate-950 relative flex flex-col">
         {/* Timeline Tape */}
         <div className="h-7 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center px-2 overflow-hidden gap-2">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest shrink-0">Recent:</span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar items-center mask-image-linear-to-r">
               {timeline.slice(0, 10).map((item) => (
                   <div key={item.id} className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${item.color} text-white shrink-0 shadow-sm border border-white/10`}>
                      {item.label}
                   </div>
               ))}
            </div>
         </div>

         {/* Control Bar */}
         <div className="flex items-center justify-between p-1.5 shrink-0 gap-2 border-b border-white/5 bg-slate-900/30">
             <div className="bg-slate-900 p-0.5 rounded-lg flex border border-slate-800">
                <button onClick={() => setMainTab('CONSOLE')} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${mainTab === 'CONSOLE' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>Scoring</button>
                <button onClick={() => setMainTab('SCORECARD')} className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${mainTab === 'SCORECARD' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>Card</button>
             </div>
             <button onClick={() => engine.undoBall()} disabled={!engine.canUndo} className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-700 disabled:opacity-30">Undo</button>
         </div>

         {/* Main Pad Area - Fill Remaining Space */}
         <div className="flex-1 min-h-0 p-2 overflow-hidden">
             {mainTab === 'CONSOLE' ? (
                <ScoringPad
                  padView={pad.padView}
                  striker={striker}
                  nonStriker={nonStriker}
                  bowlingTeam={bowlingTeam}
                  onRun={handleRun}
                  onCommitExtra={handleCommitExtra}
                  onStartWicket={wicket.start}
                  onNav={pad.setPadView}
                  onBack={pad.resetPad}
                  onMediaCapture={() => setIsCameraOpen(true)}
                  onDeclare={engine.declareInnings}
                />
             ) : (
                <div className="space-y-4 p-1 animate-in fade-in h-full overflow-y-auto custom-scrollbar">
                   <div><h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Batting Scorecard</h4><BattingScorecard rows={battingCardData} /></div>
                   <div><h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Bowling Scorecard</h4><BowlingScorecard rows={bowlingCardData} /></div>
                </div>
             )}
         </div>
      </div>

      {/* CORRECTION / REPLACEMENT MODAL */}
      {correctionTarget && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Player Actions</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Manage {correctionTarget.replace('_', ' ')} Slot</p>
              
              <div className="space-y-4">
                 <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Correction Mode</h4>
                    <p className="text-[10px] text-slate-400 mb-4">Swap identity retroactively for the current session. Stats will transfer.</p>
                    <select 
                       className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white outline-none"
                       onChange={(e) => {
                          const oldId = correctionTarget === 'STRIKER' ? engine.state.strikerId : (correctionTarget === 'NON_STRIKER' ? engine.state.nonStrikerId : engine.state.bowlerId);
                          engine.correctPlayerIdentity(oldId, e.target.value, correctionTarget.toLowerCase() as any);
                          setCorrectionTarget(null);
                       }}
                       value=""
                    >
                       <option value="">Select correct player...</option>
                       {(correctionTarget === 'BOWLER' ? selectableBowlers : selectableBatters).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                    </select>
                 </div>

                 <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Replacement / Retirement</h4>
                    <p className="text-[10px] text-slate-400 mb-4">Permanent swap for injury or strategic retirement. Stats remain split.</p>
                    <div className="grid grid-cols-2 gap-2">
                       {correctionTarget === 'BOWLER' ? (
                          <button onClick={() => pad.setPadView('bowler_replacement_select')} className="col-span-2 py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Injury Replacement</button>
                       ) : (
                          <>
                             <button onClick={() => { engine.retireBatter(correctionTarget === 'STRIKER' ? engine.state.strikerId : engine.state.nonStrikerId, 'Retired Hurt'); setCorrectionTarget(null); }} className="py-3 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Retired Hurt</button>
                             <button onClick={() => { engine.retireBatter(correctionTarget === 'STRIKER' ? engine.state.strikerId : engine.state.nonStrikerId, 'Retired Out'); setCorrectionTarget(null); }} className="py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Retired Out</button>
                          </>
                       )}
                    </div>
                 </div>
              </div>

              <button onClick={() => setCorrectionTarget(null)} className="w-full mt-6 py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
           </div>
        </div>
      )}

      {/* MODALS */}
      <WicketModal open={wicket.isOpen} batters={[striker!, nonStriker!].filter(Boolean)} fielders={selectableBowlers} wicketType={wicket.wicketType} outPlayerId={wicket.outPlayerId} fielderId={wicket.fielderId} onSelectType={wicket.setWicketType} onSelectOutPlayer={wicket.setOutPlayerId} onSelectFielder={wicket.setFielderId} onConfirm={() => {
        engine.recordWicket({type: 'WICKET', wicketType: wicket.wicketType!, batterId: wicket.outPlayerId!, fielderId: wicket.fielderId || undefined});
        wicket.reset();
      }} onCancel={wicket.reset} />
      <EndOfOverModal isOpen={needsBowlerChange} overNumber={Math.floor(engine.state.totalBalls / 6) + 1} bowlingTeamName={bowlingTeam?.name || ''} currentBowlerId={engine.state.bowlerId} bowlers={selectableBowlers} getAvailability={rules.getBowlerAvailability} onSelectBowler={(id) => engine.applyBall({ commentary: 'EVENT: New Bowler', bowlerId: id } as BallEvent)} />
      
      <InningsBreakModal 
        isOpen={inningsBreak.open} 
        title="Innings Over" 
        reason={inningsBreak.reason} 
        battingTeamName={battingTeam?.name || ''} 
        score={`${engine.state.score}/${engine.state.wickets}`} 
        isMatchOver={engine.state.innings === 2} 
        onNextInnings={startNextInnings} 
        onFinishMatch={handleMatchFinish} 
      />
      
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onUpload={handleMediaUpload} />
      
      {pad.padView === 'bowler_replacement_select' && (
         <NewBatterModal 
            isOpen={true} 
            teamName={bowlingTeam?.name || ''} 
            availableBatters={selectableBowlers.filter(p => p.id !== engine.state.bowlerId)} 
            targetRole="Striker" 
            onSelect={(id) => { engine.replaceBowlerMidOver(id); pad.resetPad(); setCorrectionTarget(null); }} 
         />
      )}

      {newBatterTarget && (
        <NewBatterModal
          isOpen={true}
          teamName={battingTeam?.name || ''}
          availableBatters={availableBatters}
          targetRole={newBatterTarget}
          onSelect={(id) => { 
            engine.applyBall({ commentary: `EVENT: New Batter (${newBatterTarget})`, [newBatterTarget.toLowerCase() + 'Id']: id } as any);
            setNewBatterTarget(null);
          }}
        />
      )}
    </div>
  );
};
