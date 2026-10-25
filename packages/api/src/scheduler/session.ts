/**
 * The daily session generator.
 *
 * The rule that matters: **compute the session from persisted state, never
 * mutate during render.** Recomputing "today's list" inside a component body
 * re-rolls it on every render, so items vanish when you tab away and the list
 * changes shape mid-session.
 *
 * Pure by construction — `now` is an argument, so the same state always yields
 * the same session and the function is testable at any date.
 *
 * A rolling queue, not a calendar day. There is no list that resets at
 * midnight: a session is generated on demand, the cap is on items per session,
 * and you can run two in a day or miss a week and come back to a backlog.
 */

/** Caps are constants, not configuration. Tunable later, not user-facing in v1. */
export const SESSION_CAP = 15;
export const NEW_TERMS_PER_SESSION = 1;
export const NEW_FRAMEWORKS_PER_SESSION = 1;

/** The entry fields the scheduler reads. A structural subset, not the full type. */
export interface SchedulableEntry {
  id: string;
  type: string;
  layer: number;
  domain: string;
}

/** The user_entry fields the scheduler reads. */
export interface SchedulableUserEntry {
  entryId: string;
  dueAt: Date;
  mastery: string;
  intervalDays: number;
}

export interface SchedulerState {
  entries: SchedulableEntry[];
  userEntries: SchedulableUserEntry[];
  quotes: Array<{ id: string }>;
}

export interface Session {
  entryIds: string[];
  quoteId: string | null;
}

/** Day-of-year, 1-based. Deterministic and timezone-free when given a UTC date. */
function dayOfYear(now: Date): number {
  const start = Date.UTC(now.getUTCFullYear(), 0, 1);
  const ms = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((ms - start) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * The quote for a given day.
 *
 * `dayOfYear % quotes.length` rather than `Math.random()`. Randomness breaks
 * both halves of the requirement: reproducibility within a day and variety
 * across days. This is stable for a date, varied across dates, and needs no
 * stored state.
 */
export function quoteForDay<T extends { id: string }>(quotes: T[], now: Date): T | null {
  if (quotes.length === 0) return null;
  return quotes[dayOfYear(now) % quotes.length] ?? null;
}

/** An entry is due when it has no user_entry row, or its due_at has passed. */
function isDue(entry: SchedulableEntry, userEntries: SchedulableUserEntry[], now: Date): boolean {
  const row = userEntries.find((u) => u.entryId === entry.id);
  if (!row) return true;
  return row.dueAt.getTime() <= now.getTime();
}

/**
 * Generate a session from persisted state.
 *
 * Composition, in order:
 *   1. one new term
 *   2. one new framework or principle
 *   3. due reviews, ordered by due_at then id
 *   4. one quote, deterministic on the date
 *
 * New items are those with no user_entry row. They are ordered by layer, then
 * id — the layer is the learning sequence, so a Layer 1 term is served before a
 * Layer 4 one.
 */
export function generateSession(state: SchedulerState, now: Date): Session {
  const { entries, userEntries, quotes } = state;

  const isNew = (entry: SchedulableEntry) =>
    !userEntries.some((u) => u.entryId === entry.id);

  // New items first, ordered by layer then id. Sorting a copy so the caller's
  // array is never reordered as a side effect of generating a session.
  const newEntries = entries
    .filter(isNew)
    .slice()
    .sort((a, b) => a.layer - b.layer || a.id.localeCompare(b.id));

  const newTerm = newEntries.find((e) => e.type === 'term');
  const newFramework = newEntries.find((e) => e.type === 'framework' || e.type === 'principle');

  // Due reviews: has a user_entry row, and that row is due. Ordered by due_at
  // ascending then id, so the most overdue item is always served first.
  const due = entries
    .filter((e) => !isNew(e) && isDue(e, userEntries, now))
    .slice()
    .sort((a, b) => {
      const aDue = userEntries.find((u) => u.entryId === a.id)?.dueAt.getTime() ?? 0;
      const bDue = userEntries.find((u) => u.entryId === b.id)?.dueAt.getTime() ?? 0;
      return aDue - bDue || a.id.localeCompare(b.id);
    });

  const ids = [
    ...(newTerm ? [newTerm.id] : []),
    ...(newFramework ? [newFramework.id] : []),
    ...due.map((e) => e.id),
  ].slice(0, SESSION_CAP);

  return { entryIds: ids, quoteId: quoteForDay(quotes, now)?.id ?? null };
}
