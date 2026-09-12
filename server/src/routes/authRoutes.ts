import { Router } from 'express';
import { db, User } from '../db.js';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthenticatedRequest } from '../auth.js';
import { espnService } from '../services/espnService.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters long' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existingUser = db.findUserByUsername(username);
    if (existingUser) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }

    const existingEmail = db.findUserByEmail(email);
    if (existingEmail) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      username,
      email,
      passwordHash,
      avatar: avatar || '??',
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      res.status(400).json({ error: 'Username/email and password are required' });
      return;
    }

    const user =
      db.findUserByUsername(usernameOrEmail) || db.findUserByEmail(usernameOrEmail);

    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = db.findUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  });
});

// Update profile avatar
router.put('/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { avatar } = req.body;
  const updated = db.updateUser(req.user.userId, { avatar });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    user: {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      avatar: updated.avatar,
      createdAt: updated.createdAt
    }
  });
});

// ==========================================
// Forgot Password Flow (No Email Required)
// Verifies user via saved favorite team question
// ==========================================

interface ResetSession {
  token: string;
  userId: string;
  username: string;
  email: string;
  questionType: 'favorite_team' | 'avatar';
  correctOptionId: string;
  validTeamIds: string[];
  validTeamNames: string[];
  correctAvatar?: string;
  verified: boolean;
  expiresAt: number;
}

const resetSessions = new Map<string, ResetSession>();

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of resetSessions.entries()) {
    if (session.expiresAt < now) {
      resetSessions.delete(token);
    }
  }
}

