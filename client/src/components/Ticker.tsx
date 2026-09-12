import React, { useEffect, useState, useRef, useMemo } from 'react';
import { RefreshCw, Radio, Clock, Calendar, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { SportGame, League, FavoriteTeam } from '../types/sports.js';
import { api } from '../services/api.js';
import { formatGameTime } from '../utils/dateUtils.js';

interface TickerProps {
  favorites?: FavoriteTeam[];
  onNavigateToHub?: () => void;
}

export const Ticker: React.FC<TickerProps> = ({ favorites = [], onNavigateToHub }) => {
  const [games, setGames] = useState<SportGame[]>([]);
  const [activeLeague, setActiveLeague] = useState<League | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -350 : 350,
        behavior: 'smooth'
      });
    }
  };

  const fetchScores = async (league?: League | 'all') => {
    setLoading(true);
    try {
      const selected = league || activeLeague;
      const data = await api.getScoreboard(selected === 'all' ? undefined : selected);
      setGames(data.games || []);
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

  // Check if a team is followed by the user
  const isTeamFavorite = (teamId: string, league: League, teamName?: string, abbreviation?: string): boolean => {
    if (!favorites || favorites.length === 0) return false;
    return favorites.some(fav => {
      if (fav.league === league && fav.teamId === teamId) return true;
      if (abbreviation && fav.abbreviation && fav.league === league) {
        if (fav.abbreviation.toLowerCase() === abbreviation.toLowerCase()) return true;
      }
      if (teamName && fav.teamName && fav.league === league) {
        const tLower = teamName.toLowerCase();
        const fLower = fav.teamName.toLowerCase();
        if (tLower === fLower || tLower.includes(fLower) || fLower.includes(tLower)) return true;
      }
      return false;
    });
  };

  // Only show games involving the user's favorite teams
  const favoriteGames = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];
    return games.filter(game => {
      const isHomeFav = isTeamFavorite(game.homeTeam.id, game.league, game.homeTeam.name, game.homeTeam.abbreviation);
      const isAwayFav = isTeamFavorite(game.awayTeam.id, game.league, game.awayTeam.name, game.awayTeam.abbreviation);
      return isHomeFav || isAwayFav;
    });
  }, [games, favorites]);

  return (
    <div className="bg-white border-b border-slate-200 text-xs overflow-hidden select-none shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* Light Blue Ticker Label */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold tracking-wider text-[11px] uppercase flex-shrink-0 shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-current text-white" />
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
          <span className="text-[10px] font-mono font-bold text-slate-500 px-1.5 py-0.5 bg-slate-200/70 rounded-md border border-slate-200 ml-0.5">
            {favoriteGames.length}
          </span>
          <button
            onClick={() => fetchScores(activeLeague)}
            disabled={loading}
            title="Refresh scores"
            className="p-1 text-slate-400 hover:text-slate-700 transition-all disabled:opacity-50 ml-0.5"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        {/* Left Scroll Arrow */}
        {favoriteGames.length > 5 && (
          <button
            onClick={() => scroll('left')}
            className="px-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:flex items-center justify-center border-r border-slate-100"
            title="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Games Stream - Only games involving favorite teams */}
        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto no-scrollbar py-1.5 px-3 gap-3 flex-1 whitespace-nowrap scroll-smooth"
        >
          {(!favorites || favorites.length === 0) ? (
            <div className="flex items-center gap-2 text-xs py-0.5 text-slate-500">
              <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>No favorite teams followed yet.</span>
              {onNavigateToHub && (
                <button
                  type="button"
                  onClick={onNavigateToHub}
                  className="text-sky-600 hover:text-sky-700 font-bold hover:underline"
                >
                  + Follow teams in FanHub to track them here
                </button>
              )}
            </div>
          ) : favoriteGames.length === 0 ? (
            <div className="flex items-center gap-2 text-xs py-0.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>
                {loading
                  ? 'Fetching scores for your teams...'
                  : activeLeague === 'all'
                  ? `No games scheduled this week for your ${favorites.length} followed ${favorites.length === 1 ? 'team' : 'teams'}.`
                  : `No ${activeLeague.toUpperCase()} games scheduled this week for your followed teams.`}
              </span>
              {onNavigateToHub && (
                <button
                  type="button"
                  onClick={onNavigateToHub}
                  className="text-sky-600 hover:text-sky-700 font-bold hover:underline"
                >
                  Manage teams →
                </button>
              )}
            </div>
          ) : (
            favoriteGames.map(game => {
              const gameTime = formatGameTime(game);
              const isAwayFav = isTeamFavorite(game.awayTeam.id, game.league, game.awayTeam.name, game.awayTeam.abbreviation);
              const isHomeFav = isTeamFavorite(game.homeTeam.id, game.league, game.homeTeam.name, game.homeTeam.abbreviation);

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
                        ? 'text-slate-600 flex items-center gap-1 font-semibold'
                        : 'text-sky-600 flex items-center gap-1 font-semibold'
                    }`}>
                      {gameTime.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                      {!gameTime.isLive && !gameTime.isCompleted && <Clock className="w-2.5 h-2.5 text-sky-500" />}
                      {gameTime.isCompleted && <Calendar className="w-2.5 h-2.5 text-slate-400" />}
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
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isAwayFav ? 'text-sky-700 font-black' : 'text-slate-700'
                    }`}>
                      {game.awayTeam.abbreviation}
                      {isAwayFav && <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />}
                    </span>
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
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isHomeFav ? 'text-sky-700 font-black' : 'text-slate-700'
                    }`}>
                      {game.homeTeam.abbreviation}
                      {isHomeFav && <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />}
                    </span>
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

        {/* Right Scroll Arrow */}
        {favoriteGames.length > 5 && (
          <button
            onClick={() => scroll('right')}
            className="px-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:flex items-center justify-center border-l border-slate-100"
            title="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
