import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { Ticker } from './components/Ticker.js';
import { AuthModal } from './components/AuthModal.js';
import { QuizLobby } from './components/quiz/QuizLobby.js';
import { QuizArena } from './components/quiz/QuizArena.js';
import { QuizResults } from './components/quiz/QuizResults.js';
import { FavoritesHub } from './components/fanhub/FavoritesHub.js';
import { LeaderboardView } from './components/leaderboard/LeaderboardView.js';
import { ProfileView } from './components/profile/ProfileView.js';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView.js';
import { SportTeam, SportGame, SportNewsArticle, FavoriteTeam, QuizLeague, League, SportsWeekInfo } from './types/sports.js';
import { QuizSettings, QuizQuestion, QuizResultSummary } from './types/quiz.js';
import { User } from './types/auth.js';
import { api } from './services/api.js';
import { sounds } from './services/sounds.js';

export const App: React.FC = () => {
  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<'quiz' | 'fanhub' | 'leaderboard' | 'profile' | 'forgot-password'>('quiz');
  const [showTicker, setShowTicker] = useState(true);
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User State
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);

  // Sports Data
  const [allTeams, setAllTeams] = useState<SportTeam[]>([]);
  const [games, setGames] = useState<SportGame[]>([]);
  const [news, setNews] = useState<SportNewsArticle[]>([]);
  const [selectedScoreDate, setSelectedScoreDate] = useState<string>('');
  const [scoreWeek, setScoreWeek] = useState<SportsWeekInfo | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);

  // Quiz Gameplay State
  const [quizState, setQuizState] = useState<'lobby' | 'playing' | 'results'>('lobby');
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    league: 'all',
    mode: 'classic',
    filter: 'normal',
    questionCount: 10
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [lastResult, setLastResult] = useState<QuizResultSummary | null>(null);

  // Initial Data Load
  useEffect(() => {
    // 1. Check logged in user
    api.getCurrentUser().then(u => {
      if (u) {
        setUser(u);
        api.getFavorites().then(setFavorites);
      } else {
        const saved = localStorage.getItem('sportiq_guest_favorites');
        if (saved) {
          try {
            setFavorites(JSON.parse(saved));
          } catch {}
        }
      }
    });

    // 2. Load teams across all leagues
    setLoadingTeams(true);
    api.getTeams()
      .then(teams => {
        setAllTeams(teams);
      })
      .catch(err => console.error('Failed to load teams:', err))
      .finally(() => setLoadingTeams(false));

    // 3. Load scoreboard & news
    loadScoresAndNews();

    // 4. Check URL for /forgot-password or #forgot-password
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/forgot-password' || hash === '#forgot-password') {
      setCurrentTab('forgot-password');
    }

    const handleUrlChange = () => {
      if (window.location.pathname === '/forgot-password' || window.location.hash === '#forgot-password') {
        setCurrentTab('forgot-password');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const loadScoresAndNews = async (dateParam?: string) => {
    setLoadingGames(true);
    setLoadingNews(true);
    try {
      const [scoreData, n] = await Promise.all([
        api.getScoreboard(undefined, dateParam),
        api.getNews()
      ]);
      setGames(scoreData.games);
      setScoreWeek(scoreData.week);
      if (dateParam) {
        setSelectedScoreDate(dateParam);
      } else if (scoreData.week?.selectedDate) {
        setSelectedScoreDate(scoreData.week.selectedDate);
      }
      setNews(n);
    } catch (err) {
      console.error('Failed to load scoreboard/news:', err);
    } finally {
      setLoadingGames(false);
      setLoadingNews(false);
    }
  };

  const handleScoreDateChange = async (newDate: string) => {
    setSelectedScoreDate(newDate);
    setLoadingGames(true);
    try {
      const scoreData = await api.getScoreboard(undefined, newDate);
      setGames(scoreData.games);
      setScoreWeek(scoreData.week);
    } catch (err) {
      console.error('Failed to load scoreboard for date:', err);
    } finally {
      setLoadingGames(false);
    }
  };

  // Generate Quiz Questions
  const handleStartQuiz = useCallback(() => {
    sounds.playFanfare();

    let candidatePool = allTeams;
    if (quizSettings.league !== 'all') {
      if (quizSettings.league === 'college-football') {
        const fbsAndSwac = allTeams.filter(t => t.league === 'college-football' && t.isFBSorSWAC);
        candidatePool = fbsAndSwac.length >= 20 ? fbsAndSwac : allTeams.filter(t => t.league === 'college-football');
      } else {
        candidatePool = allTeams.filter(t => t.league === quizSettings.league);
      }
    }

    if (candidatePool.length < 4) {
      alert('Not enough teams available in this league. Please choose another league.');
      return;
    }

    const shuffledPool = [...candidatePool].sort(() => Math.random() - 0.5);
    const count = quizSettings.mode === 'blitz' ? 40 : quizSettings.mode === 'streak' ? 50 : quizSettings.questionCount;
    const selectedTargets = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

    const generatedQuestions: QuizQuestion[] = selectedTargets.map((targetTeam, idx) => {
      const sameLeaguePool = candidatePool.filter(t => t.id !== targetTeam.id);
      const distractors = [...sameLeaguePool]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [targetTeam, ...distractors].sort(() => Math.random() - 0.5);

      return {
        id: `q_${idx}_${targetTeam.id}`,
        team: targetTeam,
        options
      };
    });

    setQuestions(generatedQuestions);
    setQuizState('playing');
  }, [allTeams, quizSettings]);

  // Handle Quiz Completion & Submit Score
  const handleQuizComplete = useCallback(async (summary: QuizResultSummary) => {
    setLastResult(summary);
    setQuizState('results');

    try {
      await api.submitScore({
        league: summary.league,
        mode: summary.mode,
        difficulty: summary.filter,
        score: summary.score,
        totalQuestions: summary.totalQuestions,
        correctAnswers: summary.correctAnswers,
        accuracy: summary.accuracy,
        streak: summary.bestStreak,
        guestName: user?.username || 'Rookie Guest'
      });
    } catch (err) {
      console.error('Failed to record score to server:', err);
    }
  }, [user]);

  // Toggle Favorite Team
  const handleToggleFavorite = useCallback(async (team: SportTeam) => {
    const isFav = favorites.some(f => f.teamId === team.id && f.league === team.league);

    if (isFav) {
      if (user && !user.id.startsWith('guest_')) {
        await api.removeFavorite(team.league, team.id);
      }
      const updated = favorites.filter(f => !(f.teamId === team.id && f.league === team.league));
      setFavorites(updated);
      localStorage.setItem('sportiq_guest_favorites', JSON.stringify(updated));
    } else {
      const newFav: FavoriteTeam = {
        id: 'fav_' + Date.now(),
        userId: user?.id || 'guest',
        league: team.league,
        teamId: team.id,
        teamName: team.displayName,
        logoUrl: team.logo,
        abbreviation: team.abbreviation,
        color: team.color,
        createdAt: new Date().toISOString()
      };

      if (user && !user.id.startsWith('guest_')) {
        await api.addFavorite({
          league: team.league,
          teamId: team.id,
          teamName: team.displayName,
          logoUrl: team.logo,
          abbreviation: team.abbreviation,
          color: team.color
        });
      }
      const updated = [...favorites, newFav];
      setFavorites(updated);
      localStorage.setItem('sportiq_guest_favorites', JSON.stringify(updated));
    }
  }, [favorites, user]);

  // Handle User Login/Register Success
  const handleAuthSuccess = useCallback((newUser: User) => {
    setUser(newUser);
    if (!newUser.id.startsWith('guest_')) {
      api.getFavorites().then(setFavorites);
    }
  }, []);

  const handleLogout = useCallback(() => {
    sounds.playClick();
    api.logout();
    setUser(null);
    setFavorites([]);
    localStorage.removeItem('sportiq_guest_favorites');
    setCurrentTab('quiz');
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col text-slate-800">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        showTicker={showTicker}
        setShowTicker={setShowTicker}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        favoriteCount={favorites.length}
      />

      {/* Live Scoreboard Ticker */}
      {showTicker && (
        <Ticker
          favorites={favorites}
          onNavigateToHub={() => setCurrentTab('fanhub')}
        />
      )}

      {/* Main View Body */}
      <main className="flex-1">
        {currentTab === 'quiz' && (
          <>
            {quizState === 'lobby' && (
              <QuizLobby
                settings={quizSettings}
                setSettings={setQuizSettings}
                onStartQuiz={handleStartQuiz}
                loading={loadingTeams}
                totalTeamsCount={allTeams.length}
              />
            )}

            {quizState === 'playing' && (
              <QuizArena
                settings={quizSettings}
                questions={questions}
                onComplete={handleQuizComplete}
                onExit={() => setQuizState('lobby')}
              />
            )}

            {quizState === 'results' && lastResult && (
              <QuizResults
                results={lastResult}
                onPlayAgain={handleStartQuiz}
                onBackToLobby={() => setQuizState('lobby')}
                onViewLeaderboard={() => setCurrentTab('leaderboard')}
                isGuest={!user || user.id.startsWith('guest_')}
                onPromptAuth={() => setIsAuthModalOpen(true)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </>
        )}

        {currentTab === 'fanhub' && (
          <FavoritesHub
            favorites={favorites}
            allTeams={allTeams}
            games={games}
            news={news}
            loadingGames={loadingGames}
            loadingNews={loadingNews}
            scoreWeek={scoreWeek}
            selectedDate={selectedScoreDate}
            onDateChange={handleScoreDateChange}
            onRefresh={() => loadScoresAndNews(selectedScoreDate)}
            onToggleFavorite={handleToggleFavorite}
            isLoggedIn={Boolean(user && !user.id.startsWith('guest_'))}
            onPromptAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardView
            currentUsername={user?.username}
            onStartQuiz={() => { setCurrentTab('quiz'); setQuizState('lobby'); }}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            favorites={favorites}
            onLogout={handleLogout}
            onPromptAuth={() => setIsAuthModalOpen(true)}
            onNavigateToHub={() => setCurrentTab('fanhub')}
            onStartQuiz={() => { setCurrentTab('quiz'); setQuizState('lobby'); }}
          />
        )}

        {currentTab === 'forgot-password' && (
          <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 sm:p-6">
            <ForgotPasswordView
              isStandalonePage={true}
              onSuccess={(u) => {
                handleAuthSuccess(u);
                setCurrentTab('quiz');
                window.history.replaceState(null, '', '/');
              }}
              onBackToLogin={() => {
                setCurrentTab('quiz');
                window.history.replaceState(null, '', '/');
                setIsAuthModalOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">SPORT<span className="text-sky-500">IQ</span></span>
            <span>•</span>
            <span>Sports Logo Quiz & FanHub</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentTab('forgot-password');
                window.history.replaceState(null, '', '/forgot-password');
              }}
              className="text-slate-500 hover:text-sky-600 font-medium hover:underline transition-colors"
            >
              Forgot Password
            </button>
            <span>•</span>
            <span>NFL • NBA • College Football • WNBA</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
