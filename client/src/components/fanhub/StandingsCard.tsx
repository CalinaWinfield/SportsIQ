import React from 'react';
import { SportTeam } from '../../types/sports.js';
import { Award, Shield, TrendingUp } from 'lucide-react';

interface StandingsCardProps {
  teams: SportTeam[];
}

export const StandingsCard: React.FC<StandingsCardProps> = ({ teams }) => {
  if (teams.length === 0) {
    return (
      <div className="sports-card rounded-2xl p-10 text-center border border-slate-200 text-slate-500 shadow-2xs">
        <Award className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <div className="text-sm font-semibold">No followed teams to display standings for yet.</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map(team => (
        <div
          key={`${team.league}_${team.id}`}
          className="sports-card sports-card-hover rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 p-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <img
                src={team.logo}
                alt={team.displayName}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-slate-900 truncate">{team.displayName}</h3>
              <div className="text-[11px] font-bold uppercase text-slate-500 font-mono">
                {team.league.toUpperCase()} {team.conference ? ` • ${team.conference}` : ''}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {team.standing && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Division / Standing:</span>
                <span className="font-bold text-amber-600">{team.standing}</span>
              </div>
            )}

            {team.record ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Season Record:</span>
                <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {team.record}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-bold text-slate-700">{team.location || 'Franchise'}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
