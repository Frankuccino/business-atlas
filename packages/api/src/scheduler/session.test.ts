import { describe, expect, it } from 'vitest';
import { generateSession, quoteForDay, type SchedulerState } from './session';

const DAY = 24 * 60 * 60 * 1000;
const at = (iso: string) => new Date(iso);

/** A catalog-shaped entry. Only the fields the scheduler reads matter. */
const entry = (id: string, over: Partial<SchedulerState['entries'][number]> = {}) => ({
  id,
  type: 'term',
  layer: 1,
  domain: 'finance',
  ...over,
});

/** A user_entry row. */
const userEntry = (id: string, dueAt: Date, over: Record<string, unknown> = {}) => ({
  entryId: id,
  dueAt,
  mastery: 'unseen',
  intervalDays: 1,
  ...over,
});

const state = (over: Partial<SchedulerState> = {}): SchedulerState => ({
  entries: [],
  userEntries: [],
  quotes: [],
  ...over,
});

describe('generateSession', () => {
  it('is deterministic — the same state produces the same session', () => {
    const s = state({
      entries: [entry('a'), entry('b'), entry('c')],
      quotes: [{ id: 'q1' }, { id: 'q2' }],
    });
    const now = at('2026-10-24T10:00:00Z');
    expect(generateSession(s, now)).toEqual(generateSession(s, now));
  });

  it('always includes one new term and one new framework or principle', () => {
    const s = state({
      entries: [
        entry('t1', { type: 'term' }),
        entry('t2', { type: 'term' }),
        entry('f1', { type: 'framework' }),
        entry('p1', { type: 'principle' }),
      ],
    });
    const session = generateSession(s, at('2026-10-24T10:00:00Z'));
    const ids = session.entryIds;

    const terms = ids.filter((id) => s.entries.find((e) => e.id === id)?.type === 'term');
    const frameworks = ids.filter((id) =>
      ['framework', 'principle'].includes(s.entries.find((e) => e.id === id)?.type ?? ''),
    );

    expect(terms).toHaveLength(1);
    expect(frameworks).toHaveLength(1);
  });

  it('treats an entry with no user_entry row as due', () => {
    const s = state({
      entries: [entry('new-one'), entry('seen-one')],
      userEntries: [userEntry('seen-one', new Date(Date.now() + DAY))],
    });
    const ids = generateSession(s, at('2026-10-24T10:00:00Z')).entryIds;
    expect(ids).toContain('new-one');
    expect(ids).not.toContain('seen-one');
  });

  it('includes an entry whose due_at is in the past', () => {
    const s = state({
      entries: [entry('overdue')],
      userEntries: [userEntry('overdue', at('2026-10-20T10:00:00Z'))],
    });
    expect(generateSession(s, at('2026-10-24T10:00:00Z')).entryIds).toContain('overdue');
  });

  it('excludes an entry whose due_at is in the future', () => {
    const s = state({
      entries: [entry('future')],
      userEntries: [userEntry('future', at('2026-11-24T10:00:00Z'))],
    });
    expect(generateSession(s, at('2026-10-24T10:00:00Z')).entryIds).not.toContain('future');
  });

  it('never exceeds the 15-item cap', () => {
    const entries = Array.from({ length: 60 }, (_, i) => entry(`e${i}`));
    const s = state({ entries });
    expect(generateSession(s, at('2026-10-24T10:00:00Z')).entryIds.length).toBeLessThanOrEqual(15);
  });

  it('orders by due_at ascending, then entry_id', () => {
    // All three are already seen and already due, so the ordering is the only
    // thing under test. Dates are in the past relative to `now`.
    const s = state({
      entries: [entry('b'), entry('a'), entry('c')],
      userEntries: [
        userEntry('c', at('2026-10-26T10:00:00Z')),
        userEntry('a', at('2026-10-25T10:00:00Z')),
        userEntry('b', at('2026-10-25T10:00:00Z')),
      ],
    });
    // a and b share a due date, so the tie breaks on id: a before b, then c.
    const ids = generateSession(s, at('2026-10-27T10:00:00Z')).entryIds;
    expect(ids.slice(0, 3)).toEqual(['a', 'b', 'c']);
  });

  it('uses the server date, never a client-supplied one', () => {
    const s = state({
      entries: [entry('edge')],
      userEntries: [userEntry('edge', at('2026-10-24T23:59:00Z'))],
    });
    // Due at 23:59 on the 24th. At 00:01 on the 25th it is overdue; at 23:58
    // on the 24th it is not. The server date decides.
    expect(generateSession(s, at('2026-10-24T23:58:00Z')).entryIds).not.toContain('edge');
    expect(generateSession(s, at('2026-10-25T00:01:00Z')).entryIds).toContain('edge');
  });

  it('returns an empty session for an empty catalog', () => {
    const session = generateSession(state(), at('2026-10-24T10:00:00Z'));
    expect(session.entryIds).toEqual([]);
    expect(session.quoteId).toBeNull();
  });

  it('picks a quote deterministically from the date', () => {
    const s = state({
      entries: [entry('a')],
      quotes: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
    });
    const now = at('2026-10-24T10:00:00Z');
    expect(generateSession(s, now).quoteId).toBe(generateSession(s, now).quoteId);
  });

  it('returns null for the quote when the catalog has none', () => {
    const s = state({ entries: [entry('a')] });
    expect(generateSession(s, at('2026-10-24T10:00:00Z')).quoteId).toBeNull();
  });
});

describe('quoteForDay', () => {
  it('is stable for a given date', () => {
    const quotes = [{ id: 'q1' }, { id: 'q2' }];
    expect(quoteForDay(quotes, at('2026-10-24T10:00:00Z'))).toBe(
      quoteForDay(quotes, at('2026-10-24T10:00:00Z')),
    );
  });

  it('varies across dates', () => {
    const quotes = [0, 1, 2, 3, 4].map((i) => ({ id: `q${i}` }));
    const picks = [0, 1, 2, 3, 4, 5].map((d) =>
      quoteForDay(quotes, at(`2026-10-${String(24 + d).padStart(2, '0')}T10:00:00Z`))?.id,
    );
    expect(new Set(picks).size).toBeGreaterThan(1);
  });

  it('returns null for an empty quote list', () => {
    expect(quoteForDay([], at('2026-10-24T10:00:00Z'))).toBeNull();
  });
});
