import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { review, userEntry } from '../db/schema';
import { catalog } from '../content';
import { authenticate } from '../auth/middleware';

export const progressRouter = Router();

/**
 * Progress routes.
 *
 * Everything here is derived from `user_entry` and `review`. Nothing is stored
 * as a counter, because a counter that drifts from its source is a bug you
 * discover months later. Recompute on read; the tables are small.
 */

/**
 * Progress for the authenticated user.
 *
 * Returns mastery counts per domain, a streak, and a weak-spot list. The weak
 * spots are the entries with the most `quality <= 1` reviews — the items you
 * keep getting wrong, which is a different signal from the items you have not
 * seen.
 */
progressRouter.get('/', authenticate, async (req, res) => {
  const userId = req.user!.id;

  const entries = await db.select().from(userEntry).where(eq(userEntry.userId, userId));

  const byId = new Map(entries.map((e) => [e.entryId, e]));

  // Mastery counts per domain. An entry with no user_entry row is not counted:
  // "not started" is not a mastery level.
  const domains = catalog.domains.map((d) => {
    const inDomain = catalog.entries.filter((e) => e.domain === d.id);
    const states = inDomain.map((e) => byId.get(e.id)).filter(Boolean);

    const count = (m: string) => states.filter((s) => s!.mastery === m).length;

    return {
      id: d.id,
      name: d.name,
      total: inDomain.length,
      unseen: inDomain.length - states.length,
      seen: count('seen'),
      canExplain: count('can_explain'),
      canApply: count('can_apply'),
      mastered: count('can_apply'),
    };
  });

  // Streak: consecutive days with at least one review, counting back from today.
  const reviews = await db
    .select({ reviewedAt: review.reviewedAt })
    .from(review)
    .where(eq(review.userId, userId))
    .orderBy(desc(review.reviewedAt));

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);

  const days = new Set(reviews.map((r) => dayKey(r.reviewedAt)));

  let streak = 0;
  const cursor = new Date();
  // A streak survives until the end of today. If you reviewed yesterday but not
  // yet today, the streak is still alive — otherwise a streak resets at midnight
  // and punishes you for not having started your day.
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);

  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Weak spots: entries with the most failed reviews, most recent first.
  const failures = await db
    .select({
      entryId: review.entryId,
      count: review.id,
    })
    .from(review)
    .where(and(eq(review.userId, userId), eq(review.quality, 0)));

  const failureCounts = new Map<string, number>();
  for (const f of failures) {
    failureCounts.set(f.entryId, (failureCounts.get(f.entryId) ?? 0) + 1);
  }

  const weakSpots = [...failureCounts.entries()]
    .map(([entryId, count]) => {
      const entry = catalog.entries.find((e) => e.id === entryId);
      return entry ? { entryId, title: entry.title, domain: entry.domain, failures: count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.failures - a!.failures)
    .slice(0, 10);

  const totalReviews = reviews.length;

  return res.json({
    domains,
    streak,
    totalReviews,
    weakSpots,
  });
});
