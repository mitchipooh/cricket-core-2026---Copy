
import React from 'react';

interface InningsBreakModalProps {
  isOpen: boolean;
  title: string;
  reason: string;
  battingTeamName: string;
  score: string;
  isMatchOver: boolean;
  onNextInnings: () => void;
  onFinishMatch: () => void;
  onContinue?: () => void;
}

export const InningsBreakModal: React.FC<InningsBreakModalProps> = ({
  isOpen,
  title,
  reason,
  battingTeamName,
  score,
  isMatchOver,
  onNextInnings,
  onFinishMatch,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 text-center">
         
         <div className="bg-slate-950 p-10 border-b border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="text-4xl mb-4">🏁</div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{title}</h2>
            <div className="inline-block px-4 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-widest">
               {reason}
            </div>
         </div>

         <div className="p-10 space-y-8">
            <div>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{battingTeamName} Finished At</p>
               <div className="text-5xl font-black text-white tracking-tighter">{score}</div>
            </div>

            <div className="flex flex-col gap-3">
               {isMatchOver ? (
                  <button 
                     onClick={onFinishMatch}
                     className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                  >
                     Finalize Match Result
                  </button>
               ) : (
                  <button 
                     onClick={onNextInnings}
                     className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                  >
                     Start 2nd Innings
                  </button>
               )}
               
               {onContinue && (
                 <button 
                    onClick={onContinue}
                    className="w-full py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-white transition-all"
                 >
                    Continue Batting
                 </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
