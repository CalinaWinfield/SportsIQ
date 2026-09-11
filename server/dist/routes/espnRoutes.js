import { Router } from 'express';
import { espnService } from '../services/espnService.js';
const router = Router();
// Get teams by league or all
router.get('/teams', async (req, res) => {
    try {
        const league = req.query.league;
        if (league && ['nfl', 'nba', 'college-football', 'wnba'].includes(league)) {
            const teams = await espnService.getTeams(league);
            res.json({ teams });
        }
        else {
            const teams = await espnService.getAllTeams();
            res.json({ teams });
        }
    }
    catch (err) {
        console.error('Error in /api/espn/teams:', err);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});
// Get scoreboard games
router.get('/scoreboard', async (req, res) => {
    try {
        const league = req.query.league;
        if (league && ['nfl', 'nba', 'college-football', 'wnba'].includes(league)) {
            const games = await espnService.getScoreboard(league);
            res.json({ games });
        }
        else {
            const games = await espnService.getScoreboard();
            res.json({ games });
        }
    }
    catch (err) {
        console.error('Error in /api/espn/scoreboard:', err);
        res.status(500).json({ error: 'Failed to fetch scoreboard' });
    }
});
// Get ESPN news
router.get('/news', async (req, res) => {
    try {
        const league = req.query.league;
        const teamId = req.query.teamId;
        const validLeague = league && ['nfl', 'nba', 'college-football', 'wnba'].includes(league)
            ? league
            : undefined;
        const news = await espnService.getNews(validLeague, teamId);
        res.json({ news });
    }
    catch (err) {
        console.error('Error in /api/espn/news:', err);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});
// Get team schedule
router.get('/teams/:league/:teamId/schedule', async (req, res) => {
    try {
        const { league, teamId } = req.params;
        if (!['nfl', 'nba', 'college-football', 'wnba'].includes(league)) {
            res.status(400).json({ error: 'Invalid league' });
            return;
        }
        const schedule = await espnService.getTeamSchedule(league, teamId);
        res.json({ schedule });
    }
    catch (err) {
        console.error('Error fetching team schedule:', err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});
export default router;
