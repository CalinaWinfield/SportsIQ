import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
}

export interface ScoreRecord {
  id: string;
  userId: string;
  username: string;
  league: string; // 'all' | 'nfl' | 'nba' | 'college-football' | 'wnba'
  mode: string;   // 'classic' | 'blitz' | 'streak'
  difficulty: string; // 'normal' | 'silhouette' | 'zoomed'
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  streak: number;
  createdAt: string;
}

export interface FavoriteTeam {
  id: string;
  userId: string;
  league: string;
  teamId: string;
  teamName: string;
  logoUrl: string;
  abbreviation: string;
  color?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  scores: ScoreRecord[];
  favorites: FavoriteTeam[];
}

let inMemoryDb: DatabaseSchema = {
  users: [],
  scores: [],
  favorites: []
};

// Ensure data folder and file exist
function initDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(raw);
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Failed to initialize database file, using in-memory store:', err);
  }
}

function saveDb(): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

initDb();

// DB Queries
export const db = {
  // Users
  findUserById: (id: string): User | undefined => {
    return inMemoryDb.users.find(u => u.id === id);
  },

  findUserByUsername: (username: string): User | undefined => {
    return inMemoryDb.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  findUserByEmail: (email: string): User | undefined => {
    return inMemoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser: (user: User): User => {
    inMemoryDb.users.push(user);
    saveDb();
    return user;
  },

  updateUser: (id: string, updates: Partial<User>): User | undefined => {
    const idx = inMemoryDb.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    inMemoryDb.users[idx] = { ...inMemoryDb.users[idx], ...updates };
    saveDb();
    return inMemoryDb.users[idx];
  },

  // Scores
  addScore: (record: ScoreRecord): ScoreRecord => {
    inMemoryDb.scores.push(record);
    saveDb();
    return record;
  },

  getUserScores: (userId: string): ScoreRecord[] => {
    return inMemoryDb.scores
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUserStats: (userId: string) => {
    const userScores = inMemoryDb.scores.filter(s => s.userId === userId);
    const totalGames = userScores.length;
    if (totalGames === 0) {
      return {
        totalGames: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        overallAccuracy: 0,
        highestScore: 0,
        bestStreak: 0,
        byLeague: {}
      };
    }

    let totalCorrect = 0;
    let totalQuestions = 0;
    let highestScore = 0;
    let bestStreak = 0;
    const byLeague: Record<string, { games: number; highestScore: number; bestStreak: number }> = {};

    for (const s of userScores) {
      totalCorrect += s.correctAnswers;
      totalQuestions += s.totalQuestions;
      if (s.score > highestScore) highestScore = s.score;
      if (s.streak > bestStreak) bestStreak = s.streak;

      if (!byLeague[s.league]) {
        byLeague[s.league] = { games: 0, highestScore: 0, bestStreak: 0 };
      }
      byLeague[s.league].games++;
      if (s.score > byLeague[s.league].highestScore) {
        byLeague[s.league].highestScore = s.score;
      }
      if (s.streak > byLeague[s.league].bestStreak) {
        byLeague[s.league].bestStreak = s.streak;
      }
    }

    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalGames,
      totalCorrect,
      totalQuestions,
      overallAccuracy,
      highestScore,
      bestStreak,
      byLeague
    };
  },

  getLeaderboard: (league?: string, mode?: string, limit = 50): ScoreRecord[] => {
    let list = [...inMemoryDb.scores];
    if (league && league !== 'all') {
      list = list.filter(s => s.league === league);
    }
    if (mode && mode !== 'all') {
      list = list.filter(s => s.mode === mode);
    }

    // Deduplicate: For each user and quiz type (league + mode + quiz length/questions + difficulty),
    // only retain their single attempt with the highest score.
    const bestScoresMap = new Map<string, ScoreRecord>();

    for (const record of list) {
      const userKey = record.userId && !record.userId.startsWith('guest_')
        ? record.userId
        : (record.username || record.userId || 'guest').toLowerCase();

      // For classic mode, question count (10, 20) defines the quiz length.
      // For modes like blitz or streak, question count is dynamic/fixed for the mode.
      const quizLengthKey = record.mode === 'classic' ? String(record.totalQuestions || 0) : 'fixed';
      const quizTypeKey = `${record.league}:::${record.mode}:::${quizLengthKey}:::${record.difficulty || 'normal'}`;
      const compositeKey = `${userKey}:::${quizTypeKey}`;

      const existing = bestScoresMap.get(compositeKey);
      if (!existing) {
        bestScoresMap.set(compositeKey, record);
      } else {
        if (record.score > existing.score) {
          bestScoresMap.set(compositeKey, record);
        } else if (record.score === existing.score) {
          // Tiebreakers: higher accuracy, then more recent attempt
          if (record.accuracy > existing.accuracy) {
            bestScoresMap.set(compositeKey, record);
          } else if (record.accuracy === existing.accuracy) {
            if (new Date(record.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
              bestScoresMap.set(compositeKey, record);
            }
          }
        }
      }
    }

    const deduplicated = Array.from(bestScoresMap.values());

    // Sort primarily by score descending, secondarily by accuracy descending, tertiarily by most recent
    deduplicated.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return deduplicated.slice(0, limit);
  },

  // Favorites
  getFavorites: (userId: string): FavoriteTeam[] => {
    return inMemoryDb.favorites.filter(f => f.userId === userId);
  },

  addFavorite: (fav: FavoriteTeam): FavoriteTeam => {
    const exists = inMemoryDb.favorites.some(
      f => f.userId === fav.userId && f.league === fav.league && f.teamId === fav.teamId
    );
    if (!exists) {
      inMemoryDb.favorites.push(fav);
      saveDb();
    }
    return fav;
  },

  removeFavorite: (userId: string, league: string, teamId: string): boolean => {
    const initialLen = inMemoryDb.favorites.length;
    inMemoryDb.favorites = inMemoryDb.favorites.filter(
      f => !(f.userId === userId && f.league === league && f.teamId === teamId)
    );
    if (inMemoryDb.favorites.length !== initialLen) {
      saveDb();
      return true;
    }
    return false;
  }
};
