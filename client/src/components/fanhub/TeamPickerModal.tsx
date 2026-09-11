import React, { useState, useMemo } from 'react';
import { X, Search, Check, Plus, Heart, Filter } from 'lucide-react';
import { SportTeam, FavoriteTeam, League } from '../../types/sports.js';
import { sounds } from '../../services/sounds.js';

interface TeamPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTeams: SportTeam[];
  favorites: FavoriteTeam[];
  onToggleFavorite: (team: SportTeam) => void;
}

const CFB_CONFERENCES = [
  'All Conferences',
  'SEC',
  'Big Ten',
  'Big 12',
  'ACC',
  'Sun Belt',
  'SWAC',
  'Pac-10'
];

export const TeamPickerModal: React.FC<TeamPickerModalProps> = ({
  isOpen,
  onClose,
  allTeams,
  favorites,
  onToggleFavorite
}) => {
  const [search, setSearch] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<League | 'all'>('all');
  const [selectedConf, setSelectedConf] = useState<string>('All Conferences');

  const filteredTeams = useMemo(() => {
    const query = search.toLowerCase().trim();
    const queryWords = query ? query.split(/\s+/) : [];

    return allTeams.filter(team => {
      // 1. League Filter
      const matchesLeague = selectedLeague === 'all' || team.league === selectedLeague;
      if (!matchesLeague) return false;

      // 2. Conference Filter (for CFB)
      if (selectedLeague === 'college-football' && selectedConf !== 'All Conferences') {
        if (team.conference !== selectedConf) return false;
      }

      // 3. Search Query Filter (Multi-word intelligent matching)
      if (queryWords.length === 0) return true;

      const searchableAliases = [
        team.displayName,
        team.name,
        team.nickname,
        team.location,
        team.abbreviation,
        team.conference,
        team.displayName.includes('Alabama') ? 'bama' : '',
        team.displayName.includes('Ohio State') ? 'buckeyes osu' : '',
        team.displayName.includes('Florida State') ? 'noles fsu' : '',
        team.displayName.includes('Georgia') ? 'dawgs uga' : '',
        team.displayName.includes('Texas') ? 'longhorns ut' : '',
        team.displayName.includes('Tennessee') ? 'vols' : '',
        team.displayName.includes('LSU') ? 'tigers' : '',
        team.displayName.includes('App State') ? 'appalachian state' : '',
        team.displayName.includes('Jackson State') ? 'jsu tigers' : ''
      ].filter(Boolean).join(' ').toLowerCase();

      return queryWords.every(word => searchableAliases.includes(word));
    });
  }, [allTeams, search, selectedLeague, selectedConf]);

  if (!isOpen) return null;

  const isFav = (team: SportTeam) => {
    return favorites.some(f => f.teamId === team.id && f.league === team.league);
  };

  const handleToggle = (team: SportTeam) => {
    sounds.playClick();
    onToggleFavorite(team);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800 max-h-[88vh] flex flex-col overflow-hidden">
        {/* Top Light Blue Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-sky-500 fill-sky-500" />
              <span>Follow Your Favorite Teams</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select teams from SEC, ACC, Big 12, Big Ten, SWAC, Pac-10, Sun Belt, NFL, NBA, and WNBA!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="py-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by team, mascot, city, or conference (e.g. Alabama, Crimson Tide, SEC, Ohio State, SWAC)..."
              className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* League Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {(['all', 'nfl', 'nba', 'college-football', 'wnba'] as const).map(l => (
              <button
                key={l}
                onClick={() => {
                  sounds.playClick();
                  setSelectedLeague(l);
                  if (l !== 'college-football') setSelectedConf('All Conferences');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  selectedLeague === l
                    ? 'bg-sky-500 text-white font-extrabold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {l === 'all' ? 'All Leagues' : l === 'college-football' ? 'CFB (7 Conferences)' : l.toUpperCase()}
              </button>
            ))}
            <span className="text-xs text-sky-600 ml-auto flex-shrink-0 font-bold">
              {filteredTeams.length} teams
            </span>
          </div>

          {/* Conference Sub-Filters (Active for College Football) */}
          {selectedLeague === 'college-football' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1">
                <Filter className="w-3 h-3 text-sky-500" />
                <span>Conf:</span>
              </span>
              {CFB_CONFERENCES.map(c => (
                <button
                  key={c}
                  onClick={() => { sounds.playClick(); setSelectedConf(c); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                    selectedConf === c
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Teams Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 my-2">
          {filteredTeams.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs italic">
              No sports teams found matching "{search}".
            </div>
          ) : (
            filteredTeams.map(team => {
              const favorite = isFav(team);
              return (
                <div
                  key={`${team.league}_${team.id}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                    favorite
                      ? 'bg-sky-50/80 border-sky-300 ring-1 ring-sky-300/60'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 p-1 bg-white rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <img
                        src={team.logo}
                        alt={team.displayName}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate" title={team.displayName}>
                        {team.displayName}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-600">{team.league === 'college-football' ? 'CFB' : team.league.toUpperCase()}</span>
                        {team.conference && (
                          <span className="px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800 font-bold border border-sky-200">
                            {team.conference}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(team)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                      favorite
                        ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                    }`}
                    title={favorite ? "Unfollow team" : "Follow team"}
                  >
                    {favorite ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Currently following <span className="font-extrabold text-sky-600">{favorites.length}</span> teams
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
