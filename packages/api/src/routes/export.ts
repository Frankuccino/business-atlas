import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { review, userEntry } from '../db/schema';
import { authenticate } from '../auth/middleware';

export const exportRouter = Router();

/**
 * Progress export and import.
 *
 * Export is a read of everything the user has: `user_entry` rows and the
 * append-only `review` log. Import is the inverse, and it is deliberately
 * destructive-by-default on conflict — an import is a restore, and a restore
 * that silently keeps the newer row is a restore that loses data.
 *
 * Both are behind `authenticate`. This is the user's whole study history; it is
 * not public and not shareable.
 */

/** The export envelope. Versioned so a future schema change is detectable. */
const EXPORT_VERSION = 1;

exportRouter.get('/', authenticate, async (req, res) => {
  const userId = req.user!.id;

  const [entries, reviews] = await Promise.all([
    db.select().from(userEntry).where(eq(userEntry.userId, userId)),
    db.select().from(review).where(eq(review.userId, userId)),
  ]);

  // `passwordHash` is never in these tables, but the shape is asserted anyway:
  // an export that leaks a credential is the worst possible bug here.
  res.json({
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    entries: entries.map((e) => ({
      entryId: e.entryId,
      mastery: e.mastery,
      intervalDays: e.intervalDays,
      dueAt: e.dueAt,
      lastReviewedAt: e.lastReviewedAt,
      notes: e.notes,
    })),
    reviews: reviews.map((r) => ({
      entryId: r.entryId,
      kind: r.kind,
      quality: r.quality,
      prompt: r.prompt,
      answer: r.answer,
      reviewedAt: r.reviewedAt,
    })),
  });
});

/**
 * Import.
 *
 * Body: the object `GET /` produced. Each `user_entry` is upserted, each
 * `review` is inserted. Reviews are append-only, so an import appends rather
 * than deduplicating — importing the same file twice doubles the log, which is
 * the honest behaviour and the one the user can predict.
 */
exportRouter.post('/', authenticate, async (req, res) => {
  const userId = req.user!.id;
  const body = req.body as {
    version?: number;
    entries?: Array<{
      entryId: string;
      mastery: string;
      intervalDays: number;
      dueAt: string;
      lastReviewedAt?: string | null;
      notes?: string;
    }>;
    reviews?: Array<{
      entryId: string;
      kind: string;
      quality: number;
      prompt: string;
      answer?: string | null;
      reviewedAt: string;
    }>;
  };

  if (body.version !== EXPORT_VERSION) {
    return res.status(400).json({ error: `Unsupported export version: ${body.version}` });
  }
  if (!Array.isArray(body.entries) || !Array.isArray(body.reviews)) {
    return res.status(400).json({error: 'Export must contain entries and reviews arrays'});
  }

  let importedEntries = 0;
  let importedReviews = 0;

  for (const e of body.entries) {
    const dueAt = new Date(e.dueAt);
    if (Number.isNaN(dueAt.getTime())) continue;

    await db
      .insert(userEntry)
      .values({
        userId,
        entryId: e.entryId,
        mastery: e.mastery,
        intervalDays: e.intervalDays,
        dueAt,
        lastReviewedAt: e.lastReviewedAt ? new Date(e.lastReviewedAt) : null,
        notes: e.notes ?? '',
      })
      .onConflictDoUpdate({
        target: [userEntry.userId, userEntry.entryId],
        set: {
          mastery: e.mastery,
          intervalDays: e.intervalDays,
          dueAt,
          lastReviewedAt: e.lastReviewedAt ? new Date(e.lastReviewedAt) : null,
          notes: e.notes ?? '',
        },
      });

    importedEntries += 1;
  }

  for (const r of body.reviews) {
    const reviewedAt = new Date(r.reviewedAt);
    if (Number.isNaN(reviewedAt.getTime())) continue;

    await db.insert(review).values({
      userId,
      entryId: r.entryId,
      kind: r.kind,
      quality: r.quality,
      prompt: r.prompt,
      answer: r.answer ?? null,
      reviewedAt,
    });

    importedReviews += 1;
  }

  res.json({ importedEntries, importedReviews });
});
