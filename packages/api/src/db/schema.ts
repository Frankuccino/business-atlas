import { pgTable, serial, text, timestamp, integer, smallint, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * The atlas schema.
 *
 * Two kinds of table live here, and they are deliberately different:
 *
 *   content-adjacent  user_entry, review, session — per-user, mutable, and the
 *                     unit of scheduling.
 *   auth              users, refresh_tokens — identity and session cookies.
 *
 * Content itself is NOT here. Entries, sources, and domains are markdown in the
 * repo, validated at build time, and served from the manifest. Putting them in
 * Postgres would mean two sources of truth for the same text.
 */

/* --------------------------------------------------------------------------
   Auth
   -------------------------------------------------------------------------- */

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Server-side refresh tokens.
 *
 * The cookie carries an opaque random string; we store ONLY its SHA-256 hash.
 * A raw value in the database would make a leak replayable. Rotation
 * invalidates the prior row, so a stolen token works at most once.
 */
export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  revoked: integer('revoked').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/* --------------------------------------------------------------------------
   Study state
   -------------------------------------------------------------------------- */

/**
 * One row per user, per entry. The unit of scheduling.
 *
 * `mastery` is text rather than a Postgres enum: the set is small and stable,
 * and a text column validated in the application layer means adding a value is
 * a code change rather than a migration. If the set ever grows, promote it.
 */
export const userEntry = pgTable(
  'user_entry',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    entryId: text('entry_id').notNull(),
    mastery: text('mastery').notNull().default('unseen'),
    intervalDays: smallint('interval_days').notNull().default(1),
    dueAt: timestamp('due_at').notNull(),
    lastReviewedAt: timestamp('last_reviewed_at'),
    notes: text('notes').notNull().default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('user_entry_user_entry_unique').on(table.userId, table.entryId)],
);

/**
 * Append-only review log.
 *
 * Never update a row; insert a new one. A spaced-repetition algorithm is only
 * debuggable if you can replay your own history, and mutating rows destroys the
 * evidence. Same rule as Platform Atlas.
 */
export const review = pgTable('review', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  entryId: text('entry_id').notNull(),
  kind: text('kind').notNull(),
  quality: smallint('quality').notNull(),
  prompt: text('prompt').notNull(),
  answer: text('answer'),
  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
});

/**
 * A generated session: what was queued, and whether it was finished.
 *
 * There is deliberately no unique constraint on (user_id, date). The daily cap
 * is a property of the generator — how many items it may contain — not a
 * constraint on how many sessions you can run. A unique date would make a
 * second session in one day impossible, which is not something to forbid.
 */
export const session = pgTable('session', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  entryIds: text('entry_ids').array().notNull(),
  quoteId: text('quote_id'),
  completedAt: timestamp('completed_at'),
});

export type User = typeof users.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type UserEntry = typeof userEntry.$inferSelect;
export type Review = typeof review.$inferSelect;
export type Session = typeof session.$inferSelect;
