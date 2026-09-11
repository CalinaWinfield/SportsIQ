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
  league: 'nfl' | 'nba' | 'college-football' | 'wnba';
  conference?: string;
  standing?: string;
  record?: string;
  isFBSorSWAC?: boolean;
}

export interface SportGame {
  id: string;
  league: 'nfl' | 'nba' | 'college-football' | 'wnba';
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

const LEAGUE_CONFIG: Record<
  'nfl' | 'nba' | 'college-football' | 'wnba',
  { sport: string; leaguePath: string; teamParams?: string }
> = {
  nfl: { sport: 'football', leaguePath: 'nfl' },
  nba: { sport: 'basketball', leaguePath: 'nba' },
  'college-football': { sport: 'football', leaguePath: 'college-football', teamParams: '?limit=1000' },
  wnba: { sport: 'basketball', leaguePath: 'wnba' }
};

interface CacheItem<T> {
  timestamp: number;
  data: T;
}

const cache: {
  teams: Record<string, CacheItem<SportTeam[]>>;
  scoreboard: Record<string, CacheItem<SportGame[]>>;
  news: Record<string, CacheItem<SportNewsArticle[]>>;
} = {
  teams: {},
  scoreboard: {},
  news: {}
};

const TEAMS_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours
const SCOREBOARD_CACHE_TTL = 1000 * 30;       // 30 seconds
const NEWS_CACHE_TTL = 1000 * 60 * 10;        // 10 minutes

// Allowed College Football conferences
const ALLOWED_CFB_CONFERENCES = new Set([
  'SEC',
  'ACC',
  'Big 12',
  'Big Ten',
  'SWAC',
  'Pac-10',
  'Sun Belt'
]);

async function fetchCfbConferenceMap(): Promise<Map<string, string>> {
  const teamConfMap = new Map<string, string>();
  const standingsUrls = [
    'https://site.api.espn.com/apis/v2/sports/football/college-football/standings',
    'https://site.api.espn.com/apis/v2/sports/football/college-football/standings?group=81'
  ];

  await Promise.all(standingsUrls.map(async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      for (const child of data.children || []) {
        const confName = child.name || '';
        if (child.children && child.children.length > 0) {
          for (const div of child.children) {
            let divConf = '';
            if (div.name?.includes('Sun Belt') || confName.includes('Sun Belt')) {
              divConf = 'Sun Belt';
            } else if (div.name?.includes('Southwestern') || confName.includes('Southwestern')) {
              divConf = 'SWAC';
            }

            if (divConf && ALLOWED_CFB_CONFERENCES.has(divConf)) {
              for (const entry of div.standings?.entries || []) {
                if (entry.team?.id) {
                  teamConfMap.set(String(entry.team.id), divConf);
                }
              }
            }
          }
        } else if (child.standings?.entries) {
          let normalized = '';
          if (confName.includes('Southeastern')) normalized = 'SEC';
          else if (confName.includes('Atlantic Coast')) normalized = 'ACC';
          else if (confName.includes('Big Ten')) normalized = 'Big Ten';
          else if (confName.includes('Big 12')) normalized = 'Big 12';
          else if (confName.includes('Pac-12') || confName.includes('Pac-10')) normalized = 'Pac-10';

          if (normalized && ALLOWED_CFB_CONFERENCES.has(normalized)) {
            for (const entry of child.standings.entries) {
              if (entry.team?.id) {
                teamConfMap.set(String(entry.team.id), normalized);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching CFB standings conference map:', err);
    }
  }));

  return teamConfMap;
}

export const espnService = {
  async getTeams(leagueKey: 'nfl' | 'nba' | 'college-football' | 'wnba'): Promise<SportTeam[]> {
    const cached = cache.teams[leagueKey];
    const now = Date.now();
    if (cached && now - cached.timestamp < TEAMS_CACHE_TTL && cached.data.length > 0) {
      return cached.data;
    }

    const conf = LEAGUE_CONFIG[leagueKey];
    if (!conf) return [];

    const url = `https://site.api.espn.com/apis/site/v2/sports/${conf.sport}/${conf.leaguePath}/teams${conf.teamParams || ''}`;

    try {
      let cfbConfMap: Map<string, string> | null = null;
      if (leagueKey === 'college-football') {
        cfbConfMap = await fetchCfbConferenceMap();
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`ESPN API returned ${res.status}`);
      const json = await res.json();
      const rawTeams = json.sports?.[0]?.leagues?.[0]?.teams || [];

      let teams: SportTeam[] = rawTeams
        .map((item: any) => {
          const t = item.team;
          if (!t) return null;
          const logoUrl = t.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/${conf.leaguePath === 'college-football' ? 'ncaa' : conf.leaguePath}/500/${t.id}.png`;

          let teamConference = t.groups?.name || undefined;
          let isFBSorSWAC = false;

          if (leagueKey === 'college-football' && cfbConfMap) {
            const mappedConf = cfbConfMap.get(String(t.id));
            if (!mappedConf) {
              // Filter out schools NOT in the 7 allowed conferences
              return null;
            }
            teamConference = mappedConf;
            isFBSorSWAC = true;
          }

          return {
            id: String(t.id),
            name: t.name || t.displayName,
            displayName: t.displayName,
            shortDisplayName: t.shortDisplayName || t.name,
            abbreviation: t.abbreviation || t.id,
            location: t.location || '',
            nickname: t.nickname || t.name,
            logo: logoUrl,
            color: t.color ? `#${t.color}` : undefined,
            alternateColor: t.alternateColor ? `#${t.alternateColor}` : undefined,
            league: leagueKey,
            conference: teamConference,
            standing: t.standingSummary,
            record: t.record?.items?.[0]?.summary,
            isFBSorSWAC
          };
        })
        .filter((t: any): t is SportTeam => Boolean(t && t.logo));

      if (leagueKey === 'college-football') {
        teams.sort((a, b) => a.displayName.localeCompare(b.displayName));
      }

      cache.teams[leagueKey] = { timestamp: now, data: teams };
      return teams;
    } catch (err) {
      console.error(`Error fetching teams for ${leagueKey}:`, err);
      return cached?.data || [];
    }
  },

  async getAllTeams(): Promise<SportTeam[]> {
    const leagues: Array<'nfl' | 'nba' | 'college-football' | 'wnba'> = [
      'nfl',
      'nba',
      'college-football',
      'wnba'
    ];
    const results = await Promise.all(leagues.map(l => this.getTeams(l)));
    return results.flat();
  },

  async getScoreboard(leagueKey?: 'nfl' | 'nba' | 'college-football' | 'wnba'): Promise<SportGame[]> {
    if (!leagueKey) {
      const leagues: Array<'nfl' | 'nba' | 'college-football' | 'wnba'> = [
        'nfl',
        'nba',
        'college-football',
        'wnba'
      ];
      const results = await Promise.all(leagues.map(l => this.getScoreboard(l)));
      return results.flat().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    const cached = cache.scoreboard[leagueKey];
    const now = Date.now();
    if (cached && now - cached.timestamp < SCOREBOARD_CACHE_TTL) {
      return cached.data;
    }

    const conf = LEAGUE_CONFIG[leagueKey];
    if (!conf) return [];

    const url = `https://site.api.espn.com/apis/site/v2/sports/${conf.sport}/${conf.leaguePath}/scoreboard`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`ESPN Scoreboard API returned ${res.status}`);
      const json = await res.json();
      const events = json.events || [];

      const games: SportGame[] = events.map((ev: any) => {
        const comp = ev.competitions?.[0];
        const statusType = ev.status?.type;
        const competitors = comp?.competitors || [];
        const homeComp = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
        const awayComp = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];

        const isLive = statusType?.state === 'in';
        const isCompleted = statusType?.completed === true;

        const broadcast = comp?.broadcasts?.[0]?.names?.[0] || comp?.geoBroadcasts?.[0]?.media?.shortName;

        return {
          id: String(ev.id),
          league: leagueKey,
          date: ev.date,
          name: ev.name,
          shortName: ev.shortName,
          status: statusType?.name || 'STATUS_SCHEDULED',
          statusDetail: statusType?.shortDetail || statusType?.detail || 'Scheduled',
          isLive,
          isCompleted,
          broadcast,
          venue: comp?.venue?.fullName,
          homeTeam: {
            id: String(homeComp?.team?.id || ''),
            name: homeComp?.team?.displayName || 'Home Team',
            abbreviation: homeComp?.team?.abbreviation || '',
            logo: homeComp?.team?.logo || '',
            score: homeComp?.score || '0',
            record: homeComp?.records?.[0]?.summary,
            color: homeComp?.team?.color ? `#${homeComp?.team?.color}` : undefined
          },
          awayTeam: {
            id: String(awayComp?.team?.id || ''),
            name: awayComp?.team?.displayName || 'Away Team',
            abbreviation: awayComp?.team?.abbreviation || '',
            logo: awayComp?.team?.logo || '',
            score: awayComp?.score || '0',
            record: awayComp?.records?.[0]?.summary,
            color: awayComp?.team?.color ? `#${awayComp?.team?.color}` : undefined
          }
        };
      });

      cache.scoreboard[leagueKey] = { timestamp: now, data: games };
      return games;
    } catch (err) {
      console.error(`Error fetching scoreboard for ${leagueKey}:`, err);
      return cached?.data || [];
    }
  },

  async getNews(leagueKey?: 'nfl' | 'nba' | 'college-football' | 'wnba', teamId?: string): Promise<SportNewsArticle[]> {
    const key = `${leagueKey || 'all'}_${teamId || 'general'}`;
    const cached = cache.news[key];
    const now = Date.now();
    if (cached && now - cached.timestamp < NEWS_CACHE_TTL) {
      return cached.data;
    }

    const leaguesToQuery: Array<'nfl' | 'nba' | 'college-football' | 'wnba'> = leagueKey
      ? [leagueKey]
      : ['nfl', 'nba', 'college-football', 'wnba'];

    try {
      const articlesPromises = leaguesToQuery.map(async (lKey) => {
        const conf = LEAGUE_CONFIG[lKey];
        let url = `https://site.api.espn.com/apis/site/v2/sports/${conf.sport}/${conf.leaguePath}/news`;
        if (teamId) {
          url += `?team=${teamId}`;
        }
        const res = await fetch(url);
        if (!res.ok) return [];
        const json = await res.json();
        const rawArticles = json.articles || [];

        return rawArticles.map((art: any) => ({
          id: String(art.id || art.headline),
          headline: art.headline,
          description: art.description || '',
          published: art.published,
          byline: art.byline,
          imageUrl: art.images?.[0]?.url,
          link: art.links?.web?.href || art.links?.api?.news?.href || '',
          league: lKey
        }));
      });

      const nested = await Promise.all(articlesPromises);
      const combined = nested.flat().sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

      cache.news[key] = { timestamp: now, data: combined.slice(0, 30) };
      return cache.news[key].data;
    } catch (err) {
      console.error('Error fetching ESPN news:', err);
      return cached?.data || [];
    }
  },

  async getTeamSchedule(leagueKey: 'nfl' | 'nba' | 'college-football' | 'wnba', teamId: string): Promise<any[]> {
    const conf = LEAGUE_CONFIG[leagueKey];
    if (!conf) return [];

    const url = `https://site.api.espn.com/apis/site/v2/sports/${conf.sport}/${conf.leaguePath}/teams/${teamId}/schedule`;

    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      return json.events || [];
    } catch (err) {
      console.error(`Error fetching schedule for ${leagueKey} team ${teamId}:`, err);
      return [];
    }
  }
};
