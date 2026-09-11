import { SportTeam, QuizLeague } from './sports.js';

export type GameMode = 'classic' | 'blitz' | 'streak';
export type VisualFilter = 'normal' | 'silhouette' | 'zoomed';

export interface QuizQuestion {
  id: string;
  team: SportTeam;
  options: SportTeam[];
  revealedHint?: 'conference' | 'location' | null;
}

export interface UserAnswerRecord {
  questionIndex: number;
  question: QuizQuestion;
  selectedTeamId: string;
  correct: boolean;
  timeSpentMs: number;
  pointsEarned: number;
}

export interface QuizSettings {
  league: QuizLeague;
  mode: GameMode;
  filter: VisualFilter;
  questionCount: number;
}

export interface QuizResultSummary {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
  timeSpentSeconds: number;
  league: QuizLeague;
  mode: GameMode;
  filter: VisualFilter;
  records: UserAnswerRecord[];
}
