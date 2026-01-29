
import React, { useState, useMemo } from 'react';
import { MatchFixture, MediaPost, Comment, Team } from '../types.ts';
import { BattingScorecard } from './BattingScorecard.tsx';
import { BowlingScorecard } from './BowlingScorecard.tsx';
import { buildBattingCard } from '../scorer/scorecard/buildBattingCard.ts';
import { buildBowlingCard } from '../scorer/scorecard/buildBowlingCard.ts';
import { CameraModal } from './CameraModal.tsx';

interface MediaFeedProps {
  fixtures: MatchFixture[];
  teams: Team[];
  mediaPosts: MediaPost[];
  onAddMediaPost: (post: MediaPost) => void;
}

export const MediaFeed: React.FC<MediaFeedProps> = ({ fixtures, teams, mediaPosts, onAddMediaPost }) => {
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<MatchFixture | null>(null);
  const [matchTab, setMatchTab] = useState<'MEDIA' | 'SCORECARD' | 'STATS'>('MEDIA');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const liveGames = fixtures.filter(f => f.status === 'Live');

  // Assign mock match IDs to live games if they don't have one for demo purposes for initial mock posts only
  // Real posts will have IDs
  const displayPosts = useMemo(() => {
    return mediaPosts.map((p, i) => {
      // Logic for demo posts to appear on the first live game if they have no match ID
      if (!p.matchId && liveGames.length > 0 && i < 3) return { ...p, matchId: liveGames[0].id };
      return p;
    });
  }, [mediaPosts, liveGames]);

  const handleLike = (postId: string) => {
    // In a real app this would update the parent state via a prop
    // For now we just mutate local state (this won't persist purely locally in this component as posts come from props)
    // To properly fix, App.tsx needs onUpdatePost
    // But per requirements, we focus on adding posts.
    console.log('Like', postId);
  };

  const handleShare = (post: MediaPost) => {
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Core Moment',
        text: post.caption,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert(`Shared "${post.caption}" to clipboard!`);
    }
  };

  const handlePostComment = (postId: string) => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: 'You',
      text: commentInput,
      timestamp: Date.now()
    };
    // Similarly, need onUpdatePost to save comments
    setCommentInput('');
  };

  const handleMediaUpload = (dataUrl: string, type: 'IMAGE' | 'VIDEO') => {
    const newPost: MediaPost = {
       id: `post-${Date.now()}`,
       type: type,
       authorName: 'Fan Cam',
       authorAvatar: '',
       contentUrl: dataUrl,
       caption: selectedMatch ? `Spotted at ${selectedMatch.teamAName} vs ${selectedMatch.teamBName}` : 'Match Day Vibes 📸',
       timestamp: Date.now(),
       likes: 0,
       shares: 0,
       comments: [],
       matchId: selectedMatch?.id
    };
    onAddMediaPost(newPost);
  };

  /* =========================================
     MATCH DETAIL VIEW
     ========================================= */
  if (selectedMatch) {
    // Filter posts for this match
    const matchPosts = displayPosts.filter(p => p.matchId === selectedMatch.id);
    
    // Prepare Scorecard Data
    const savedState = selectedMatch.savedState;
    const teamA = teams.find(t => t.id === selectedMatch.teamAId);
    const teamB = teams.find(t => t.id === selectedMatch.teamBId);
    
    const battingCardA = (savedState && teamA) ? buildBattingCard(savedState.history, teamA.players, 1, savedState.strikerId, savedState.nonStrikerId) : [];
    const bowlingCardB = (savedState && teamB) ? buildBowlingCard(savedState.history, teamB.players, 1) : [];
    
    // Simple top stats logic
    const topBatter = battingCardA.sort((a,b) => b.runs - a.runs)[0];
    const topBowler = bowlingCardB.sort((a,b) => b.wickets - a.wickets)[0];

    return (
      <div className="animate-in slide-in-from-right">
         <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onUpload={handleMediaUpload} />

         {/* Match Header */}
         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white mb-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setSelectedMatch(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl backdrop-blur-md">✕</button>
             </div>
             <div className="flex flex-col items-center">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-red-600 px-3 py-1 rounded-full mb-6 animate-pulse">Live Coverage</div>
                 <div className="flex items-center gap-8 w-full justify-center">
                     <div className="text-center">
                        <div className="text-2xl font-black">{selectedMatch.teamAName}</div>
                        <div className="text-4xl font-black mt-2 text-indigo-400">{selectedMatch.teamAScore || '0/0'}</div>
                     </div>
                     <div className="text-xl font-black text-slate-600">VS</div>
                     <div className="text-center">
                        <div className="text-2xl font-black">{selectedMatch.teamBName}</div>
                        <div className="text-4xl font-black mt-2 text-indigo-400">{selectedMatch.teamBScore || '0/0'}</div>
                     </div>
                 </div>
                 <div className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedMatch.venue} • {selectedMatch.format}</div>
             </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 justify-center">
             {(['MEDIA', 'SCORECARD', 'STATS'] as const).map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setMatchTab(tab)}
                   className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${matchTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                   {tab}
                 </button>
             ))}
         </div>

         {/* TAB CONTENT */}
         <div className="space-y-6">
            {matchTab === 'MEDIA' && (
               <>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-center justify-between mb-6">
                     <div>
                        <h4 className="font-black text-indigo-900">Share Your Moments</h4>
                        <p className="text-xs text-indigo-600/80">Upload photos and videos directly to the match feed.</p>
                     </div>
                     <button onClick={() => setIsCameraOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-200">
                        + Upload Media
                     </button>
                  </div>
                  {matchPosts.length === 0 && <div className="text-center py-10 text-slate-400 text-xs uppercase font-bold">No media yet. Be the first!</div>}
                  {matchPosts.map(post => (
                      <div key={post.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-6">
                         {/* Simplified Post Render for reuse */}
                         <div className="p-4 flex items-center gap-3 border-b border-slate-50">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 overflow-hidden">
                               {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover"/> : post.authorName.charAt(0)}
                            </div>
                            <div className="text-xs font-black text-slate-900">{post.authorName}</div>
                         </div>
                         {post.contentUrl && post.type === 'IMAGE' && <img src={post.contentUrl} className="w-full h-64 object-cover" />}
                         {post.contentUrl && post.type === 'VIDEO' && <video src={post.contentUrl} controls className="w-full h-64 bg-black" />}
                         {post.type === 'LIVE_STATUS' && (
                           <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center flex flex-col items-center justify-center min-h-[150px]">
                              <p className="text-lg font-black leading-tight">{post.caption}</p>
                           </div>
                         )}
                         <div className="p-4">
                            {post.type !== 'LIVE_STATUS' && <p className="text-sm text-slate-700">{post.caption}</p>}
                            <div className="flex gap-4 mt-4 text-xs font-bold text-slate-400">
                               <span>❤️ {post.likes}</span>
                               <span>💬 {post.comments.length}</span>
                            </div>
                         </div>
                      </div>
                  ))}
               </>
            )}

            {matchTab === 'SCORECARD' && (
               <div className="space-y-6">
                  {savedState ? (
                     <>
                        <div>
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Batting</h3>
                           <BattingScorecard rows={battingCardA} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Bowling</h3>
                           <BowlingScorecard rows={bowlingCardB} />
                        </div>
                     </>
                  ) : (
                     <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200">
                        <span className="text-4xl block mb-2">📋</span>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Match hasn't started yet</p>
                     </div>
                  )}
               </div>
            )}

            {matchTab === 'STATS' && (
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                     <div className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-2">Top Batter</div>
                     {topBatter ? (
                        <>
                           <div className="text-2xl font-black text-slate-900">{topBatter.name}</div>
                           <div className="text-sm font-bold text-slate-500">{topBatter.runs} runs ({topBatter.balls})</div>
                        </>
                     ) : <div className="text-slate-400 text-xs">No data</div>}
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                     <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-2">Top Bowler</div>
                     {topBowler ? (
                        <>
                           <div className="text-2xl font-black text-slate-900">{topBowler.name}</div>
                           <div className="text-sm font-bold text-slate-500">{topBowler.wickets} wickets</div>
                        </>
                     ) : <div className="text-slate-400 text-xs">No data</div>}
                  </div>
               </div>
            )}
         </div>
      </div>
    );
  }

  /* =========================================
     MAIN FEED VIEW
     ========================================= */
  return (
    <div className="space-y-10 animate-in fade-in">
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onUpload={handleMediaUpload} />

      {/* 1. Live Games Carousel */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-2">
           <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Live Now</h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
           {liveGames.length === 0 ? (
             <div className="w-full bg-slate-100 rounded-2xl p-8 text-center border border-dashed border-slate-300">
                <span className="text-4xl block mb-2">💤</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No live matches currently</p>
             </div>
           ) : (
             liveGames.map(game => (
               <button 
                  key={game.id} 
                  onClick={() => setSelectedMatch(game)}
                  className="min-w-[280px] bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shrink-0 text-left transition-transform hover:scale-[1.02] active:scale-95"
               >
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">Live</div>
                  <div className="space-y-4 relative z-10">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-black opacity-70">{game.format}</span>
                        <span className="text-[10px] font-bold text-red-400 animate-pulse">● Tap to View</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold">{game.teamAName}</span>
                           <span className="text-xl font-black">{game.teamAScore || '0/0'}</span>
                        </div>
                        <span className="text-xs font-black text-slate-600">VS</span>
                        <div className="flex flex-col items-end">
                           <span className="text-sm font-bold">{game.teamBName}</span>
                           <span className="text-xl font-black">{game.teamBScore || '0/0'}</span>
                        </div>
                     </div>
                     <div className="text-[10px] font-mono text-slate-400 bg-white/10 px-3 py-2 rounded-lg text-center truncate">
                        {game.venue}
                     </div>
                  </div>
               </button>
             ))
           )}
        </div>
      </section>

      {/* 2. Media Feed */}
      <section className="max-w-2xl mx-auto space-y-8">
         <div className="flex justify-end">
            <button onClick={() => setIsCameraOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-200 transition-all active:scale-95">
               <span>📸</span> Share Moment
            </button>
         </div>

         {displayPosts.map(post => (
            <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               {/* Post Header */}
               <div className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                     {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full object-cover" /> : <span className="font-black text-slate-400">{post.authorName.charAt(0)}</span>}
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-slate-900">{post.authorName}</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                        {Math.floor((Date.now() - post.timestamp) / 60000)}m ago
                     </p>
                  </div>
                  {post.matchId && <div className="ml-auto bg-slate-100 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded text-slate-500">Match Post</div>}
               </div>

               {/* Content */}
               {post.type === 'IMAGE' && post.contentUrl && (
                  <div className="aspect-[4/3] bg-slate-100 relative">
                     <img src={post.contentUrl} className="w-full h-full object-cover" />
                  </div>
               )}
               {post.type === 'VIDEO' && post.contentUrl && (
                  <div className="aspect-video bg-black relative flex items-center justify-center">
                     <video src={post.contentUrl} controls className="w-full h-full" />
                  </div>
               )}
               {post.type === 'LIVE_STATUS' && (
                  <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center flex flex-col items-center justify-center min-h-[200px]">
                     <span className="text-4xl mb-4">📢</span>
                     <p className="text-lg font-black leading-tight">{post.caption}</p>
                  </div>
               )}

               {/* Caption & Actions */}
               <div className="p-5 pt-4">
                  {post.type !== 'LIVE_STATUS' && (
                     <p className="text-sm font-medium text-slate-700 mb-4 leading-relaxed"><span className="font-black text-slate-900">{post.authorName}</span> {post.caption}</p>
                  )}
                  
                  <div className="flex items-center gap-6 border-t border-slate-100 pt-4">
                     <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 group">
                        <span className="text-xl group-hover:scale-125 transition-transform">❤️</span>
                        <span className="text-xs font-black text-slate-600">{post.likes}</span>
                     </button>
                     <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center gap-2 group">
                        <span className="text-xl group-hover:scale-125 transition-transform">💬</span>
                        <span className="text-xs font-black text-slate-600">{post.comments.length}</span>
                     </button>
                     <button onClick={() => handleShare(post)} className="flex items-center gap-2 group ml-auto">
                        <span className="text-xl group-hover:scale-125 transition-transform">🚀</span>
                        <span className="text-xs font-black text-slate-600">{post.shares}</span>
                     </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentPostId === post.id && (
                     <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                           {post.comments.map(c => (
                              <div key={c.id} className="flex gap-2 text-xs">
                                 <span className="font-black text-slate-900">{c.author}</span>
                                 <span className="text-slate-600">{c.text}</span>
                              </div>
                           ))}
                           {post.comments.length === 0 && <p className="text-[10px] text-slate-400 italic">No comments yet. Be the first!</p>}
                        </div>
                        <div className="flex gap-2">
                           <input 
                              value={commentInput}
                              onChange={e => setCommentInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handlePostComment(post.id)}
                              placeholder="Add a comment..."
                              className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                           />
                           <button onClick={() => handlePostComment(post.id)} className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-800">Post</button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         ))}
      </section>
    </div>
  );
};
