import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flame, Heart, Zap, Clock, HelpCircle, Check, X, SkipForward } from 'lucide-react';
import { QuizQuestion, QuizSettings, UserAnswerRecord, QuizResultSummary } from '../../types/quiz.js';
import { SportTeam } from '../../types/sports.js';
import { sounds } from '../../services/sounds.js';

interface QuizArenaProps {
  settings: QuizSettings;
  questions: QuizQuestion[];
  onComplete: (summary: QuizResultSummary) => void;
  onExit: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  settings,
  questions,
  onComplete,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(60);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [revealedHint, setRevealedHint] = useState<string | null>(null);
  const [records, setRecords] = useState<UserAnswerRecord[]>([]);

  const questionStartTimeRef = useRef<number>(Date.now());
  const blitzStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex];
  const isClassic = settings.mode === 'classic';
  const isBlitz = settings.mode === 'blitz';
  const isStreak = settings.mode === 'streak';

  // Finish quiz callback
  const finishQuiz = useCallback((finalRecords: UserAnswerRecord[], finalScore: number, finalStreak: number, finalBestStreak: number) => {
    clearInterval(timerRef.current);
    const correctCount = finalRecords.filter(r => r.correct).length;
    const totalCount = finalRecords.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const timeSpent = isBlitz ? 60 - blitzTimeLeft : Math.round((Date.now() - blitzStartTimeRef.current) / 1000);

    onComplete({
      score: finalScore,
      correctAnswers: correctCount,
      totalQuestions: totalCount,
      accuracy,
      streak: finalStreak,
      bestStreak: finalBestStreak,
      timeSpentSeconds: Math.max(1, timeSpent),
      league: settings.league,
      mode: settings.mode,
      filter: settings.filter,
      records: finalRecords
    });
  }, [blitzTimeLeft, isBlitz, onComplete, settings]);

  // Next question or finish
  const handleNextQuestion = useCallback((newRecords: UserAnswerRecord[], newScore: number, newStreak: number, newBestStreak: number, newLives: number) => {
    if (isStreak && newLives <= 0) {
      finishQuiz(newRecords, newScore, newStreak, newBestStreak);
      return;
    }

    if (currentIndex + 1 >= questions.length) {
      finishQuiz(newRecords, newScore, newStreak, newBestStreak);
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setRevealedHint(null);
    setQuestionTimeLeft(15);
    questionStartTimeRef.current = Date.now();
  }, [currentIndex, finishQuiz, isStreak, questions.length]);

  // Answer selection handler
  const handleSelectOption = useCallback((selectedTeam: SportTeam) => {
    if (isAnswered || !currentQuestion) return;

    setIsAnswered(true);
    setSelectedOptionId(selectedTeam.id);

    const isCorrect = selectedTeam.id === currentQuestion.team.id;
    const timeSpentMs = Date.now() - questionStartTimeRef.current;

    let points = 0;
    let nextStreak = streak;
    let nextBestStreak = bestStreak;
    let nextLives = lives;

    if (isCorrect) {
      sounds.playCorrect();
      nextStreak = streak + 1;
      if (nextStreak > nextBestStreak) nextBestStreak = nextStreak;
      if (nextStreak >= 3) {
        sounds.playStreak();
      }

      // Base points + streak multiplier + speed bonus
      const basePoints = 100;
      const speedBonus = isClassic ? Math.max(0, Math.floor(questionTimeLeft * 10)) : 20;
      const streakMultiplier = nextStreak > 4 ? 2 : nextStreak > 2 ? 1.5 : 1;
      const hintDeduction = revealedHint ? 30 : 0;

      points = Math.round((basePoints + speedBonus) * streakMultiplier) - hintDeduction;
    } else {
      sounds.playWrong();
      nextStreak = 0;
      if (isStreak) {
        nextLives = lives - 1;
        setLives(nextLives);
      }
    }

    const newScore = score + points;
    setScore(newScore);
    setStreak(nextStreak);
    setBestStreak(nextBestStreak);

    const record: UserAnswerRecord = {
      questionIndex: currentIndex,
      question: currentQuestion,
      selectedTeamId: selectedTeam.id,
      correct: isCorrect,
      timeSpentMs,
      pointsEarned: points
    };

    const nextRecords = [...records, record];
    setRecords(nextRecords);

    // Auto-advance after 800ms
    setTimeout(() => {
      handleNextQuestion(nextRecords, newScore, nextStreak, nextBestStreak, nextLives);
    }, 850);
  }, [bestStreak, currentIndex, currentQuestion, handleNextQuestion, isAnswered, isClassic, isStreak, lives, questionTimeLeft, records, revealedHint, score, streak]);

  // Hint Reveal
  const handleRevealHint = () => {
    if (revealedHint || isAnswered || !currentQuestion) return;
    sounds.playClick();
    const conf = currentQuestion.team.conference;
    const loc = currentQuestion.team.location;
    if (conf) {
      setRevealedHint(`Conference: ${conf}`);
    } else if (loc) {
      setRevealedHint(`City / Location: ${loc}`);
    } else {
      setRevealedHint(`League: ${currentQuestion.team.league.toUpperCase()}`);
    }
  };

  // Keyboard Shortcuts (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || !currentQuestion) return;
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const idx = parseInt(key, 10) - 1;
        if (currentQuestion.options[idx]) {
          handleSelectOption(currentQuestion.options[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, handleSelectOption, isAnswered]);

  // Timers
  useEffect(() => {
    if (isBlitz) {
      timerRef.current = setInterval(() => {
        setBlitzTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishQuiz(records, score, streak, bestStreak);
            return 0;
          }
          if (prev <= 10) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    } else if (isClassic && !isAnswered) {
      timerRef.current = setInterval(() => {
        setQuestionTimeLeft(prev => {
          if (prev <= 1) {
            if (!isAnswered && currentQuestion) {
              sounds.playWrong();
              setIsAnswered(true);
              const timeoutRecord: UserAnswerRecord = {
                questionIndex: currentIndex,
                question: currentQuestion,
                selectedTeamId: '',
                correct: false,
                timeSpentMs: 15000,
                pointsEarned: 0
              };
              const updatedRecords = [...records, timeoutRecord];
              setRecords(updatedRecords);
              setStreak(0);
              setTimeout(() => {
                handleNextQuestion(updatedRecords, score, 0, bestStreak, lives);
              }, 850);
            }
            return 0;
          }
          if (prev <= 5) {
            sounds.playTick();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [bestStreak, currentIndex, currentQuestion, finishQuiz, handleNextQuestion, isAnswered, isBlitz, isClassic, lives, records, score, streak]);

  if (!currentQuestion) {
    return <div className="text-center py-20 text-slate-700">Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 animate-fade-in">
      {/* Top Arena Status Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Progress / Mode Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-500 text-white shadow-xs">
            {settings.league.toUpperCase()}
          </span>

          {isClassic && (
            <div className="text-sm font-extrabold text-slate-800">
              Question <span className="text-sky-600 font-black">{currentIndex + 1}</span> of {questions.length}
            </div>
          )}

          {isBlitz && (
            <div className={`flex items-center gap-1 text-sm font-black font-mono ${blitzTimeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-sky-600'}`}>
              <Clock className="w-4 h-4" />
              <span>{blitzTimeLeft}s LEFT</span>
            </div>
          )}

          {isStreak && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Center: Streak Combo Badge */}
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-black animate-bounce-short shadow-xs">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak} STREAK {streak >= 5 ? '(2.0x PTS)' : streak >= 3 ? '(1.5x PTS)' : ''}</span>
            </div>
          )}
        </div>

        {/* Right: Live Score & Exit */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</div>
            <div className="text-xl font-black text-slate-900 font-sports tracking-wide">
              {score.toLocaleString()}
            </div>
          </div>

          <button
            onClick={onExit}
            className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all font-semibold"
          >
            Quit
          </button>
        </div>
      </div>

      {/* Timer Progress Bar (for Classic mode) */}
      {isClassic && (
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              questionTimeLeft <= 5 ? 'bg-rose-500' : questionTimeLeft <= 9 ? 'bg-amber-400' : 'bg-sky-500'
            }`}
            style={{ width: `${(questionTimeLeft / 15) * 100}%` }}
          />
        </div>
      )}

      {/* Logo Showcase Arena */}
      <div className="relative bg-white border border-slate-200 rounded-3xl p-8 mb-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px] overflow-hidden group">
        {/* Subtle Stadium Radial Spotlight in Light Blue */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none" />

        {/* Visual Filter Badge */}
        {settings.filter !== 'normal' && (
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-extrabold uppercase text-slate-700 tracking-wider shadow-2xs">
            {settings.filter === 'silhouette' ? '👤 Silhouette Mode' : '🔍 Zoomed In'}
          </div>
        )}

        {/* Hint Display */}
        {revealedHint && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-800 text-xs font-bold animate-fade-in shadow-2xs">
            💡 {revealedHint}
          </div>
        )}

        {/* Logo Image Container */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-inner overflow-hidden">
          <img
            src={currentQuestion.team.logo}
            alt="Mystery Sports Logo"
            className={`max-w-full max-h-full object-contain transition-all duration-300 select-none ${
              settings.filter === 'silhouette' && !isAnswered ? 'logo-silhouette' : ''
            } ${
              settings.filter === 'zoomed' && !isAnswered ? 'logo-zoomed' : ''
            }`}
            draggable={false}
          />
        </div>

        {/* Revealed Name on Answer */}
        <div className="h-6 mt-4">
          {isAnswered && (
            <div className="text-sm font-extrabold text-slate-900 animate-fade-in flex items-center gap-2">
              <span>{currentQuestion.team.displayName}</span>
              {currentQuestion.team.conference && (
                <span className="text-xs text-slate-500 font-normal">
                  ({currentQuestion.team.conference})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.id === currentQuestion.team.id;

          let btnStyle = 'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 text-slate-800 shadow-xs';

          if (isAnswered) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-md ring-1 ring-emerald-400';
            } else if (isSelected) {
              btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 shadow-md ring-1 ring-rose-400';
            } else {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              disabled={isAnswered}
              className={`p-4 rounded-xl border text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between group active:scale-[0.99] ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                  isAnswered && isCorrect
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : isAnswered && isSelected
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-200'
                }`}>
                  {idx + 1}
                </span>
                <span className="truncate">{option.displayName}</span>
              </div>

              {isAnswered && isCorrect && (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-scale-in" />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <X className="w-5 h-5 text-rose-600 flex-shrink-0 animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Controls: Hint & Skip */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
        <div className="hidden sm:block">
          Press keys <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700 shadow-2xs">1</kbd> to <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700 shadow-2xs">4</kbd> on your keyboard
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {!revealedHint && !isAnswered && (
            <button
              onClick={handleRevealHint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-all font-semibold shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Reveal Hint (-30 pts)</span>
            </button>
          )}

          {!isAnswered && (
            <button
              onClick={() => handleSelectOption({ id: 'skip', name: 'Skipped' } as any)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2.5 py-1.5 transition-colors font-medium"
            >
              <span>Skip</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
