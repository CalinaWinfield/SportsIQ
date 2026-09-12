import React from 'react';
import { Trophy, Tv, Award, User as UserIcon, Volume2, VolumeX, Radio, LogIn } from 'lucide-react';
import { User } from '../types/auth.js';
import { sounds } from '../services/sounds.js';
import { AvatarBadge } from './AvatarBadge.js';

interface NavbarProps {
  currentTab: 'quiz' | 'fanhub' | 'leaderboard' | 'profile' | 'forgot-password';
  setCurrentTab: (tab: 'quiz' | 'fanhub' | 'leaderboard' | 'profile' | 'forgot-password') => void;
  user: User | null;
  onOpenAuth: () => void;
  showTicker: boolean;
  setShowTicker: React.Dispatch<React.SetStateAction<boolean>>;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  favoriteCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  onOpenAuth,
  showTicker,
  setShowTicker,
  isMuted,
  setIsMuted,
  favoriteCount
}) => {
  const handleTabClick = (tab: 'quiz' | 'fanhub' | 'leaderboard' | 'profile') => {
    sounds.playClick();
    setCurrentTab(tab);
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-md shadow-xs">
      {/* Top Light Blue Accent Line */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleTabClick('quiz')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="font-extrabold text-2xl tracking-tighter text-slate-900">SPORT</span>
                <span className="font-extrabold text-2xl tracking-tighter text-sky-500 ml-0.5">IQ</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1 flex items-center gap-1.5">
                <span>NFL</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>NBA</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>CFB</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>WNBA</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleTabClick('quiz')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                currentTab === 'quiz'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Logo Quiz</span>
            </button>

            <button
              onClick={() => handleTabClick('fanhub')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${
                currentTab === 'fanhub'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>ESPN FanHub</span>
              {favoriteCount > 0 && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  currentTab === 'fanhub' ? 'bg-white text-sky-600' : 'bg-sky-500 text-white'
                }`}>
                  {favoriteCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('leaderboard')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                currentTab === 'leaderboard'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => handleTabClick('profile')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                currentTab === 'profile'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>My Career</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live Ticker Toggle */}
            <button
              onClick={() => setShowTicker(!showTicker)}
              title={showTicker ? "Hide Scores Ticker" : "Show Scores Ticker"}
              className={`p-2 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
                showTicker
                  ? 'bg-sky-50 text-sky-600 border-sky-200 font-bold'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span className="hidden lg:inline text-xs font-semibold">Scores</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-sky-500" />}
            </button>

            {/* User Account / Auth Button */}
            {user ? (
              <button
                onClick={() => handleTabClick('profile')}
                className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
              >
                <AvatarBadge avatar={user.avatar} size="sm" />
                <div className="hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-900 leading-tight max-w-[100px] truncate">
                    {user.username}
                  </div>
                  <div className="text-[10px] text-sky-600 font-bold leading-none">Online</div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-sky-500/25 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-1">
        <button
          onClick={() => handleTabClick('quiz')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            currentTab === 'quiz' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Quiz</span>
        </button>
        <button
          onClick={() => handleTabClick('fanhub')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg relative ${
            currentTab === 'fanhub' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>FanHub</span>
          {favoriteCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-sky-500" />
          )}
        </button>
        <button
          onClick={() => handleTabClick('leaderboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            currentTab === 'leaderboard' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Leaders</span>
        </button>
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-lg ${
            currentTab === 'profile' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Career</span>
        </button>
      </div>
    </header>
  );
};
