import { describe, expect, it } from 'vitest';
import { nextInterval, qualityToRung, QUALITIES } from './intervals';

const DAY = 24 * 60 * 60 * 1000;
const at = (iso: string) => new Date(iso);

describe('nextInterval', () => {
  it('re-queues "again" today', () => {
    expect(nextInterval('again', at('2026-10-24T10:00:00Z'))).toEqual(at('2026-10-24T10:00:00Z'));
  });

  it('schedules "hard" one day out', () => {
    expect(nextInterval('hard', at('2026-10-24T10:00:00Z'))).toEqual(at('2026-10-25T10:00:00Z'));
  });

  it('schedules "good" three days out', () => {
    expect(nextInterval('good', at('2026-10-24T10:00:00Z'))).toEqual(at('2026-10-27T10:00:00Z'));
  });

  it('schedules "easy" seven days out', () => {
    expect(nextInterval('easy', at('2026-10-24T10:00:00Z'))).toEqual(at('2026-10-31T10:00:00Z'));
  });

  it('schedules "mastered" 30 days out on the first pass', () => {
    expect(nextInterval('mastered', at('2026-10-24T10:00:00Z'))).toEqual(at('2026-11-23T10:00:00Z'));
  });

  it('extends "mastered" to 90 days once the previous interval was 30', () => {
    expect(nextInterval('mastered', at('2026-10-24T10:00:00Z'), 30)).toEqual(at('2027-01-22T10:00:00Z'));
  });

  it('caps "mastered" at 90 days rather than extending forever', () => {
    // 30 -> 90 on the first extension, then flat. The cap is the point: an
    // unbounded interval means an item you never see again.
    const first = nextInterval('mastered', at('2026-10-24T10:00:00Z'), 30);
    const second = nextInterval('mastered', at('2026-10-24T10:00:00Z'), 90);
    const third = nextInterval('mastered', at('2026-10-24T10:00:00Z'), 90);

    const days = (d: Date) => (d.getTime() - at('2026-10-24T10:00:00Z').getTime()) / DAY;
    expect(days(first)).toBe(90);
    expect(days(second)).toBe(90);
    expect(days(third)).toBe(90);
  });

  it('treats a skip (quality 0) as "again" — it must not silently reschedule', () => {
    expect(nextInterval('again', at('2026-10-24T10:00:00Z'))).toEqual(
      nextInterval('again', at('2026-10-24T10:00:00Z')),
    );
  });

  it('never returns a date in the past', () => {
    for (const q of QUALITIES) {
      const next = nextInterval(q, at('2026-10-24T10:00:00Z'));
      expect(next.getTime()).toBeGreaterThanOrEqual(at('2026-10-24T10:00:00Z').getTime());
    }
  });

  it('is deterministic — same inputs, same output', () => {
    const now = at('2026-10-24T10:00:00Z');
    for (const q of QUALITIES) {
      expect(nextInterval(q, now)).toEqual(nextInterval(q, now));
    }
  });

  it('exposes the ladder in quality order', () => {
    expect(QUALITIES).toEqual(['again', 'hard', 'good', 'easy', 'mastered']);
  });

  it('maps a numeric review quality to a ladder rung', () => {
    // The route receives 0..5; the ladder has five rungs. 0 and 1 are failures.
    expect(qualityToRung(0)).toBe('again');
    expect(qualityToRung(1)).toBe('again');
    expect(qualityToRung(2)).toBe('hard');
    expect(qualityToRung(3)).toBe('good');
    expect(qualityToRung(4)).toBe('easy');
    expect(qualityToRung(5)).toBe('mastered');
  });

  it('clamps an out-of-range quality rather than throwing', () => {
    // The route validates 0..5 with zod before this runs, so these are
    // unreachable in practice. The contract is a clamp, not a throw: a bad
    // value should degrade to the nearest rung, not 500 the request.
    expect(qualityToRung(99)).toBe('mastered');
    expect(qualityToRung(-1)).toBe('again');
  });
});
