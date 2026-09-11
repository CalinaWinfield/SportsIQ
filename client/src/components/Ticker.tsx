import React, { useEffect, useState } from 'react';
import { RefreshCw, Radio, Clock } from 'lucide-react';
import { SportGame, League } from '../types/sports.js';
import { api } from '../services/api.js';
import { formatGameTime } from '../utils/dateUtils.js';

export const Ticker: React.FC = () => {
  const [games, setGames] = useState<SportGame[]>([]);
  const [activeLeague, setActiveLeague] = useState<League | 'all'>('all');
  const [loading, setLoading] = useState(false);

  const fetchScores = async (league?: League | 'all') => {
    setLoading(true);
    try {
      const selected = league || activeLeague;
      const data = await api.getScoreboard(selected === 'all' ? undefined : selected);
      setGames(data);
    } catch (err) {
      console.error('Failed to load ticker scores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores(activeLeague);
    const interval = setInterval(() => {
      fetchScores(activeLeague);
    }, 45000);
    return () => clearInterval(interval);
  }, [activeLeague]);

  return (
    <div className="bg-white border-b border-slate-200 text-xs overflow-hidden select-none shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* Light Blue Ticker Label */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold tracking-wider text-[11px] uppercase flex-shrink-0 shadow-xs">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>ESPN SCOREBOARD</span>
        </div>

        {/* League Selector Pills */}
        <div className="flex items-center gap-1 px-2 border-r border-slate-200 flex-shrink-0 bg-slate-50 hidden sm:flex">
          {(['all', 'nfl', 'nba', 'college-football', 'wnba'] as const).map(l => (
            <button
              key={l}
              onClick={() => setActiveLeague(l)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                activeLeague === l
                  ? 'bg-sky-500 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {l === 'all' ? 'ALL' : l === 'college-football' ? 'CFB' : l.toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => fetchScores(activeLeague)}
            disabled={loading}
            title="Refresh scores"
            className="p-1 text-slate-400 hover:text-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        {/* Games Stream */}
        <div className="flex items-center overflow-x-auto no-scrollbar py-1.5 px-2 gap-3 flex-1 whitespace-nowrap">
          {games.length === 0 ? (
            <div className="text-slate-400 text-xs py-0.5 italic">
              {loading ? 'Fetching ESPN scores...' : 'No active or scheduled games for this league right now.'}
            </div>
          ) : (
            games.slice(0, 15).map(game => {
              const gameTime = formatGameTime(game);

              return (
                <div
                  key={game.id}
                  className="flex items-center gap-2.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors flex-shrink-0 shadow-2xs"
                >
                  {/* Status / Start Time Badge */}
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-bold uppercase ${
                      gameTime.isLive
                        ? 'text-emerald-600 flex items-center gap-1 font-extrabold'
                        : gameTime.isCompleted
                        ? 'text-slate-400'
                        : 'text-sky-600 flex items-center gap-1 font-semibold'
                    }`}>
                      {gameTime.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                      {!gameTime.isLive && !gameTime.isCompleted && <Clock className="w-2.5 h-2.5 text-sky-500" />}
                      {gameTime.startTimeFormatted}
                    </span>
                    {game.broadcast && (
                      <span className="text-[8px] font-bold text-slate-400 uppercase">
                        {game.broadcast}
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-1.5">
                    {game.awayTeam.logo ? (
                      <img
                        src={game.awayTeam.logo}
                        alt={game.awayTeam.abbreviation}
                        className="w-4 h-4 object-contain"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="font-bold text-slate-700">{game.awayTeam.abbreviation}</span>
                    <span className={`font-mono font-bold ${
                      game.isCompleted && Number(game.awayTeam.score) > Number(game.homeTeam.score)
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}>
                      {game.awayTeam.score}
                    </span>
                  </div>

                  <span className="text-slate-300 font-bold">@</span>

                  {/* Home Team */}
                  <div className="flex items-center gap-1.5">
                    {game.homeTeam.logo ? (
                      <img
                        src={game.homeTeam.logo}
                        alt={game.homeTeam.abbreviation}
                        className="w-4 h-4 object-contain"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="font-bold text-slate-700">{game.homeTeam.abbreviation}</span>
                    <span className={`font-mono font-bold ${
                      game.isCompleted && Number(game.homeTeam.score) > Number(game.awayTeam.score)
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}>
                      {game.homeTeam.score}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
