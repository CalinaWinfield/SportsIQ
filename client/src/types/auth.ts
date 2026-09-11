export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  league: string;
  mode: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  streak: number;
  createdAt: string;
}

export interface UserStats {
  totalGames: number;
  totalCorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
  highestScore: number;
  bestStreak: number;
  byLeague: Record<string, { games: number; highestScore: number; bestStreak: number }>;
}