const FALLBACK_DECOYS = [
  { id: 'decoy_kc', name: 'Kansas City Chiefs', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', league: 'NFL' },
  { id: 'decoy_sf', name: 'San Francisco 49ers', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', league: 'NFL' },
  { id: 'decoy_lal', name: 'Los Angeles Lakers', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png', league: 'NBA' },
  { id: 'decoy_bos', name: 'Boston Celtics', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png', league: 'NBA' },
  { id: 'decoy_uga', name: 'Georgia Bulldogs', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png', league: 'CFB' },
  { id: 'decoy_osu', name: 'Ohio State Buckeyes', logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png', league: 'CFB' },
  { id: 'decoy_ind', name: 'Indiana Fever', logo: 'https://a.espncdn.com/i/teamlogos/wnba/500/ind.png', league: 'WNBA' },
  { id: 'decoy_ny', name: 'New York Liberty', logo: 'https://a.espncdn.com/i/teamlogos/wnba/500/ny.png', league: 'WNBA' }
];

// Step 1: Initiate reset by username or email & receive security challenge
router.post('/forgot-password/init', async (req, res) => {
  cleanExpiredSessions();
  try {
    const { usernameOrEmail } = req.body;
    if (!usernameOrEmail || typeof usernameOrEmail !== 'string') {
      res.status(400).json({ error: 'Please enter your username or email address' });
      return;
    }

    const trimmed = usernameOrEmail.trim();
    const user = db.findUserByUsername(trimmed) || db.findUserByEmail(trimmed);

    if (!user) {
      res.status(404).json({ error: 'No SportIQ account found with that username or email.' });
      return;
    }

    const userFavorites = db.getFavorites(user.id);
    const resetToken = 'rst_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);

    if (userFavorites.length > 0) {
      // Pick 1 favorite team at random for the challenge
      const correctFav = userFavorites[Math.floor(Math.random() * userFavorites.length)];

      let allTeamsList: any[] = [];
      try {
        allTeamsList = await espnService.getAllTeams();
      } catch {}

      const favTeamIds = new Set(userFavorites.map(f => `${f.league}_${f.teamId}`));
      const candidateDecoys = allTeamsList.length > 0
        ? allTeamsList.filter(t => !favTeamIds.has(`${t.league}_${t.id}`) && t.logo)
        : FALLBACK_DECOYS.filter(t => !favTeamIds.has(`nfl_${t.id}`));

      const shuffledDecoys = [...candidateDecoys].sort(() => Math.random() - 0.5);
      const selectedDecoys = (shuffledDecoys.length >= 3 ? shuffledDecoys : FALLBACK_DECOYS)
        .slice(0, 3)
        .map(t => ({
          id: `decoy_${t.id || t.name}`,
          name: t.displayName || t.name,
          logo: t.logo || (t as any).logoUrl,
          league: t.league?.toUpperCase() || 'SPORTS'
        }));

      const correctOption = {
        id: correctFav.teamId,
        name: correctFav.teamName,
        logo: correctFav.logoUrl,
        league: correctFav.league.toUpperCase()
      };

      const options = [correctOption, ...selectedDecoys].sort(() => Math.random() - 0.5);

      const validTeamNames = userFavorites.flatMap(f => {
        const parts = f.teamName.toLowerCase().split(' ');
        const nickname = parts.pop() || '';
        const city = parts.join(' ');
        return [
          f.teamName.toLowerCase(),
          f.abbreviation?.toLowerCase() || '',
          nickname,
          city
        ];
      }).filter(s => s && s.length >= 3);

      resetSessions.set(resetToken, {
        token: resetToken,
        userId: user.id,
        username: user.username,
        email: user.email,
        questionType: 'favorite_team',
        correctOptionId: correctFav.teamId,
        validTeamIds: userFavorites.map(f => f.teamId),
        validTeamNames,
        verified: false,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
      });

      res.json({
        resetToken,
        username: user.username,
        questionType: 'favorite_team',
        question: 'Security Check: Which of these teams is in your saved favorites?',
        instruction: 'Select your saved team from the choices below, or type the name of any team you follow in your ESPN FanHub.',
        options
      });
    } else {
      // User has no saved teams - challenge by profile avatar
      const userAvatar = user.avatar || 'trophy';
      const allAvatars = ['trophy', 'flame', 'zap', 'shield', 'crown', 'target', 'star', 'award', 'sparkles', 'heart'];
      const decoyAvatars = allAvatars.filter(a => a !== userAvatar).sort(() => Math.random() - 0.5).slice(0, 3);
      const avatarOptions = [userAvatar, ...decoyAvatars].sort(() => Math.random() - 0.5).map(a => ({
        id: a,
        name: a.charAt(0).toUpperCase() + a.slice(1),
        avatarId: a
      }));

      resetSessions.set(resetToken, {
        token: resetToken,
        userId: user.id,
        username: user.username,
        email: user.email,
        questionType: 'avatar',
        correctOptionId: userAvatar,
        validTeamIds: [],
        validTeamNames: [],
        correctAvatar: userAvatar,
        verified: false,
        expiresAt: Date.now() + 15 * 60 * 1000
      });

      res.json({
        resetToken,
        username: user.username,
        questionType: 'avatar',
        question: 'Security Check: Which avatar did you choose for your SportIQ profile?',
        instruction: 'Select your account avatar from the choices below to confirm your identity.',
        options: avatarOptions
      });
    }
  } catch (err) {
    console.error('Forgot password init error:', err);
    res.status(500).json({ error: 'Failed to initiate password reset' });
  }
});

// Step 2: Verify security answer
router.post('/forgot-password/verify', (req, res) => {
  cleanExpiredSessions();
  try {
    const { resetToken, selectedOptionId, typedAnswer } = req.body;
    if (!resetToken) {
      res.status(400).json({ error: 'Reset session token is required' });
      return;
    }

    const session = resetSessions.get(resetToken);
    if (!session || session.expiresAt < Date.now()) {
      res.status(400).json({ error: 'Reset session has expired. Please start over.' });
      return;
    }

    let isCorrect = false;

    if (session.questionType === 'favorite_team') {
      // 1. Check selected card option
      if (selectedOptionId) {
        if (session.validTeamIds.includes(selectedOptionId) || selectedOptionId === session.correctOptionId) {
          isCorrect = true;
        }
      }

      // 2. Check typed answer if not matched yet
      if (!isCorrect && typedAnswer && typeof typedAnswer === 'string') {
        const cleaned = typedAnswer.trim().toLowerCase();
        if (cleaned.length >= 3) {
          isCorrect = session.validTeamNames.some(validName => {
            return validName.includes(cleaned) || cleaned.includes(validName);
          });
        }
      }
    } else if (session.questionType === 'avatar') {
      if (selectedOptionId && selectedOptionId.toLowerCase() === session.correctAvatar?.toLowerCase()) {
        isCorrect = true;
      }
      if (!isCorrect && typedAnswer && typeof typedAnswer === 'string') {
        if (typedAnswer.trim().toLowerCase() === session.correctAvatar?.toLowerCase()) {
          isCorrect = true;
        }
      }
    }

    if (!isCorrect) {
      res.status(400).json({
        error: session.questionType === 'favorite_team'
          ? 'Incorrect team. That team is not in your saved favorites.'
          : 'Incorrect avatar selection.'
      });
      return;
    }

    session.verified = true;
    res.json({
      success: true,
      message: 'Identity verified successfully! You may now set your new password.'
    });
  } catch (err) {
    console.error('Forgot password verify error:', err);
    res.status(500).json({ error: 'Failed to verify security answer' });
  }
});

// Step 3: Reset password & automatically authenticate
router.post('/forgot-password/reset', async (req, res) => {
  cleanExpiredSessions();
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400).json({ error: 'Reset token and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const session = resetSessions.get(resetToken);
    if (!session || session.expiresAt < Date.now()) {
      res.status(400).json({ error: 'Reset session has expired. Please start over.' });
      return;
    }

    if (!session.verified) {
      res.status(403).json({ error: 'Security question must be answered correctly before resetting password.' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = db.updateUser(session.userId, { passwordHash });

    if (!updated) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    // Invalidate session
    resetSessions.delete(resetToken);

    // Auto-login: generate JWT auth token
    const token = generateToken({
      userId: updated.id,
      username: updated.username,
      email: updated.email
    });

    res.json({
      success: true,
      token,
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        avatar: updated.avatar,
        createdAt: updated.createdAt
      }
    });
  } catch (err) {
    console.error('Forgot password reset error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
