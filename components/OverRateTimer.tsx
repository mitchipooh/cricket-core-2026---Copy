
import React from 'react';

type Props = {
  elapsedSeconds: number;
  actualOvers: number;
  expectedOvers: number;
  behindRate: boolean;
};

export function OverRateTimer({
  elapsedSeconds,
  actualOvers,
  expectedOvers,
  behindRate
}: Props) {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const timeString = hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all duration-300
        ${behindRate 
           ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse' 
           : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
        }
      `}
    >
      <div className="flex items-center gap-1.5">
        <span className={behindRate ? 'text-white' : 'opacity-70'}>
            {behindRate ? '⚠️' : '⏱'}
        </span>
        <span className={behindRate ? 'text-white' : 'text-indigo-400'}>{timeString}</span>
      </div>

      <div className={`w-px h-3 ${behindRate ? 'bg-white/30' : 'bg-white/10'}`} />

      <div className="flex items-center gap-1.5 whitespace-nowrap">
         <span className={behindRate ? 'text-white' : 'text-white'}>{actualOvers.toFixed(1)} Ov</span>
         <span className={`text-[9px] uppercase tracking-wider hidden sm:inline-block ${behindRate ? 'text-red-100' : 'opacity-50'}`}>/ {expectedOvers.toFixed(1)} Exp</span>
      </div>
      
      {behindRate && (
        <span className="text-[9px] bg-white text-red-600 px-1.5 py-0.5 rounded uppercase tracking-widest font-black ml-1 shadow-sm">
          WARNING
        </span>
      )}
    </div>
  );
}
