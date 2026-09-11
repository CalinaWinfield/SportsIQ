import { Router } from 'express';
import { db, FavoriteTeam } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Get favorite teams for logged in user
router.get('/favorites', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const favorites = db.getFavorites(req.user.userId);
    res.json({ favorites });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add favorite team
router.post('/favorites', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { league, teamId, teamName, logoUrl, abbreviation, color } = req.body;

    if (!league || !teamId || !teamName) {
      res.status(400).json({ error: 'league, teamId, and teamName are required' });
      return;
    }

    const newFav: FavoriteTeam = {
      id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: req.user.userId,
      league,
      teamId: String(teamId),
      teamName,
      logoUrl: logoUrl || '',
      abbreviation: abbreviation || '',
      color,
      createdAt: new Date().toISOString()
    };

    db.addFavorite(newFav);
    res.status(201).json({ favorite: newFav });
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove favorite team
router.delete('/favorites/:league/:teamId', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { league, teamId } = req.params;
    const removed = db.removeFavorite(req.user.userId, league, teamId);
    res.json({ success: removed });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
