import React, { useState, useEffect } from 'react';
import { Award, Trophy, Flame, Target, Filter, Clock, RefreshCw } from 'lucide-react';
import { LeaderboardEntry } from '../../types/auth.js';
import { api } from '../../services/api.js';
import { sounds } from '../../services/sounds.js';

interface LeaderboardViewProps {
  currentUsername?: string;
  onStartQuiz: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUsername, onStartQuiz }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [league, setLeague] = useState('all');
  const [mode, setMode] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard(league, mode);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [league, mode]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="font-mono font-bold text-slate-400 text-sm">#{rank}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black uppercase tracking-widest mb-3 shadow-2xs">
          <Award className="w-3.5 h-3.5 text-sky-500" />
          <span>Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase font-sports tracking-wide">
          GLOBAL <span className="text-sky-500">LEADERBOARD</span>
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
          See the highest logo IQ scores achieved across NFL, NBA, College Football, and WNBA.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="sports-card rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        {/* League Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['all', 'nfl', 'nba', 'college-football', 'wnba'] as const).map(l => (
            <button
              key={l}
              onClick={() => { sounds.playClick(); setLeague(l); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                league === l ? 'bg-sky-500 text-white font-black shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {l === 'all' ? 'All Leagues' : l === 'college-football' ? 'CFB' : l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Mode Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {(['all', 'classic', 'blitz', 'streak'] as const).map(m => (
              <button
                key={m}
                onClick={() => { sounds.playClick(); setMode(m); }}
                className={`px-2.5 py-1 rounded-lg uppercase text-[11px] transition-all ${
                  mode === m ? 'bg-white text-sky-700 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLeaderboard}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="sports-card rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
            Loading top scores...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Trophy className="w-12 h-12 mx-auto text-slate-400" />
            <div className="text-slate-900 font-bold">No scores recorded for this filter yet!</div>
            <p className="text-xs text-slate-500">Be the first player to set a record in this league and mode.</p>
            <button
              onClick={onStartQuiz}
              className="mt-3 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/25"
            >
              Play Now & Set Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] sm:text-xs uppercase font-extrabold text-slate-600">
                <tr>
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">League</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = currentUsername && entry.username.toLowerCase() === currentUsername.toLowerCase();

                  return (
                    <tr
                      key={entry.id || index}
                      className={`transition-colors hover:bg-slate-50 ${
                        isCurrentUser ? 'bg-sky-50 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {getRankBadge(rank)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{entry.username}</span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-500 text-white text-[9px] uppercase font-black">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] uppercase text-slate-700 font-bold border border-slate-200">
                          {entry.league.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-700 capitalize text-xs font-semibold">
                            {entry.mode}
                          </span>
                          {entry.mode === 'classic' && entry.totalQuestions > 0 && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({entry.totalQuestions}Q)
                            </span>
                          )}
                        </div>
                        {entry.difficulty && entry.difficulty !== 'normal' && (
                          <span className="text-[10px] text-sky-600 block font-normal">
                            {entry.difficulty}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sports text-lg sm:text-xl font-black text-slate-900">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-bold ${
                          entry.accuracy >= 80 ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {entry.accuracy}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-amber-600 font-mono font-bold flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{entry.streak}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-xs">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
