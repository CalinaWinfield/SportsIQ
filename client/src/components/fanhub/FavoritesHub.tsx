import React, { useState, useMemo } from 'react';
import { Heart, Plus, RefreshCw, Radio, Calendar, Newspaper, Award, Filter, X } from 'lucide-react';
import { SportTeam, SportGame, SportNewsArticle, FavoriteTeam, League } from '../../types/sports.js';
import { ScoresGrid } from './ScoresGrid.js';
import { ScheduleList } from './ScheduleList.js';
import { NewsGrid } from './NewsGrid.js';
import { StandingsCard } from './StandingsCard.js';
import { TeamPickerModal } from './TeamPickerModal.js';
import { sounds } from '../../services/sounds.js';

interface FavoritesHubProps {
  favorites: FavoriteTeam[];
  allTeams: SportTeam[];
  games: SportGame[];
  news: SportNewsArticle[];
  loadingGames: boolean;
  loadingNews: boolean;
  onRefresh: () => void;
  onToggleFavorite: (team: SportTeam) => void;
  isLoggedIn: boolean;
  onPromptAuth: () => void;
}

export const FavoritesHub: React.FC<FavoritesHubProps> = ({
  favorites,
  allTeams,
  games,
  news,
  loadingGames,
  loadingNews,
  onRefresh,
  onToggleFavorite,
  isLoggedIn,
  onPromptAuth
}) => {
  const [activeTab, setActiveTab] = useState<'scores' | 'schedule' | 'news' | 'standings'>('scores');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<League | 'all'>('all');
  const [viewScope, setViewScope] = useState<'my_teams' | 'all_games'>('my_teams');

  const followedTeamIds = useMemo(() => {
    return new Set(favorites.map(f => `${f.league}_${f.teamId}`));
  }, [favorites]);

  const followedTeamsList = useMemo(() => {
    return allTeams.filter(t => followedTeamIds.has(`${t.league}_${t.id}`));
  }, [allTeams, followedTeamIds]);

  const displayGames = useMemo(() => {
    return games.filter(g => {
      const matchLeague = selectedLeagueFilter === 'all' || g.league === selectedLeagueFilter;
      if (viewScope === 'all_games') {
        return matchLeague;
      }
      const isHomeFollowed = followedTeamIds.has(`${g.league}_${g.homeTeam.id}`);
      const isAwayFollowed = followedTeamIds.has(`${g.league}_${g.awayTeam.id}`);
      return matchLeague && (isHomeFollowed || isAwayFollowed);
    });
  }, [games, selectedLeagueFilter, viewScope, followedTeamIds]);

  const displayNews = useMemo(() => {
    if (selectedLeagueFilter === 'all') return news;
    return news.filter(n => n.league === selectedLeagueFilter);
  }, [news, selectedLeagueFilter]);

  const handleTabChange = (tab: 'scores' | 'schedule' | 'news' | 'standings') => {
    sounds.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="sports-card rounded-3xl p-6 sm:p-8 border border-slate-200 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black uppercase tracking-widest mb-2 shadow-2xs">
              <Radio className="w-3.5 h-3.5 animate-pulse text-sky-500" />
              <span>ESPN LIVE FANHUB</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase font-sports tracking-tight">
              YOUR SPORTS DASHBOARD
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Track live scores, game start times, division standings, and breaking news for your followed teams across NFL, NBA, College Football (7 conferences), and WNBA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { sounds.playClick(); setIsPickerOpen(true); }}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all flex items-center gap-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Manage Teams ({favorites.length})</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all flex-shrink-0 shadow-2xs"
              title="Refresh ESPN Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingGames || loadingNews ? 'animate-spin text-sky-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Followed Teams Badges Carousel */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
              <span>Followed Teams</span>
            </span>
            {!isLoggedIn && (
              <span className="text-sky-600 font-semibold cursor-pointer hover:underline" onClick={onPromptAuth}>
                Log in to sync teams across devices
              </span>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="text-xs text-slate-600">
                You haven't followed any teams yet! Pick your favorite NFL, NBA, CFB, or WNBA teams to customize your feed.
              </div>
              <button
                onClick={() => { sounds.playClick(); setIsPickerOpen(true); }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition-colors flex-shrink-0 shadow-xs"
              >
                + Choose Teams Now
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {favorites.map(fav => (
                <div
                  key={`${fav.league}_${fav.teamId}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex-shrink-0 transition-colors group shadow-2xs"
                >
                  {fav.logoUrl && (
                    <img src={fav.logoUrl} alt={fav.teamName} className="w-5 h-5 object-contain" />
                  )}
                  <span className="text-xs font-bold text-slate-800 whitespace-nowrap">{fav.teamName}</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onToggleFavorite({ id: fav.teamId, league: fav.league, displayName: fav.teamName, logo: fav.logoUrl } as any);
                    }}
                    className="text-slate-400 hover:text-rose-500 ml-1 p-0.5"
                    title="Remove team"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => { sounds.playClick(); setIsPickerOpen(true); }}
                className="px-3 py-1.5 border border-dashed border-slate-300 hover:border-sky-500 text-slate-600 hover:text-sky-600 bg-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add More</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: View Scope, Sub-Tabs & League Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('scores')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'scores' ? 'bg-sky-500 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Scores & Games</span>
          </button>

          <button
            onClick={() => handleTabChange('schedule')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'schedule' ? 'bg-sky-500 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>

          <button
            onClick={() => handleTabChange('news')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'news' ? 'bg-sky-500 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>ESPN News</span>
          </button>

          <button
            onClick={() => handleTabChange('standings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'standings' ? 'bg-sky-500 text-white font-black shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Standings</span>
          </button>
        </div>

        {/* Right Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* View Scope Toggle (My Teams vs All League) */}
          {(activeTab === 'scores' || activeTab === 'schedule') && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 flex-shrink-0">
              <button
                onClick={() => { sounds.playClick(); setViewScope('my_teams'); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                  viewScope === 'my_teams' ? 'bg-white text-sky-700 font-black shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My Teams
              </button>
              <button
                onClick={() => { sounds.playClick(); setViewScope('all_games'); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                  viewScope === 'all_games' ? 'bg-white text-sky-700 font-black shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Games
              </button>
            </div>
          )}

          {/* League Dropdown Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-shrink-0">
            {(['all', 'nfl', 'nba', 'college-football', 'wnba'] as const).map(l => (
              <button
                key={l}
                onClick={() => { sounds.playClick(); setSelectedLeagueFilter(l); }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  selectedLeagueFilter === l ? 'bg-sky-500 text-white font-black shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l === 'all' ? 'ALL' : l === 'college-football' ? 'CFB' : l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Feed Section */}
      <div>
        {activeTab === 'scores' && (
          <ScoresGrid
            games={displayGames}
            loading={loadingGames}
            emptyMessage={
              viewScope === 'my_teams' && favorites.length === 0
                ? "You haven't followed any teams yet! Click '+ Manage Teams' above or switch to 'All Games' to view the league scoreboard."
                : "No games found for your selected filters right now."
            }
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleList
            games={displayGames}
            loading={loadingGames}
          />
        )}

        {activeTab === 'news' && (
          <NewsGrid
            articles={displayNews}
            loading={loadingNews}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsCard
            teams={
              selectedLeagueFilter === 'all'
                ? followedTeamsList.length > 0 ? followedTeamsList : allTeams.slice(0, 18)
                : allTeams.filter(t => t.league === selectedLeagueFilter).slice(0, 24)
            }
          />
        )}
      </div>

      {/* Team Picker Modal */}
      <TeamPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        allTeams={allTeams}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};
