
import React from 'react';
import { BowlingCardRow } from '../scorer/scorecard/types.ts';

export const BowlingScorecard: React.FC<{ rows: BowlingCardRow[] }> = ({ rows }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
              <th className="px-6 py-4">Bowler</th>
              <th className="px-4 py-4 text-center">O</th>
              <th className="px-4 py-4 text-center">M</th>
              <th className="px-4 py-4 text-center">R</th>
              <th className="px-4 py-4 text-center">W</th>
              <th className="px-4 py-4 text-right pr-6">Econ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {rows.map(r => (
              <tr key={r.playerId} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {r.name}
                  </span>
                </td>
                <td className="px-4 py-4 text-center text-slate-300 font-bold">{r.overs}</td>
                <td className="px-4 py-4 text-center text-slate-500 font-medium">{r.maidens}</td>
                <td className="px-4 py-4 text-center text-white font-black">{r.runs}</td>
                <td className="px-4 py-4 text-center text-emerald-500 font-black">{r.wickets}</td>
                <td className="px-4 py-4 text-right pr-6 text-amber-500 font-black tabular-nums">{r.economy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
