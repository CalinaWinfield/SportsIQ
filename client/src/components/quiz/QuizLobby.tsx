import React from 'react';
import { Play, Zap, Flame, Shield, Eye, EyeOff, ZoomIn, Award, Sparkles, HelpCircle } from 'lucide-react';
import { QuizSettings, GameMode, VisualFilter } from '../../types/quiz.js';
import { QuizLeague } from '../../types/sports.js';
import { sounds } from '../../services/sounds.js';

interface QuizLobbyProps {
  settings: QuizSettings;
  setSettings: React.Dispatch<React.SetStateAction<QuizSettings>>;
  onStartQuiz: () => void;
  loading: boolean;
  totalTeamsCount: number;
}

const LEAGUES: Array<{ id: QuizLeague; name: string; tag: string; icon: string; desc: string }> = [
  { id: 'all', name: 'All-Star Mix', tag: 'Ultimate', icon: '🌟', desc: 'Random mix of NFL, NBA, CFB & WNBA' },
  { id: 'nfl', name: 'NFL Football', tag: '32 Teams', icon: '🏈', desc: 'Gridiron glory from Chiefs to Cardinals' },
  { id: 'nba', name: 'NBA Basketball', tag: '30 Teams', icon: '🏀', desc: 'Hardwood classics from Celtics to Lakers' },
  { id: 'college-football', name: 'College Football (CFB)', tag: '7 Conferences', icon: '🎓', desc: 'SEC, Big Ten, Big 12, ACC, Sun Belt, SWAC & Pac-10' },
  { id: 'wnba', name: 'WNBA Basketball', tag: '15 Teams', icon: '⭐', desc: 'Aces, Liberty, Fever, Storm & stars' },
];

const MODES: Array<{ id: GameMode; name: string; icon: any; desc: string; badge: string }> = [
  { id: 'classic', name: 'Classic Quiz', icon: Award, desc: '10 or 20 questions with 15s timer per question', badge: 'Standard' },
  { id: 'blitz', name: 'Speed Blitz', icon: Zap, desc: '60-second speed frenzy! Rapid fire combo streaks', badge: 'High Energy' },
  { id: 'streak', name: 'Sudden Death', icon: Flame, desc: '3 strikes and you are out! How far can you go?', badge: 'Hardcore' },
];

const VISUAL_FILTERS: Array<{ id: VisualFilter; name: string; icon: any; desc: string }> = [
  { id: 'normal', name: 'Full HD Logo', icon: Eye, desc: 'Original high-res team crest' },
  { id: 'silhouette', name: 'Silhouette Mode', icon: EyeOff, desc: 'Pure black shadow shape only' },
  { id: 'zoomed', name: 'Zoomed In Crop', icon: ZoomIn, desc: 'Tight close-up of logo details' },
];

export const QuizLobby: React.FC<QuizLobbyProps> = ({
  settings,
  setSettings,
  onStartQuiz,
  loading,
  totalTeamsCount
}) => {
  const handleSelectLeague = (league: QuizLeague) => {
    sounds.playClick();
    setSettings(prev => ({ ...prev, league }));
  };

  const handleSelectMode = (mode: GameMode) => {
    sounds.playClick();
    setSettings(prev => ({ ...prev, mode }));
  };

  const handleSelectFilter = (filter: VisualFilter) => {
    sounds.playClick();
    setSettings(prev => ({ ...prev, filter }));
  };

  const handleSelectCount = (count: number) => {
    sounds.playClick();
    setSettings(prev => ({ ...prev, questionCount: count }));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>The Ultimate Sports Logo Test</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 font-sports uppercase">
          TEST YOUR <span className="text-sky-500">LOGO IQ</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2">
          From iconic NFL shields to top SEC, ACC, Big 12, Big Ten, SWAC, Pac-10, Sun Belt, and WNBA emblems.
          Select your league and challenge settings to begin.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1: Select League */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black shadow-xs">1</span>
              <span>Choose League</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {totalTeamsCount > 0 ? `${totalTeamsCount} logos ready` : 'Loading logos...'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {LEAGUES.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelectLeague(item.id)}
                className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                  settings.league === item.id
                    ? 'bg-sky-50/80 border-sky-400 shadow-md ring-2 ring-sky-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      settings.league === item.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.tag}
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">{item.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Game Mode */}
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black shadow-xs">2</span>
            <span>Game Mode</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map(mode => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => handleSelectMode(mode.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    settings.mode === mode.id
                      ? 'bg-sky-50/80 border-sky-400 shadow-md ring-2 ring-sky-400/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${settings.mode === mode.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                      {mode.badge}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900">{mode.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{mode.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Visual Difficulty & Question Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visual Challenge */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black shadow-xs">3</span>
              <span>Visual Challenge Mode</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {VISUAL_FILTERS.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFilter(f.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      settings.filter === f.id
                        ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${settings.filter === f.id ? 'text-sky-500' : ''}`} />
                    <span className="text-xs font-bold leading-tight">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count (Only for Classic Mode) */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black shadow-xs">4</span>
              <span>Quiz Length {settings.mode !== 'classic' && '(Fixed for mode)'}</span>
            </h2>

            {settings.mode === 'classic' ? (
              <div className="grid grid-cols-2 gap-2">
                {[10, 20].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => handleSelectCount(cnt)}
                    className={`py-3 px-4 rounded-xl border text-center transition-all font-bold text-sm ${
                      settings.questionCount === cnt
                        ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  {settings.mode === 'blitz'
                    ? 'Speed Blitz runs continuously for 60 seconds with unlimited questions.'
                    : 'Sudden Death continues until you lose all 3 lives.'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Big Start Button */}
        <div className="pt-4">
          <button
            onClick={onStartQuiz}
            disabled={loading}
            className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xl tracking-wider uppercase font-sports shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <span>Preparing Sports Arena...</span>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>START QUIZ NOW</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
