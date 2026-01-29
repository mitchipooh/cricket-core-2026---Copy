
import React, { useState } from 'react';
import { MatchFixture } from '../types.ts';

interface MediaStudioProps {
  onBack: () => void;
  fixtures: MatchFixture[];
  isEmbedded?: boolean;
}

export const MediaStudio: React.FC<MediaStudioProps> = ({ onBack, fixtures, isEmbedded = false }) => {
  const [selectedFixture, setSelectedFixture] = useState<MatchFixture | null>(null);
  const [theme, setTheme] = useState<'LIGHT' | 'DARK' | 'NEON'>('LIGHT');

  return (
    <div className={`animate-in slide-in-from-bottom-8 duration-500 pb-20 ${isEmbedded ? '' : 'pt-0'}`}>
       
       {!isEmbedded && (
         <div className="flex items-center gap-6 mb-10">
            <button onClick={onBack} className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-black transition-all shadow-sm">←</button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Studio</span></h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Generate engaging league assets</p>
            </div>
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg">
                <h3 className="text-xl font-black text-slate-900 mb-6">Social Generator</h3>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Source Match</label>
                      <select 
                        onChange={(e) => setSelectedFixture(fixtures.find(f => f.id === e.target.value) || null)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 font-bold outline-none"
                      >
                         <option value="">-- Choose Fixture --</option>
                         {fixtures.map(f => <option key={f.id} value={f.id}>{f.teamAName} vs {f.teamBName}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Visual Theme</label>
                      <div className="flex gap-2">
                         {(['LIGHT', 'DARK', 'NEON'] as const).map(t => (
                            <button key={t} onClick={() => setTheme(t)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${theme === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>{t}</button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="bg-slate-100 p-8 rounded-[2.5rem] border border-slate-200 flex items-center justify-center relative overflow-hidden">
             {selectedFixture ? (
                <div className={`aspect-[4/5] w-full max-w-sm rounded-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-500 ${theme === 'LIGHT' ? 'bg-white text-black' : theme === 'NEON' ? 'bg-black border-2 border-pink-500 text-white' : 'bg-slate-900 text-white'}`}>
                   <div className="z-10 text-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-8">Match Day Live</div>
                      <div className="flex justify-between items-center mb-6 px-4">
                         <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black mb-2 text-black">{selectedFixture.teamAName.charAt(0)}</div>
                            <span className="font-black text-xl leading-none">{selectedFixture.teamAScore || '0/0'}</span>
                         </div>
                         <div className="text-3xl font-black opacity-30">VS</div>
                         <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-black mb-2 text-black">{selectedFixture.teamBName.charAt(0)}</div>
                            <span className="font-black text-xl leading-none">{selectedFixture.teamBScore || '0/0'}</span>
                         </div>
                      </div>
                      <div className="py-2 px-6 rounded-lg inline-block text-[10px] font-black uppercase tracking-widest bg-black text-white">{selectedFixture.status}</div>
                   </div>
                </div>
             ) : (
                <div className="text-slate-400 font-bold uppercase text-xs">Configure your graphic on the left</div>
             )}
          </div>
       </div>
    </div>
  );
};
