
import React, { useState } from 'react';
import { MatchFixture, Team, MediaPost } from '../types.ts';
import { MediaStudio } from './MediaStudio.tsx';
import { MediaFeed } from './MediaFeed.tsx';

interface MediaCenterProps {
  onBack: () => void;
  fixtures: MatchFixture[];
  teams: Team[];
  mediaPosts: MediaPost[];
  onAddMediaPost: (post: MediaPost) => void;
}

export const MediaCenter: React.FC<MediaCenterProps> = ({ onBack, fixtures, teams, mediaPosts, onAddMediaPost }) => {
  const [activeTab, setActiveTab] = useState<'FEED' | 'STUDIO'>('FEED');

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-500 pb-20">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-black transition-all shadow-sm">←</button>
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Media Center</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Fan Engagement & Content Creation</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm self-start md:self-auto">
             <button 
               onClick={() => setActiveTab('FEED')} 
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FEED' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Live Feed
             </button>
             <button 
               onClick={() => setActiveTab('STUDIO')} 
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'STUDIO' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Creator Studio
             </button>
          </div>
       </div>

       {activeTab === 'FEED' ? (
         <MediaFeed 
            fixtures={fixtures} 
            teams={teams} 
            mediaPosts={mediaPosts} 
            onAddMediaPost={onAddMediaPost}
         />
       ) : (
         <MediaStudio onBack={() => setActiveTab('FEED')} fixtures={fixtures} isEmbedded={true} />
       )}
    </div>
  );
};
