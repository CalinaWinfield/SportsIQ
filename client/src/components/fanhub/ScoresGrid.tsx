import React from 'react';
import { SportGame } from '../../types/sports.js';
import { Radio, Tv, Calendar, Clock } from 'lucide-react';
import { formatGameTime } from '../../utils/dateUtils.js';

interface ScoresGridProps {
  games: SportGame[];
  loading: boolean;
  emptyMessage?: string;
}

export const ScoresGrid: React.FC<ScoresGridProps> = ({
  games,
  loading,
  emptyMessage = "No games scheduled or in progress right now."
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sports-card rounded-2xl p-5 animate-pulse border border-slate-200 h-44">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
            <div className="h-8 bg-slate-100 rounded mb-3" />
            <div className="h-8 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="sports-card rounded-2xl p-10 text-center border border-slate-200 text-slate-500 shadow-2xs">
        <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <div className="text-sm font-semibold">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map(game => {
        const awayScore = parseInt(game.awayTeam.score, 10) || 0;
        const homeScore = parseInt(game.homeTeam.score, 10) || 0;
        const isAwayWinner = game.isCompleted && awayScore > homeScore;
        const isHomeWinner = game.isCompleted && homeScore > awayScore;
        const timeInfo = formatGameTime(game);

        return (
          <div
            key={game.id}
            className="sports-card sports-card-hover rounded-2xl p-5 flex flex-col justify-between border border-slate-200 shadow-xs"
          >
            {/* Top Bar: Status, Start Time, Period, Broadcast */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {timeInfo.isLive ? (
                  <span className="flex items-center gap-1.5 font-black text-emerald-600 uppercase text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{game.statusDetail}</span>
                  </span>
                ) : timeInfo.isCompleted ? (
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg truncate shadow-2xs">
                    <Calendar className="w-3 h-3 flex-shrink-0 text-slate-500" />
                    <span className="truncate">{timeInfo.startTimeFormatted}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-bold text-sky-700 text-xs bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg truncate shadow-2xs">
                    <Clock className="w-3 h-3 flex-shrink-0 text-sky-500" />
                    <span className="truncate">{timeInfo.startTimeFormatted}</span>
                  </span>
                )}

                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-600 uppercase flex-shrink-0 border border-slate-200">
                  {game.league === 'college-football'
                    ? (game.homeTeam.conference || game.awayTeam.conference ? `CFB • ${game.homeTeam.conference || game.awayTeam.conference}` : 'CFB')
                    : game.league.toUpperCase()}
                </span>
              </div>

              {game.broadcast && (
                <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px] uppercase flex-shrink-0 ml-2">
                  <Tv className="w-3 h-3 text-sky-500" />
                  <span>{game.broadcast}</span>
                </div>
              )}
            </div>

            {/* Teams & Scores */}
            <div className="space-y-3 my-1">
              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 p-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {game.awayTeam.logo ? (
                      <img
                        src={game.awayTeam.logo}
                        alt={game.awayTeam.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-bold truncate ${isAwayWinner ? 'text-slate-950 font-black' : 'text-slate-800'}`}>
                      {game.awayTeam.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      {game.awayTeam.conference && (
                        <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1 rounded border border-sky-200 uppercase">
                          {game.awayTeam.conference}
                        </span>
                      )}
                      {game.awayTeam.record && (
                        <span>{game.awayTeam.record}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`text-xl font-sports font-black tracking-wide ml-3 ${
                  isAwayWinner ? 'text-sky-600' : game.isCompleted ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  {game.awayTeam.score}
                </div>
              </div>

              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 p-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {game.homeTeam.logo ? (
                      <img
                        src={game.homeTeam.logo}
                        alt={game.homeTeam.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-bold truncate ${isHomeWinner ? 'text-slate-950 font-black' : 'text-slate-800'}`}>
                      {game.homeTeam.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      {game.homeTeam.conference && (
                        <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1 rounded border border-sky-200 uppercase">
                          {game.homeTeam.conference}
                        </span>
                      )}
                      {game.homeTeam.record && (
                        <span>{game.homeTeam.record}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`text-xl font-sports font-black tracking-wide ml-3 ${
                  isHomeWinner ? 'text-sky-600' : game.isCompleted ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  {game.homeTeam.score}
                </div>
              </div>
            </div>

            {/* Scheduled Start Time Footer / Venue */}
            {(game.isCompleted || !game.isLive || Boolean(game.venue)) && (
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                {game.isCompleted ? (
                  <div className="flex items-center gap-1 font-medium text-slate-500 truncate">
                    <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>Final • Played on {timeInfo.gameDateFormatted || 'recently'}</span>
                  </div>
                ) : !game.isLive ? (
                  <div className="flex items-center gap-1 font-medium text-sky-700 truncate">
                    <Clock className="w-3 h-3 text-sky-500 flex-shrink-0" />
                    <span>Kickoff / Tip-off: {timeInfo.startTimeFormatted}</span>
                  </div>
                ) : (
                  <div />
                )}

                {game.venue && (
                  <div className="text-slate-400 truncate max-w-[180px] text-right ml-auto">
                    📍 {game.venue}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
