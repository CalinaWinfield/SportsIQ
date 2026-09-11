import React from 'react';
import { SportGame } from '../../types/sports.js';
import { Calendar, Clock, MapPin, Tv } from 'lucide-react';
import { formatGameTime } from '../../utils/dateUtils.js';

interface ScheduleListProps {
  games: SportGame[];
  loading: boolean;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ games, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="sports-card rounded-xl p-4 animate-pulse h-20 border border-slate-200" />
        ))}
      </div>
    );
  }

  const upcomingGames = games.filter(g => !g.isCompleted);

  if (upcomingGames.length === 0) {
    return (
      <div className="sports-card rounded-2xl p-10 text-center border border-slate-200 text-slate-500 shadow-2xs">
        <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <div className="text-sm font-semibold">No upcoming games scheduled on the calendar right now.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingGames.map(game => {
        const timeInfo = formatGameTime(game);

        return (
          <div
            key={game.id}
            className="sports-card sports-card-hover rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
          >
            {/* Matchup Teams */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Away */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 p-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {game.awayTeam.logo && (
                    <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="max-w-full max-h-full object-contain" />
                  )}
                </div>
                <span className="font-extrabold text-sm text-slate-900">{game.awayTeam.name}</span>
              </div>

              <span className="text-slate-400 font-bold text-xs uppercase">AT</span>

              {/* Home */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 p-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {game.homeTeam.logo && (
                    <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="max-w-full max-h-full object-contain" />
                  )}
                </div>
                <span className="font-extrabold text-sm text-slate-900">{game.homeTeam.name}</span>
              </div>
            </div>

            {/* Prominent Game Start Time, Channel & Venue */}
            <div className="flex items-center gap-4 text-xs flex-shrink-0">
              <div className="flex items-center gap-1.5 font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>{timeInfo.startTimeFormatted}</span>
              </div>

              {game.broadcast && (
                <div className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                  <Tv className="w-3.5 h-3.5 text-sky-500" />
                  <span>{game.broadcast}</span>
                </div>
              )}

              {game.venue && (
                <div className="hidden lg:flex items-center gap-1 text-slate-400 truncate max-w-[180px]">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{game.venue}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
