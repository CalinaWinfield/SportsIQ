export type League = 'nfl' | 'nba' | 'college-football' | 'wnba';
export type QuizLeague = League | 'all';

export interface SportTeam {
  id: string;
  name: string;
  displayName: string;
  shortDisplayName: string;
  abbreviation: string;
  location: string;
  nickname: string;
  logo: string;
  color?: string;
  alternateColor?: string;
  league: League;
  conference?: string;
  standing?: string;
  record?: string;
  isFBSorSWAC?: boolean;
}

export interface SportGame {
  id: string;
  league: League;
  date: string;
  name: string;
  shortName: string;
  status: string;
  statusDetail: string;
  isLive: boolean;
  isCompleted: boolean;
  broadcast?: string;
  venue?: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: string;
    record?: string;
    color?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: string;
    record?: string;
    color?: string;
  };
}

export interface SportNewsArticle {
  id: string;
  headline: string;
  description: string;
  published: string;
  byline?: string;
  imageUrl?: string;
  link: string;
  league: string;
}

export interface FavoriteTeam {
  id: string;
  userId: string;
  league: League;
  teamId: string;
  teamName: string;
  logoUrl: string;
  abbreviation: string;
  color?: string;
  createdAt: string;
}
