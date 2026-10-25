import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from './tokens';

/**
 * Require a valid access token.
 *
 * Attaches the decoded user to `req.user` and continues. On any failure —
 * missing header, malformed header, expired or foreign token — it returns 401
 * and does not call `next()`.
 *
 * The error messages are deliberately vague. "Invalid token" rather than
 * "expired" or "wrong audience" avoids telling an attacker which check failed.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
