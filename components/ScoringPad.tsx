
import React, { useState } from 'react';
import { PadView } from '../scoring/hooks/useScoringPad.ts';
import { Player, Team } from '../types.ts';

interface ScoringPadProps {
  padView: PadView;
  striker?: Player;
  nonStriker?: Player;
  bowlingTeam?: Team;
  onRun: (runs: number) => void;
  onCommitExtra: (type: any, runs: number) => void;
  onStartWicket: (defaultBatterId?: string) => void;
  onNav: (view: PadView) => void;
  onBack: () => void;
  onMediaCapture?: () => void;
  onDeclare?: () => void;
}

export const ScoringPad: React.FC<ScoringPadProps> = ({
  padView,
  striker,
  nonStriker,
  onRun,
  onCommitExtra,
  onStartWicket,
  onNav,
  onBack,
  onMediaCapture,
  onDeclare
}) => {
  const [extraType, setExtraType] = useState<'Wide' | 'NoBall' | 'Bye' | 'LegBye' | ''>('');
  const [extraRuns, setExtraRuns] = useState(0);

  /* =====================
     MAIN PAD
  ===================== */
  if (padView === 'main') {
    return (
      <div className="h-full w-full flex flex-col">
        {/* Adjusted Grid Rows: 1fr 1.25fr 1fr to give more weight to center buttons */}
        <div className="grid grid-cols-4 grid-rows-[1fr_1.25fr_1fr] gap-2 h-full w-full">
          {/* Row 1: Singles/Dots */}
          <button onClick={() => onRun(0)} className="col-span-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-400 rounded-xl text-2xl font-black transition-all active:scale-95 shadow-sm border border-slate-700 flex items-center justify-center">0</button>
          <button onClick={() => onRun(1)} className="col-span-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl text-2xl font-black transition-all active:scale-95 shadow-sm border border-slate-700 flex items-center justify-center">1</button>
          <button onClick={() => onRun(2)} className="col-span-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl text-2xl font-black transition-all active:scale-95 shadow-sm border border-slate-700 flex items-center justify-center">2</button>
          <button onClick={() => onRun(3)} className="col-span-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-xl text-2xl font-black transition-all active:scale-95 shadow-sm border border-slate-700 flex items-center justify-center">3</button>
          
          {/* Row 2: Boundaries (Prominent) */}
          <button onClick={() => onRun(4)} className="col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:to-indigo-700 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-900/40 border border-indigo-500/30 flex flex-col items-center justify-center group relative overflow-hidden">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="text-5xl font-black relative z-10">4</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 relative z-10">Boundary</span>
          </button>
          <button onClick={() => onRun(6)} className="col-span-2 bg-gradient-to-br from-emerald-600 to-emerald-800 hover:to-emerald-700 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-900/40 border border-emerald-500/30 flex flex-col items-center justify-center group relative overflow-hidden">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="text-5xl font-black relative z-10">6</span>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 relative z-10">Maximum</span>
          </button>
          
          {/* Row 3: Special Actions */}
          <button onClick={() => { setExtraType(''); setExtraRuns(0); onNav('extras'); }} className="col-span-2 bg-amber-700/80 hover:bg-amber-600 text-white rounded-xl text-lg font-black transition-all active:scale-95 shadow-md shadow-amber-900/30 border border-amber-500/30 flex flex-col items-center justify-center">
             WD / NB / B / LB
             <span className="text-[8px] font-bold opacity-70 uppercase tracking-widest mt-0.5">Extras Menu</span>
          </button>
          <button 
            onClick={() => onStartWicket(striker?.id)}
            className="col-span-1 bg-red-700 hover:bg-red-600 text-white rounded-xl text-lg font-black transition-all active:scale-95 shadow-md shadow-red-900/30 border border-red-500/30 flex flex-col items-center justify-center"
          >
             OUT
          </button>
          <button 
            onClick={() => onNav('events')}
            className="col-span-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-lg font-black transition-all active:scale-95 shadow-sm border border-slate-700 flex flex-col items-center justify-center"
          >
             •••
          </button>
        </div>
      </div>
    );
  }

  /* =====================
     EVENTS / MENU FLOW
  ===================== */
  if (padView === 'events') {
    return (
      <div className="h-full flex flex-col animate-in zoom-in-95 p-1 gap-2">
         <h3 className="text-center font-black uppercase text-[9px] text-slate-500 tracking-widest shrink-0">Match Actions</h3>
         <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
            <button onClick={() => { if(onMediaCapture) onMediaCapture(); }} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all">
               <div className="w-10 h-10 rounded-full bg-slate-700 group-hover:bg-indigo-600 flex items-center justify-center text-xl transition-colors">📸</div>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Media Capture</span>
            </button>
            <button onClick={() => { if (confirm("Are you sure you want to DECLARE the innings closed?")) { if(onDeclare) onDeclare(); onBack(); } }} className="bg-slate-800 hover:bg-red-900/30 border border-slate-700 hover:border-red-500 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all">
               <div className="w-10 h-10 rounded-full bg-slate-700 group-hover:bg-red-600 flex items-center justify-center text-xl transition-colors">✋</div>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Declare Innings</span>
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all opacity-50 cursor-not-allowed">
               <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">🔁</div>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Substitute</span>
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all opacity-50 cursor-not-allowed">
               <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">⚙️</div>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Settings</span>
            </button>
         </div>
         <button onClick={onBack} className="h-12 w-full bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 shrink-0">Back to Scoring</button>
      </div>
    );
  }

  /* =====================
     EXTRAS FLOW
  ===================== */
  if (padView === 'extras') {
    return (
      <div className="h-full flex flex-col animate-in zoom-in-95 p-1 gap-2">
        <h3 className="text-center font-black uppercase text-[9px] text-amber-500 tracking-widest shrink-0">Select Extra Type</h3>
        
        <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
          {(['Wide', 'NoBall', 'Bye', 'LegBye'] as const).map(type => (
            <button
              key={type}
              onClick={() => setExtraType(type)}
              className={`rounded-xl border font-black transition-all relative overflow-hidden flex items-center justify-center text-sm uppercase tracking-wider ${
                extraType === type
                  ? 'border-amber-500 bg-amber-500/20 text-amber-500 shadow-inner'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-amber-500/50 hover:text-amber-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex gap-2 h-14 shrink-0">
          {[0, 1, 2, 3, 4].map(r => (
            <button
              key={r}
              onClick={() => setExtraRuns(r)}
              className={`flex-1 rounded-lg font-black transition-all border text-lg flex flex-col items-center justify-center ${
                extraRuns === r
                  ? 'bg-white text-slate-900 border-white shadow-lg'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="leading-none">+{r}</span>
              <span className="text-[7px] opacity-60 font-bold uppercase">Runs</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 h-12 mt-auto shrink-0">
          <button
            onClick={onBack}
            className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black uppercase text-[10px] rounded-xl border border-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!extraType}
            onClick={() => onCommitExtra(extraType, extraRuns)}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-[10px] rounded-xl shadow-xl shadow-amber-900/20 transition-all disabled:opacity-50 disabled:shadow-none tracking-widest"
          >
            Confirm Extra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
      <div className="text-2xl mb-2 opacity-20">⚙️</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">View Not Ready</p>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Back</button>
    </div>
  );
};
