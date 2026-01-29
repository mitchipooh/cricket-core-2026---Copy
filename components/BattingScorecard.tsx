
import React from 'react';
import { BattingCardRow } from '../scorer/scorecard/types.ts';

export const BattingScorecard: React.FC<{ rows: BattingCardRow[] }> = ({ rows }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
              <th className="px-6 py-4">Batter</th>
              <th className="px-4 py-4 text-center">R</th>
              <th className="px-4 py-4 text-center">B</th>
              <th className="px-4 py-4 text-center">4s</th>
              <th className="px-4 py-4 text-center">6s</th>
              <th className="px-4 py-4 text-right pr-6">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {rows.map(r => (
              <tr key={r.playerId} className={`group hover:bg-white/5 transition-colors ${r.atCrease ? 'bg-indigo-500/5' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className={`text-sm font-black ${r.atCrease ? 'text-indigo-400' : 'text-slate-200'}`}>
                      {r.name}{r.atCrease ? '*' : ''}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5 italic">
                      {r.isOut ? r.dismissal : r.atCrease ? 'not out' : ''}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-black text-white">{r.runs}</td>
                <td className="px-4 py-4 text-center text-slate-400 font-bold">{r.balls}</td>
                <td className="px-4 py-4 text-center text-slate-500 font-medium">{r.fours}</td>
                <td className="px-4 py-4 text-center text-slate-500 font-medium">{r.sixes}</td>
                <td className="px-4 py-4 text-right pr-6 text-indigo-500 font-black tabular-nums">{r.strikeRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
