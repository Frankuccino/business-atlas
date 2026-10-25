import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { refreshTokens } from '../db/schema';
import { generateRefreshToken, hashRefreshToken } from './tokens';

/**
 * Refresh token persistence.
 *
 * Every function here works from the hash, never the raw value. The raw value
 * exists only in the cookie and only for the duration of one request.
 */

/** Store a new token row for a user. Returns the raw value for the cookie. */
export const issueRefreshToken = async (userId: number): Promise<string> => {
  const { raw, hash, expiresAt } = generateRefreshToken();
  await db.insert(refreshTokens).values({ userId, tokenHash: hash, expiresAt });
  return raw;
};

/**
 * Resolve a presented token to its row, if it is live.
 *
 * A row that is revoked or expired is treated as absent. Both are the same
 * event from the caller's point of view — the cookie is not usable — and
 * collapsing them avoids leaking which of the two happened.
 */
export const getValidRefreshToken = async (raw: string) => {
  const hash = hashRefreshToken(raw);
  const [row] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, hash));

  if (!row || row.revoked !== 0) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;

  return row;
};

/**
 * Rotate: revoke the presented token and issue a replacement.
 *
 * Rotation is what limits a stolen refresh token to a single use. Without it a
 * stolen token works until expiry, and there is no way to tell.
 */
export const rotateRefreshToken = async (
  raw: string,
  userId: number,
): Promise<{ raw: string; expiresAt: Date }> => {
  const hash = hashRefreshToken(raw);
  await db.update(refreshTokens).set({ revoked: 1 }).where(eq(refreshTokens.tokenHash, hash));

  const next = generateRefreshToken();
  await db.insert(refreshTokens).values({
    userId,
    tokenHash: next.hash,
    expiresAt: next.expiresAt,
  });

  return { raw: next.raw, expiresAt: next.expiresAt };
};

/** Revoke one token (logout). */
export const revokeRefreshToken = async (raw: string): Promise<void> => {
  const hash = hashRefreshToken(raw);
  await db.update(refreshTokens).set({ revoked: 1 }).where(eq(refreshTokens.tokenHash, hash));
};

/** Revoke every token for a user (logout everywhere / compromised kill). */
export const revokeAllForUser = async (userId: number): Promise<void> => {
  await db
    .update(refreshTokens)
    .set({ revoked: 1 })
    .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, 0)));
};
