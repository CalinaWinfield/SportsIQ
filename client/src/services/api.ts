import { SportTeam, SportGame, SportNewsArticle, FavoriteTeam, League, QuizLeague } from '../types/sports.js';
import { User, LeaderboardEntry, UserStats } from '../types/auth.js';

const TOKEN_KEY = 'sportiq_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP error! status: ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(username: string, email: string, password: string, avatar?: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, avatar })
    });
    tokenStorage.set(data.token);
    return data;
  },

  async login(usernameOrEmail: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });
    tokenStorage.set(data.token);
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = tokenStorage.get();
    if (!token) return null;
    try {
      const data = await request<{ user: User }>('/api/auth/me');
      return data.user;
    } catch {
      tokenStorage.clear();
      return null;
    }
  },

  async updateProfile(avatar: string): Promise<User> {
    const data = await request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ avatar })
    });
    return data.user;
  },

  logout(): void {
    tokenStorage.clear();
  },

  // Scores & Leaderboard
  async submitScore(payload: {
    league: string;
    mode: string;
    difficulty: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    streak: number;
    guestName?: string;
  }) {
    return request<{ success: boolean; record: any }>('/api/scores', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getLeaderboard(league?: string, mode?: string): Promise<LeaderboardEntry[]> {
    const params = new URLSearchParams();
    if (league && league !== 'all') params.set('league', league);
    if (mode && mode !== 'all') params.set('mode', mode);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ leaderboard: LeaderboardEntry[] }>(`/api/scores/leaderboard${qs}`);
    return res.leaderboard || [];
  },

  async getUserStats(): Promise<UserStats | null> {
    try {
      const res = await request<{ stats: UserStats }>('/api/scores/user-stats');
      return res.stats;
    } catch {
      return null;
    }
  },

  async getUserHistory(): Promise<any[]> {
    try {
      const res = await request<{ history: any[] }>('/api/scores/history');
      return res.history || [];
    } catch {
      return [];
    }
  },

  // Favorites
  async getFavorites(): Promise<FavoriteTeam[]> {
    try {
      const res = await request<{ favorites: FavoriteTeam[] }>('/api/teams/favorites');
      return res.favorites || [];
    } catch {
      return [];
    }
  },

  async addFavorite(team: {
    league: League;
    teamId: string;
    teamName: string;
    logoUrl: string;
    abbreviation: string;
    color?: string;
  }): Promise<FavoriteTeam> {
    const res = await request<{ favorite: FavoriteTeam }>('/api/teams/favorites', {
      method: 'POST',
      body: JSON.stringify(team)
    });
    return res.favorite;
  },

  async removeFavorite(league: string, teamId: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/teams/favorites/${league}/${teamId}`, {
      method: 'DELETE'
    });
    return res.success;
  },

  // ESPN Data
  async getTeams(league?: QuizLeague): Promise<SportTeam[]> {
    const qs = league && league !== 'all' ? `?league=${league}` : '';
    const res = await request<{ teams: SportTeam[] }>(`/api/espn/teams${qs}`);
    return res.teams || [];
  },

  async getScoreboard(league?: League): Promise<SportGame[]> {
    const qs = league ? `?league=${league}` : '';
    const res = await request<{ games: SportGame[] }>(`/api/espn/scoreboard${qs}`);
    return res.games || [];
  },

  async getNews(league?: League, teamId?: string): Promise<SportNewsArticle[]> {
    const params = new URLSearchParams();
    if (league) params.set('league', league);
    if (teamId) params.set('teamId', teamId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await request<{ news: SportNewsArticle[] }>(`/api/espn/news${qs}`);
    return res.news || [];
  },

  async getTeamSchedule(league: League, teamId: string): Promise<any[]> {
    const res = await request<{ schedule: any[] }>(`/api/espn/teams/${league}/${teamId}/schedule`);
    return res.schedule || [];
  }
};
