import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { register, login, logout, refreshToken } from '../controllers/auth.controller';
import passport from '../utils/passport';

const router = Router();

// ── Standard auth ──────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// ── Google OAuth ───────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  const role = (req.query.role as string) || 'STUDENT';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role,
    session: false,
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failed' }),
  (req, res) => {
    const user = req.user as any;
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userData = encodeURIComponent(
      JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      })
    );

    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&user=${userData}`);
  }
);

// ── GitHub OAuth ───────────────────────────────────────────────
router.get('/github', (req, res, next) => {
  const role = (req.query.role as string) || 'STUDENT';
  passport.authenticate('github', {
    scope: ['user:email'],
    state: role,
    session: false,
  })(req, res, next);
});

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/auth/failed' }),
  (req, res) => {
    const user = req.user as any;
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userData = encodeURIComponent(
      JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      })
    );

    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&user=${userData}`);
  }
);

// ── Auth failure ───────────────────────────────────────────────
router.get('/failed', (_req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/student/login?error=oauth_failed`);
});

export default router;
