import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { db } from '../db';
import { users } from '../db/schema';
import { authenticate } from '../auth/middleware';
import { signAccessToken } from '../auth/tokens';
import {
  getValidRefreshToken,
  issueRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../auth/refresh-tokens';
import {
  REFRESH_COOKIE,
  clearRefreshCookieOptions,
  refreshCookieOptions,
} from '../auth/cookies';

export const authRouter = Router();

/**
 * Password hashing.
 *
 * scrypt rather than bcrypt: it is in Node's standard library, so there is no
 * native build step and no platform-specific binary to install. The salt is
 * random per user and stored alongside the hash.
 */
const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  // Constant-time compare: a byte-by-byte compare returns early on the first
  // mismatch and leaks timing.
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).optional(),
});

const toSafeUser = (user: { id: number; email: string; name: string | null }) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

/**
 * Register.
 *
 * Always returns 409 on a duplicate email rather than 422 or 500. The message
 * is deliberately ambiguous about whether the account exists — a registration
 * endpoint that confirms an email is registered is an account-enumeration oracle.
 */
authRouter.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { email, password, name } = parsed.data;

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return res.status(409).json({ error: 'Invalid credentials' });

  const [user] = await db
    .insert(users)
    .values({ email, name: name ?? null, passwordHash: hashPassword(password) })
    .returning();

  // `returning()` yields an array; the insert either produced a row or threw.
  if (!user) return res.status(500).json({ error: 'Registration failed' });

  const refreshToken = await issueRefreshToken(user.id);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return res.status(201).json({
    user: toSafeUser(user),
    accessToken: signAccessToken({ id: user.id, email: user.email }),
  });
});

/**
 * Login.
 *
 * The refresh token travels only in the httpOnly cookie. The access token is in
 * the body so the current frontend keeps working until it migrates to
 * in-memory storage — a non-breaking rollout rather than a flag day.
 */
authRouter.post('/login', async (req, res) => {
  const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Same message whether the user is missing or the password is wrong. Two
  // distinguishable errors is an enumeration oracle.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const refreshToken = await issueRefreshToken(user.id);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return res.json({
    user: toSafeUser(user),
    accessToken: signAccessToken({ id: user.id, email: user.email }),
  });
});

/**
 * Refresh.
 *
 * Public — it consumes the cookie, not a bearer token. Rotates on every call so
 * a stolen refresh token works at most once.
 */
authRouter.post('/refresh', async (req, res) => {
  const presented = req.cookies?.[REFRESH_COOKIE];
  if (!presented) return res.status(401).json({ error: 'No refresh token' });

  const stored = await getValidRefreshToken(presented);
  if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });

  const { raw: next, expiresAt } = await rotateRefreshToken(presented, stored.userId);
  res.cookie(REFRESH_COOKIE, next, refreshCookieOptions());

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, stored.userId));

  return res.json({
    accessToken: signAccessToken({ id: stored.userId, email: user?.email ?? '' }),
    expiresAt,
  });
});

/**
 * Logout.
 *
 * Deliberately NOT behind `authenticate`. An expired access token must not
 * prevent logout — the refresh cookie is the authority here.
 */
authRouter.post('/logout', async (req, res) => {
  const presented = req.cookies?.[REFRESH_COOKIE];
  if (presented) await revokeRefreshToken(presented);

  res.clearCookie(REFRESH_COOKIE, clearRefreshCookieOptions());
  return res.json({ message: 'Logged out' });
});

/**
 * Me.
 *
 * Re-fetches the live user rather than returning the JWT payload, so a change
 * to the account propagates immediately instead of lingering until the token
 * expires.
 */
authRouter.get('/me', authenticate, async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json(toSafeUser(user));
});
