const LEAGUE_CONFIG = {
    nfl: { sport: 'football', leaguePath: 'nfl' },
    nba: { sport: 'basketball', leaguePath: 'nba' },
    'college-football': { sport: 'football', leaguePath: 'college-football', teamParams: '?limit=1000' },
    wnba: { sport: 'basketball', leaguePath: 'wnba' }
};
const cache = {
    teams: {},
    scoreboard: {},
    news: {}
};
const TEAMS_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours
const SCOREBOARD_CACHE_TTL = 1000 * 30; // 30 seconds
const NEWS_CACHE_TTL = 1000 * 60 * 10; // 10 minutes
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
async function fetchCfbConferenceMap() {
    const teamConfMap = new Map();
    const standingsUrls = [
        'https://site.api.espn.com/apis/v2/sports/football/college-football/standings',
        'https://site.api.espn.com/apis/v2/sports/football/college-football/standings?group=81'
    ];
    await Promise.all(standingsUrls.map(async (url) => {
        try {
            const res = await fetch(url);
            if (!res.ok)
                return;
            const data = await res.json();
            for (const child of data.children || []) {
                const confName = child.name || '';
                if (child.children && child.children.length > 0) {
                    for (const div of child.children) {
                        let divConf = '';
                        if (div.name?.includes('Sun Belt') || confName.includes('Sun Belt')) {
                            divConf = 'Sun Belt';
                        }
                        else if (div.name?.includes('Southwestern') || confName.includes('Southwestern')) {
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
                }
                else if (child.standings?.entries) {
                    let normalized = '';
                    if (confName.includes('Southeastern'))
                        normalized = 'SEC';
                    else if (confName.includes('Atlantic Coast'))
                        normalized = 'ACC';
                    else if (confName.includes('Big Ten'))
                        normalized = 'Big Ten';
                    else if (confName.includes('Big 12'))
                        normalized = 'Big 12';
                    else if (confName.includes('Pac-12') || confName.includes('Pac-10'))
                        normalized = 'Pac-10';
                    if (normalized && ALLOWED_CFB_CONFERENCES.has(normalized)) {
                        for (const entry of child.standings.entries) {
                            if (entry.team?.id) {
                                teamConfMap.set(String(entry.team.id), normalized);
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            console.error('Error fetching CFB standings conference map:', err);
        }
    }));
    return teamConfMap;
}
export function parseLocalDate(input) {
    if (!input)
        return new Date();
    if (input instanceof Date)
        return input;
    if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
        const [y, m, d] = input.split('-').map(Number);
        return new Date(y, m - 1, d, 12, 0, 0);
    }
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}
export function getSportsDateYMD(date, timeZone = 'America/New_York') {
    const d = parseLocalDate(date);
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    return formatter.format(d);
}
export function getSportsWeekRange(refDate) {
    const ymd = getSportsDateYMD(refDate || new Date());
    const [year, month, day] = ymd.split('-').map(Number);
    const base = new Date(year, month - 1, day, 12, 0, 0);
    const dayOfWeek = base.getDay(); // 0 = Sun, 1 = Mon, ..., 3 = Wed, ..., 6 = Sat
    const diffToWed = (dayOfWeek - 3 + 7) % 7;
    const wedDate = new Date(base);
    wedDate.setDate(base.getDate() - diffToWed);
    const tueDate = new Date(wedDate);
    tueDate.setDate(wedDate.getDate() + 6);
    const formatStr = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dayStr}`;
    };
    const wedYmd = formatStr(wedDate);
    const tueYmd = formatStr(tueDate);
    const startFmt = wedYmd.replace(/-/g, '');
    const endFmt = tueYmd.replace(/-/g, '');
    const startDisplay = wedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    const endDisplay = tueDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    return {
        startWednesday: wedYmd,
        endTuesday: tueYmd,
        startFormatted: startFmt,
        endFormatted: endFmt,
        espnDatesParam: `${startFmt}-${endFmt}`,
        displayLabel: `${startDisplay} – ${endDisplay}`,
        selectedDate: ymd
    };
}
export const espnService = {
    async getTeams(leagueKey) {
        const cached = cache.teams[leagueKey];
        const now = Date.now();
        if (cached && now - cached.timestamp < TEAMS_CACHE_TTL && cached.data.length > 0) {
            return cached.data;
        }
        const conf = LEAGUE_CONFIG[leagueKey];
        if (!conf)
            return [];
        const url = `https://site.api.espn.com/apis/site/v2/sports/${conf.sport}/${conf.leaguePath}/teams${conf.teamParams || ''}`;
        try {
            let cfbConfMap = null;
            if (leagueKey === 'college-football') {
                cfbConfMap = await fetchCfbConferenceMap();
            }
            const res = await fetch(url);
            if (!res.ok)
                throw new Error(`ESPN API returned ${res.status}`);
            const json = await res.json();
            const rawTeams = json.sports?.[0]?.leagues?.[0]?.teams || [];
            let teams = rawTeams
                .map((item) => {
                const t = item.team;
                if (!t)
                    return null;
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
                .filter((t) => Boolean(t && t.logo));
            if (leagueKey === 'college-football') {
                teams.sort((a, b) => a.displayName.localeCompare(b.displayName));
            }
            cache.teams[leagueKey] = { timestamp: now, data: teams };
            return teams;
        }
        catch (err) {
            console.error(`Error fetching teams for ${leagueKey}:`, err);
            return cached?.data || [];
        }
    },
    async getAllTeams() {
        const leagues = [
            'nfl',
            'nba',
            'college-football',
            'wnba'
        ];
        const results = await Promise.all(leagues.map(l => this.getTeams(l)));
        return results.flat();
    },
    async getScoreboard(leagueKey, dateInput) {
        const week = getSportsWeekRange(dateInput);
        if (!leagueKey) {
            const leagues = [
                'nfl',
                'nba',
                'college-football',
                'wnba'
            ];
            const results = await Promise.all(leagues.map(l => this.getScoreboard(l, dateInput)));
            const allGames = results.flatMap(r => r.games);
            allGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            return { games: allGames, week };
        }
        const cacheKey = `${leagueKey}_${week.espnDatesParam}`;
        const cached = cache.scoreboard[cacheKey];
        const now = Date.now();
        if (cached && now - cached.timestamp < SCOREBOARD_CACHE_TTL) {
            return { games: cached.data, week };
        }
        const conf = LEAGUE_CONFIG[leagueKey];
        if (!conf)
            return { games: [], week };
        const url = `https://site.api.espn.com/apis/site/v2/sports/${conf.sport}/${conf.leaguePath}/scoreboard?dates=${week.espnDatesParam}&limit=1000`;
        try {
            let cfbTeamMap = null;
            if (leagueKey === 'college-football') {
                const cfbTeams = await this.getTeams('college-football');
                cfbTeamMap = new Map(cfbTeams.map(t => [t.id, t]));
            }
            const res = await fetch(url);
            if (!res.ok)
                throw new Error(`ESPN Scoreboard API returned ${res.status}`);
            const json = await res.json();
            const events = json.events || [];
            const games = events
                .map((ev) => {
                const comp = ev.competitions?.[0];
                const statusType = ev.status?.type;
                const competitors = comp?.competitors || [];
                const homeComp = competitors.find((c) => c.homeAway === 'home') || competitors[0];
                const awayComp = competitors.find((c) => c.homeAway === 'away') || competitors[1];
                const homeTeamId = String(homeComp?.team?.id || '');
                const awayTeamId = String(awayComp?.team?.id || '');
                // Filter for CFB: Must involve at least one team from the 7 conferences on site
                if (leagueKey === 'college-football' && cfbTeamMap) {
                    const hasHome = cfbTeamMap.has(homeTeamId);
                    const hasAway = cfbTeamMap.has(awayTeamId);
                    if (!hasHome && !hasAway) {
                        return null;
                    }
                }
                // Strict Week Boundary: Game sports calendar date must fall between Wednesday and Tuesday
                const sportsDate = getSportsDateYMD(ev.date);
                if (sportsDate < week.startWednesday || sportsDate > week.endTuesday) {
                    return null;
                }
                const isLive = statusType?.state === 'in';
                const isCompleted = statusType?.completed === true;
                const broadcast = comp?.broadcasts?.[0]?.names?.[0] || comp?.geoBroadcasts?.[0]?.media?.shortName;
                const homeCfbTeam = cfbTeamMap?.get(homeTeamId);
                const awayCfbTeam = cfbTeamMap?.get(awayTeamId);
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
                        id: homeTeamId,
                        name: homeComp?.team?.displayName || 'Home Team',
                        abbreviation: homeComp?.team?.abbreviation || '',
                        logo: homeComp?.team?.logo || '',
                        score: homeComp?.score || '0',
                        record: homeComp?.records?.[0]?.summary,
                        color: homeComp?.team?.color ? `#${homeComp?.team?.color}` : undefined,
                        conference: homeCfbTeam?.conference
                    },
                    awayTeam: {
                        id: awayTeamId,
                        name: awayComp?.team?.displayName || 'Away Team',
                        abbreviation: awayComp?.team?.abbreviation || '',
                        logo: awayComp?.team?.logo || '',
                        score: awayComp?.score || '0',
                        record: awayComp?.records?.[0]?.summary,
                        color: awayComp?.team?.color ? `#${awayComp?.team?.color}` : undefined,
                        conference: awayCfbTeam?.conference
                    }
                };
            })
                .filter((g) => Boolean(g));
            cache.scoreboard[cacheKey] = { timestamp: now, data: games };
            return { games, week };
        }
        catch (err) {
            console.error(`Error fetching scoreboard for ${leagueKey}:`, err);
            return { games: cached?.data || [], week };
        }
    },
    async getNews(leagueKey, teamId) {
        const key = `${leagueKey || 'all'}_${teamId || 'general'}`;
        const cached = cache.news[key];
        const now = Date.now();
        if (cached && now - cached.timestamp < NEWS_CACHE_TTL) {
            return cached.data;
        }
        const leaguesToQuery = leagueKey
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
                if (!res.ok)
                    return [];
                const json = await res.json();
                const rawArticles = json.articles || [];
                return rawArticles.map((art) => ({
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
        }
        catch (err) {
            console.error('Error fetching ESPN news:', err);
            return cached?.data || [];
        }
    },
    async getTeamSchedule(leagueKey, teamId) {
        const conf = LEAGUE_CONFIG[leagueKey];
        if (!conf)
            return [];
        const url = `https://site.api.espn.com/apis/site/v2/sports/${conf.sport}/${conf.leaguePath}/teams/${teamId}/schedule`;
        try {
            const res = await fetch(url);
            if (!res.ok)
                return [];
            const json = await res.json();
            return json.events || [];
        }
        catch (err) {
            console.error(`Error fetching schedule for ${leagueKey} team ${teamId}:`, err);
            return [];
        }
    }
};
