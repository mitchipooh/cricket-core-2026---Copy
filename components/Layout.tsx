
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  profile: UserProfile;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, profile, theme, onThemeToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNavClick = (tab: any) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} relative overflow-x-hidden transition-colors duration-300`}>
      <div className="fixed top-4 left-4 lg:top-8 lg:left-8 z-50 flex items-center gap-4">
        <button 
          onClick={() => { setIsMenuOpen(!isMenuOpen); setIsSettingsOpen(false); }}
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 shadow-2xl ${
            isMenuOpen 
              ? 'bg-slate-800 text-white rotate-90' 
              : 'bg-indigo-600 text-white hover:scale-105 active:scale-95 shadow-indigo-600/40'
          }`}
        >
          <span className={`w-6 h-1 bg-current rounded-full transition-all ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
          <span className={`w-6 h-1 bg-current rounded-full transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-1 bg-current rounded-full transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
        </button>
        
        {!isMenuOpen && (
          <div className="hidden md:flex items-center gap-3 bg-slate-900/10 backdrop-blur-md p-1 pr-4 rounded-2xl border border-white/10 shadow-sm">
             <div className="flex flex-col px-3 py-1">
                <h1 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Cricket-Core</h1>
                <span className="text-xs text-indigo-500 font-black uppercase tracking-widest">{activeTab === 'home' ? 'Home Center' : activeTab}</span>
             </div>
             {activeTab === 'scorer' && (
               <button 
                 onClick={() => onTabChange('setup')} 
                 className="h-8 px-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                 title="Start New Match"
               >
                 <span className="font-black text-sm">+</span>
                 <span className="text-[10px] font-black uppercase tracking-widest">New</span>
               </button>
             )}
          </div>
        )}
      </div>

      <div className="fixed top-4 right-4 lg:top-8 lg:right-8 z-50">
        <button 
          onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsMenuOpen(false); }}
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl ${
            isSettingsOpen ? 'bg-slate-800 text-white rotate-180' : 'bg-white/10 backdrop-blur-md text-slate-400 border border-white/5'
          }`}
        >
          <span className="text-xl">⚙️</span>
        </button>
      </div>

      <div className={`fixed inset-0 bg-slate-950/90 backdrop-blur-md z-40 transition-opacity duration-300 ${isMenuOpen || isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => { setIsMenuOpen(false); setIsSettingsOpen(false); }} />

      <nav className={`fixed top-0 left-0 h-full w-80 bg-slate-900 p-8 flex flex-col gap-6 shadow-2xl z-50 transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white">C</div>
          <div>
            <h1 className="text-xl font-black text-white">CRICKET CORE</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v2.6.0 PRO</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {['home', 'scorer', 'stats'].map(tab => (
            <button 
              key={tab}
              onClick={() => handleNavClick(tab)}
              className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span className="text-xl">{tab === 'home' ? '🏠' : tab === 'scorer' ? '🏏' : '📊'}</span>
              <span className="font-black uppercase text-xs tracking-widest">{tab}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-8 border-t border-white/5">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-black">{profile.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-black text-white truncate">{profile.name}</p>
                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{profile.role}</p>
              </div>
           </div>
           <button onClick={onThemeToggle} className="w-full mt-6 py-3 bg-slate-800 rounded-xl text-xs font-black uppercase text-indigo-400 tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
           </button>
        </div>
      </nav>

      <main className="min-h-screen pt-20 lg:pt-24 pb-8 px-4 lg:px-12">
        <div className="max-w-[1920px] mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
