import type { CookieOptions } from 'express';
import { REFRESH_TOKEN_TTL_MS } from './tokens';

/**
 * The refresh cookie.
 *
 * `httpOnly` is the whole point: JavaScript cannot read it, so XSS cannot
 * exfiltrate it. `sameSite: "strict"` blocks cross-site sending.
 *
 * `path` must match where the auth routes are mounted. These live under
 * `/api/auth`, so the cookie is scoped to `/api/auth` — a cookie scoped to
 * `/auth` would never be sent to `/api/auth/refresh`, and refresh would fail
 * with a confusing "no refresh token" on a request that is working correctly.
 */
export const REFRESH_COOKIE = 'atlas_refresh';

export const refreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_TTL_MS,
});

export const clearRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
});
