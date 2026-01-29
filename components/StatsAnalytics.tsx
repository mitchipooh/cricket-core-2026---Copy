
import React, { useState } from 'react';
import { Team } from '../types';
import { calculateDLSTarget } from '../utils/cricket-engine.ts';

interface StatsProps {
  teams: Team[];
}

export const StatsAnalytics: React.FC<StatsProps> = ({ teams }) => {
  const [dlsData, setDlsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dlsForm, setDlsForm] = useState({
    score: 150,
    wickets: 4,
    overs: 12.4,
    target: 200,
    weather: "Overcast with light drizzle"
  });

  const runDLS = async () => {
    setIsLoading(true);
    // Simulate a small delay for the engine calculation
    setTimeout(() => {
      // Using the local mathematical engine instead of Gemini AI
      // Note: calculateDLSTarget expects (firstInningsTotal, oversLost, wicketsDown, totalOvers)
      // Here we approximate based on the form inputs for a quick dashboard calculation
      const oversLost = 20 - dlsForm.overs; 
      const revised = calculateDLSTarget(
        dlsForm.target - 1, // first innings total
        oversLost,
        dlsForm.wickets,
        20 // standard T20 overs
      );

      setDlsData({
        revisedTarget: revised,
        tacticalAdvice: "Based on current mathematical trends, maintain the run rate and protect wickets to stay ahead of the par score.",
        winningProbability: Math.min(100, Math.max(0, 50 + (dlsForm.score / dlsForm.target * 50) - (dlsForm.wickets * 10)))
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white">Player Analytics & Engine Logic</h1>
        <p className="text-slate-400">Deep career insights and professional DLS mathematical modeling.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DLS Module */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌧️</span>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">DLS Target Calculator</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Current Score</label>
              <input 
                type="number" 
                value={dlsForm.score} 
                onChange={e => setDlsForm({...dlsForm, score: Number(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Wickets Down</label>
              <input 
                type="number" 
                value={dlsForm.wickets} 
                onChange={e => setDlsForm({...dlsForm, wickets: Number(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Overs Completed</label>
              <input 
                type="number" 
                value={dlsForm.overs} 
                onChange={e => setDlsForm({...dlsForm, overs: Number(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Initial Target</label>
              <input 
                type="number" 
                value={dlsForm.target} 
                onChange={e => setDlsForm({...dlsForm, target: Number(e.target.value)})}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white" 
              />
            </div>
          </div>

          <button 
            onClick={runDLS}
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? 'Processing Standard Logic...' : 'Calculate Revised Target'}
          </button>

          {dlsData && (
            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-indigo-400">REVISED TARGET</span>
                <span className="text-4xl font-black text-white">{dlsData.revisedTarget}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Mathematical Analysis</p>
              <p className="text-sm text-slate-300 italic mb-4">"{dlsData.tacticalAdvice}"</p>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000" 
                  style={{ width: `${dlsData.winningProbability}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase text-right">Win Probability: {Math.round(dlsData.winningProbability)}%</p>
            </div>
          )}
        </div>

        {/* Player Stats Table */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Top Performers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 font-bold border-b border-slate-700">
                  <th className="pb-4">PLAYER</th>
                  <th className="pb-4">TEAM</th>
                  <th className="pb-4">SR</th>
                  <th className="pb-4">AVG</th>
                  <th className="pb-4">WKT</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Virat Kohli', team: 'Lions XI', sr: 138.4, avg: 52.1, wkt: 4 },
                  { name: 'Rashid Khan', team: 'Tigers Utd', sr: 110.2, avg: 12.5, wkt: 24 },
                  { name: 'Babar Azam', team: 'Eagles', sr: 128.9, avg: 45.3, wkt: 0 },
                  { name: 'Ben Stokes', team: 'Falcons', sr: 145.1, avg: 33.8, wkt: 12 },
                ].map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 font-bold text-white">{p.name}</td>
                    <td className="py-4 text-slate-400">{p.team}</td>
                    <td className="py-4 text-slate-300 font-mono">{p.sr}</td>
                    <td className="py-4 text-slate-300 font-mono">{p.avg}</td>
                    <td className="py-4 text-indigo-400 font-bold">{p.wkt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full mt-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-all uppercase tracking-widest">
            Export League Stats (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
