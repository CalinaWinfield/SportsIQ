import { Router } from 'express';
import { db, User } from '../db.js';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthenticatedRequest } from '../auth.js';

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

export default router;
