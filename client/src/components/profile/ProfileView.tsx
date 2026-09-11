import React, { useState, useEffect } from 'react';
import { User, UserStats } from '../../types/auth.js';
import { FavoriteTeam } from '../../types/sports.js';
import { api } from '../../services/api.js';
import { Trophy, Flame, Target, Award, LogOut, Clock, ShieldCheck, Heart, Sparkles, Check } from 'lucide-react';
import { sounds } from '../../services/sounds.js';
import { AVATAR_LIST, AvatarBadge } from '../AvatarBadge.js';

interface ProfileViewProps {
  user: User | null;
  favorites: FavoriteTeam[];
  onLogout: () => void;
  onPromptAuth: () => void;
  onNavigateToHub: () => void;
  onStartQuiz: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  favorites,
  onLogout,
  onPromptAuth,
  onNavigateToHub,
  onStartQuiz
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);

  useEffect(() => {
    if (user && !user.id.startsWith('guest_')) {
      setLoading(true);
      Promise.all([api.getUserStats(), api.getUserHistory()])
        .then(([userStats, userHistory]) => {
          setStats(userStats);
          setHistory(userHistory);
        })
        .catch(err => console.error('Error fetching user stats:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleAvatarChange = async (avatarId: string) => {
    sounds.playClick();
    try {
      await api.updateProfile(avatarId);
      if (user) {
        user.avatar = avatarId;
      }
      setIsChangingAvatar(false);
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  };

  if (!user || user.id.startsWith('guest_')) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 text-center animate-fade-in">
        <div className="sports-card rounded-3xl p-10 border border-slate-200 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-4 text-sky-500 shadow-2xs">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase font-sports tracking-wide">
            GUEST PLAYER PROFILE
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            You are currently exploring SportIQ in Guest Mode. Create a permanent account to save your career scores, unlock achievements, track favorite teams, and rank on the global leaderboard!
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onPromptAuth}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/25 transition-all"
            >
              Create Account / Sign In
            </button>
            <button
              onClick={onStartQuiz}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Play Logo Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Profile Header Card */}
      <div className="sports-card rounded-3xl p-6 sm:p-8 border border-slate-200 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Clickable Avatar Badge */}
            <div
              className="relative group cursor-pointer"
              onClick={() => setIsChangingAvatar(!isChangingAvatar)}
              title="Click to change avatar"
            >
              <AvatarBadge avatar={user.avatar} size="xl" />
              <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Change
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{user.username}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
                  Verified Member
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onStartQuiz}
              className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              Play Quiz
            </button>
            <button
              onClick={onLogout}
              className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Avatar Selection Picker Dropdown */}
        {isChangingAvatar && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
            <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Select Your Sports Avatar:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {AVATAR_LIST.map(item => {
                const isSelected = user.avatar === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAvatarChange(item.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-400 text-sky-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <AvatarBadge avatar={item.id} size="sm" />
                    <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Career Stats Grid */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-sky-500" />
          <span>Career Stats Overview</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="sports-card rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Total Quizzes</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sports">
              {stats?.totalGames || 0}
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Overall Accuracy</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sports">
              {stats?.overallAccuracy || 0}%
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Highest Streak</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sports">
              {stats?.bestStreak || 0}
            </div>
          </div>

          <div className="sports-card rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Career High Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sports">
              {(stats?.highestScore || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Followed Teams Overview */}
      <div className="sports-card rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Heart className="w-4 h-4 text-sky-500 fill-sky-500" />
            <span>Your Followed ESPN Teams ({favorites.length})</span>
          </h2>
          <button
            onClick={onNavigateToHub}
            className="text-xs text-sky-600 hover:text-sky-700 hover:underline font-bold"
          >
            Open FanHub →
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="text-xs text-slate-500 py-3 italic">
            You are not following any sports teams yet. Head over to the ESPN FanHub to follow your teams!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {favorites.map(fav => (
              <div
                key={`${fav.league}_${fav.teamId}`}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs"
              >
                {fav.logoUrl && (
                  <img src={fav.logoUrl} alt={fav.teamName} className="w-5 h-5 object-contain" />
                )}
                <span className="text-xs font-bold text-slate-800">{fav.teamName}</span>
                <span className="text-[9px] font-mono uppercase text-slate-500 px-1 py-0.2 rounded bg-slate-200">
                  {fav.league.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Match History */}
      <div className="sports-card rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Recent Quiz History
          </h3>
          <span className="text-xs text-slate-500 font-mono">Last {history.length} games</span>
        </div>

        {history.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No games played on this account yet. Jump into the arena and take your first quiz!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="py-2.5 px-4">League</th>
                  <th className="py-2.5 px-4">Mode</th>
                  <th className="py-2.5 px-4">Score</th>
                  <th className="py-2.5 px-4">Accuracy</th>
                  <th className="py-2.5 px-4">Streak</th>
                  <th className="py-2.5 px-4 text-right">Played</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 10).map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono uppercase text-slate-900 font-bold">
                      {h.league}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700">
                      {h.mode}
                    </td>
                    <td className="py-3 px-4 font-sports text-base font-bold text-slate-900">
                      {h.score?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-600 font-bold">
                      {h.accuracy}%
                    </td>
                    <td className="py-3 px-4 text-amber-600 font-mono font-bold">
                      {h.streak}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
