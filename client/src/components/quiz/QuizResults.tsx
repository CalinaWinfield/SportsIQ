import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Target, Clock, RefreshCw, Award, ArrowRight, Check, X, ShieldAlert, Info, Heart, MapPin, Sparkles } from 'lucide-react';
import { QuizResultSummary, UserAnswerRecord } from '../../types/quiz.js';
import { SportTeam, FavoriteTeam } from '../../types/sports.js';
import { sounds } from '../../services/sounds.js';

interface QuizResultsProps {
  results: QuizResultSummary;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onViewLeaderboard: () => void;
  isGuest: boolean;
  onPromptAuth: () => void;
  favorites?: FavoriteTeam[];
  onToggleFavorite?: (team: SportTeam) => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  results,
  onPlayAgain,
  onBackToLobby,
  onViewLeaderboard,
  isGuest,
  onPromptAuth,
  favorites = [],
  onToggleFavorite
}) => {
  const [selectedRecord, setSelectedRecord] = useState<UserAnswerRecord | null>(null);
  useEffect(() => {
    sounds.playFanfare();

    // Trigger celebratory confetti
    if (results.accuracy >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRecord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results.accuracy]);

  // Determine Title & Rank
  const getRankBadge = (acc: number) => {
    if (acc >= 90) return { title: 'Hall of Famer', icon: '🏆' };
    if (acc >= 75) return { title: 'All-Pro Champion', icon: '⭐' };
    if (acc >= 50) return { title: 'Franchise Starter', icon: '⚡' };
    return { title: 'Rookie Prospect', icon: '🏈' };
  };

  const rank = getRankBadge(results.accuracy);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      {/* Top Banner Card */}
      <div className="sports-card rounded-3xl p-8 mb-8 text-center border border-slate-200 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
          <span>{results.league.toUpperCase()} • {results.mode.toUpperCase()} MODE</span>
        </div>

        <div className="text-5xl mb-2">{rank.icon}</div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase font-sports tracking-wide">
          {rank.title}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          {results.accuracy >= 80
            ? 'Incredible sports knowledge! You know your team emblems inside out.'
            : 'Solid effort! Practice with silhouette mode to master the details.'}
        </p>

        {/* Score Number */}
        <div className="my-6">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
            Total Points Earned
          </div>
          <div className="text-5xl sm:text-6xl font-black font-sports text-sky-600 tracking-wider">
            {results.score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mb-1 font-semibold">
              <Target className="w-3.5 h-3.5 text-sky-500" />
              <span>Accuracy</span>
            </div>
            <div className="text-xl font-black text-slate-900">{results.accuracy}%</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mb-1 font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Correct</span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {results.correctAnswers} / {results.totalQuestions}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mb-1 font-semibold">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Best Streak</span>
            </div>
            <div className="text-xl font-black text-slate-900">{results.bestStreak}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mb-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Time Taken</span>
            </div>
            <div className="text-xl font-black text-slate-900">{results.timeSpentSeconds}s</div>
          </div>
        </div>

        {/* Guest prompt notice */}
        {isGuest && (
          <div className="mt-6 p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs flex items-center justify-between gap-3 max-w-xl mx-auto">
            <span>💡 You are playing as a guest. Create an account to permanently save your score!</span>
            <button
              onClick={onPromptAuth}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg text-xs flex-shrink-0 transition-colors shadow-2xs"
            >
              Save Score
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={onPlayAgain}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onBackToLobby}
            className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-sm transition-all"
          >
            Change Mode / League
          </button>

          <button
            onClick={onViewLeaderboard}
            className="py-3 px-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-sm transition-all flex items-center gap-2 shadow-2xs"
          >
            <Award className="w-4 h-4 text-sky-500" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center justify-between">
          <span>Question Review ({results.records.length} Logos)</span>
          <span className="text-xs text-sky-600 font-semibold bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Info className="w-3 h-3 text-sky-500" />
            <span>Click any logo or card to see team details</span>
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.records.map((rec, i) => {
            const team = rec.question.team;
            return (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => {
                  sounds.playClick();
                  setSelectedRecord(rec);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sounds.playClick();
                    setSelectedRecord(rec);
                  }
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md group ${
                  rec.correct
                    ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-400 shadow-2xs'
                    : 'bg-rose-50/70 border-rose-200 hover:border-rose-400 shadow-2xs'
                }`}
                title="Click to view team details"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 p-1.5 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:ring-2 group-hover:ring-sky-400 group-hover:scale-105 transition-all">
                    <img
                      src={team.logo}
                      alt={team.displayName}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                      <span className="truncate group-hover:text-sky-600 transition-colors">{team.displayName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase font-mono border border-slate-200 flex-shrink-0">
                        {team.league.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {rec.correct ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 flex-shrink-0" /> Correct (+{rec.pointsEarned} pts)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <X className="w-3 h-3 flex-shrink-0" /> Missed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                  <span className="text-xs font-mono text-slate-500">
                    {Math.round(rec.timeSpentMs / 100) / 10}s
                  </span>
                  <span className="text-[10px] font-bold text-sky-600 group-hover:text-sky-700 group-hover:underline flex items-center gap-0.5">
                    <span>Details</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Accent Line / Team Color Bar */}
            <div
              className="h-2 w-full transition-colors"
              style={{
                backgroundColor: selectedRecord.question.team.color
                  ? `#${selectedRecord.question.team.color}`
                  : '#0284c7'
              }}
            />

            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-slate-100">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-20 h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img
                    src={selectedRecord.question.team.logo}
                    alt={selectedRecord.question.team.displayName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-wider border border-sky-200">
                      {selectedRecord.question.team.league.toUpperCase()}
                    </span>
                    {selectedRecord.question.team.conference && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                        {selectedRecord.question.team.conference}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight truncate">
                    {selectedRecord.question.team.displayName}
                  </h2>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedRecord.question.team.location || selectedRecord.question.team.name}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Quiz Performance Card */}
              <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                selectedRecord.correct ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedRecord.correct ? (
                      <span className="flex items-center gap-1.5 font-black text-emerald-800 text-sm">
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                        <span>Question Solved Correctly</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-black text-rose-800 text-sm">
                        <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                        <span>Question Missed</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{(selectedRecord.timeSpentMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700">
                  {selectedRecord.correct ? (
                    <span>You correctly identified this logo and earned <strong className="text-emerald-700 font-black">+{selectedRecord.pointsEarned} points</strong>!</span>
                  ) : (
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-500">Your choice: </span>
                        <strong className="text-rose-700 font-bold">
                          {selectedRecord.selectedTeamId === 'skip'
                            ? 'Skipped'
                            : selectedRecord.question.options.find(o => o.id === selectedRecord.selectedTeamId)?.displayName || 'Incorrect Choice'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Correct team: </span>
                        <strong className="text-emerald-700 font-bold">{selectedRecord.question.team.displayName}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Information Grid */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                  Franchise & Conference Details
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Conference / Group</div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {selectedRecord.question.team.conference || 'Independent'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Home Location</div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {selectedRecord.question.team.location || selectedRecord.question.team.name}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Abbreviation</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {selectedRecord.question.team.abbreviation || 'N/A'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Nickname / Mascot</div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {selectedRecord.question.team.nickname || selectedRecord.question.team.name}
                    </div>
                  </div>

                  {selectedRecord.question.team.standing && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Standing</div>
                      <div className="text-sm font-bold text-amber-600 truncate">
                        {selectedRecord.question.team.standing}
                      </div>
                    </div>
                  )}

                  {selectedRecord.question.team.record && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Season Record</div>
                      <div className="text-sm font-bold font-mono text-slate-900 truncate">
                        {selectedRecord.question.team.record}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Follow in ESPN FanHub Button */}
              {onToggleFavorite && (
                <div className="pt-2">
                  {(() => {
                    const isFav = favorites.some(
                      f => f.teamId === selectedRecord.question.team.id && f.league === selectedRecord.question.team.league
                    );
                    return (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onToggleFavorite(selectedRecord.question.team);
                        }}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                          isFav
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-white fill-white'}`} />
                        <span>{isFav ? 'Followed in ESPN FanHub (Click to Unfollow)' : 'Follow Team in ESPN FanHub'}</span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="py-2 px-5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
