import { Router } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { review, session as sessionTable, userEntry } from '../db/schema';
import { catalog } from '../content';
import { authenticate } from '../auth/middleware';
import { nextInterval, qualityToRung } from '../scheduler/intervals';
import { generateSession, type SchedulerState } from '../scheduler/session';

export const sessionRouter = Router();

/**
 * Session and review routes.
 *
 * Every route here is behind `authenticate`. The catalog is public — it is
 * shipped to the browser anyway — but study state is per-user and must never be
 * readable or writable without an identity.
 *
 * The generator is pure and takes `SchedulerState`. This file is the adapter:
 * it loads state from Postgres, calls the generator, and persists the result.
 * Keeping that boundary means the scheduler stays testable without a database
 * and this file stays testable without a scheduler.
 */

/**
 * The interval in whole days, for the `interval_days` column.
 *
 * The ladder works in days, but the due date is a timestamp, so the stored
 * interval is derived back out of the two. Rounding is deliberate: a 3-day
 * interval is 3, not 2.999, and the column is what the next review reads to
 * decide whether to extend a mastered item.
 */
function intervalDays(dueAt: Date, now: Date): number {
  return Math.max(0, Math.round((dueAt.getTime() - now.getTime()) / 86_400_000));
}

/**
 * Build the scheduler state for a user.
 *
 * Loads every `user_entry` row for the user and pairs it with the catalog. The
 * catalog is small (63 entries) and already in memory, so this is two cheap
 * queries rather than a join across two databases.
 */
async function loadState(userId: number): Promise<SchedulerState> {
  const rows = await db.select().from(userEntry).where(eq(userEntry.userId, userId));

  return {
    entries: catalog.entries.map((e) => ({
      id: e.id,
      type: e.type,
      layer: e.layer,
      domain: e.domain,
    })),
    userEntries: rows.map((r) => ({
      entryId: r.entryId,
      dueAt: r.dueAt,
      mastery: r.mastery,
      intervalDays: r.intervalDays,
    })),
    quotes: catalog.sources.map((s) => ({ id: s.id })),
  };
}

/**
 * Generate a session and persist it.
 *
 * The session row is written before the client sees it, so a reload does not
 * re-roll the queue. That is the whole point of computing from persisted state.
 */
sessionRouter.post('/', authenticate, async (req, res) => {
  const userId = req.user!.id;
  const now = new Date();

  const state = await loadState(userId);
  const generated = generateSession(state, now);

  const [row] = await db
    .insert(sessionTable)
    .values({
      userId,
      entryIds: generated.entryIds,
      quoteId: generated.quoteId,
    })
    .returning();

  if (!row) return res.status(500).json({ error: 'Could not create session' });

  return res.status(201).json({
    id: row.id,
    entryIds: row.entryIds,
    quoteId: row.quoteId,
    createdAt: row.createdAt,
  });
});

/**
 * Mark a session finished.
 *
 * Deliberately separate from the review route. A session can be abandoned, and
 * `completed_at` staying null is the record of that. Inferring completion from
 * the number of reviews would conflate "finished" with "reviewed everything".
 */
sessionRouter.post('/:id/complete', authenticate, async (req, res) => {
  const userId = req.user!.id;
  const sessionId = Number(req.params.id);
  if (!Number.isInteger(sessionId)) return res.status(400).json({ error: 'Invalid session id' });

  const [row] = await db
    .update(sessionTable)
    .set({ completedAt: new Date() })
    .where(and(eq(sessionTable.id, sessionId), eq(sessionTable.userId, userId)))
    .returning();

  // A missing row is 404 rather than 403: the distinction between "not yours"
  // and "does not exist" is not worth leaking.
  if (!row) return res.status(404).json({ error: 'Session not found' });

  return res.json({ id: row.id, completedAt: row.completedAt });
});

const reviewSchema = z.object({
  quality: z.number().int().min(0).max(5),
});

/**
 * Record a review.
 *
 * Upserts `user_entry` with the next interval from the ladder and inserts one
 * append-only `review` row. A skip is `quality: 0` and still advances — an item
 * you skip is an item you did not know, which must not be silently rescheduled
 * forever.
 */
sessionRouter.post('/:id/items/:entryId/review', authenticate, async (req, res) => {
  const userId = req.user!.id;

  // Express 5 types `req.params` values as `string | string[] | undefined`.
  // Narrowing here, at the boundary, keeps the rest of the handler honest —
  // every downstream use is a plain string.
  const entryId = req.params.entryId;
  if (typeof entryId !== 'string') return res.status(400).json({ error: 'Invalid entry id' });

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'quality must be 0..5' });

  const entry = catalog.entries.find((e) => e.id === entryId);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  const now = new Date();
  const quality = parsed.data.quality;
  const rung = qualityToRung(quality);

  const [existing] = await db
    .select()
    .from(userEntry)
    .where(and(eq(userEntry.userId, userId), eq(userEntry.entryId, entryId)));

  const previousInterval = existing?.intervalDays;
  const dueAt = nextInterval(rung, now, previousInterval);

  // The mastery ladder. A failure never advances mastery, and a skip is a
  // failure — otherwise skipping is a free way to mark things learned.
  const mastery = quality >= 4 ? 'can_apply' : quality === 3 ? 'can_explain' : 'seen';

  await db
    .insert(userEntry)
    .values({
      userId,
      entryId,
      mastery,
      intervalDays: intervalDays(dueAt, now),
      dueAt,
      lastReviewedAt: now,
    })
    .onConflictDoUpdate({
      // The conflict target is the (user_id, entry_id) unique index. Drizzle
      // takes the columns here and builds ON CONFLICT from them.
      target: [userEntry.userId, userEntry.entryId],
      set: {
        mastery,
        intervalDays: intervalDays(dueAt, now),
        dueAt,
        lastReviewedAt: now,
      },
    });

  await db.insert(review).values({
    userId,
    entryId,
    kind: 'recall',
    quality,
    prompt: entry.one_line_definition,
    answer: null,
  });

  return res.status(201).json({ entryId, quality, rung, dueAt, mastery });
});
