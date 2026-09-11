import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth, authenticateToken } from '../auth.js';
const router = Router();
// Submit quiz score
router.post('/', optionalAuth, (req, res) => {
    try {
        const { league, mode, difficulty, score, totalQuestions, correctAnswers, accuracy, streak, guestName } = req.body;
        const userId = req.user?.userId || 'guest_' + Math.random().toString(36).substring(2, 8);
        const username = req.user?.username || guestName || 'Rookie Guest';
        const newRecord = {
            id: 'score_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            userId,
            username,
            league: league || 'all',
            mode: mode || 'classic',
            difficulty: difficulty || 'normal',
            score: Number(score) || 0,
            totalQuestions: Number(totalQuestions) || 0,
            correctAnswers: Number(correctAnswers) || 0,
            accuracy: Number(accuracy) || 0,
            streak: Number(streak) || 0,
            createdAt: new Date().toISOString()
        };
        db.addScore(newRecord);
        res.status(201).json({
            success: true,
            record: newRecord
        });
    }
    catch (err) {
        console.error('Error submitting score:', err);
        res.status(500).json({ error: 'Failed to record score' });
    }
});
// Get global leaderboard
router.get('/leaderboard', (req, res) => {
    try {
        const league = req.query.league || 'all';
        const mode = req.query.mode || 'all';
        const limit = Number(req.query.limit) || 25;
        const leaderboard = db.getLeaderboard(league, mode, limit);
        res.json({ leaderboard });
    }
    catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});
// Get user personal stats
router.get('/user-stats', authenticateToken, (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const stats = db.getUserStats(req.user.userId);
        res.json({ stats });
    }
    catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Failed to load user stats' });
    }
});
// Get user game history
router.get('/history', authenticateToken, (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const history = db.getUserScores(req.user.userId);
        res.json({ history });
    }
    catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to load game history' });
    }
});
export default router;
