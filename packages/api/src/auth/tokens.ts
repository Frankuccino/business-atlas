import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '../types/auth-payload';

/**
 * Access and refresh token helpers.
 *
 * Two tokens with two different jobs:
 *
 *   access   short-lived JWT (15m), HS256, carries { id, email }. Sent in
 *            `Authorization: Bearer`. Stateless — verifying it needs no DB.
 *   refresh  opaque random string, stored only as a SHA-256 hash. Sent in an
 *            httpOnly cookie. Stateful — verifying it needs the DB, which is
 *            what makes revocation possible.
 *
 * The split is the point: a stolen access token expires in 15 minutes, and a
 * stolen refresh token can be revoked.
 */

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 7;

/**
 * Issuer and audience are pinned and verified on both sides.
 *
 * Without them a token minted by one service is substitutable into another.
 * Cheap to set, and it closes a real class of confusion.
 */
const ISSUER = 'business-atlas-api';
const AUDIENCE = 'business-atlas-web';

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Server configuration error: JWT_SECRET missing.');
  return secret;
};

export const signAccessToken = (payload: { id: number; email: string }): string =>
  jwt.sign({ id: payload.id, email: payload.email }, getSecret(), {
    expiresIn: ACCESS_TOKEN_TTL,
    issuer: ISSUER,
    audience: AUDIENCE,
  });

/**
 * Verify an access token.
 *
 * The claims are untrusted — a forged or legacy token could carry anything —
 * so each field is narrowed rather than cast. `id` in particular is coerced
 * through `Number` because `serial()` yields a number and a string here would
 * desync every downstream query.
 */
export const verifyAccessToken = (token: string): AuthPayload => {
  const decoded = jwt.verify(token, getSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as jwt.JwtPayload;

  return {
    id: Number(decoded.sub ?? decoded.id),
    email: typeof decoded.email === 'string' ? decoded.email : '',
  };
};

/**
 * Generate an opaque refresh token.
 *
 * Returns the raw value (goes to the cookie) and its SHA-256 hash (goes to the
 * database). The raw value is never persisted — a database leak must not be
 * replayable.
 */
export const generateRefreshToken = (): { raw: string; hash: string; expiresAt: Date } => {
  const raw = crypto.randomBytes(48).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  return { raw, hash, expiresAt };
};

export const hashRefreshToken = (raw: string): string =>
  crypto.createHash('sha256').update(raw).digest('hex');

export const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
