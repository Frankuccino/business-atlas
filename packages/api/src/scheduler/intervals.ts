/**
 * The review interval ladder.
 *
 * A fixed ladder rather than SM-2, deliberately. SM-2's interval is a function
 * of the entire review history, so a surprising `due_at` is hard to explain and
 * harder to defend in an interview. This ladder is a lookup: the same quality
 * always produces the same next interval, and the whole algorithm fits on one
 * screen.
 *
 * Pure by construction — no clock reads, no I/O. `now` is an argument so the
 * function is testable at any date and free of hidden state.
 */

export const QUALITIES = ['again', 'hard', 'good', 'easy', 'mastered'] as const;
export type Quality = (typeof QUALITIES)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days to add for each rung, before the "mastered" extension is applied. */
const BASE_DAYS: Record<Quality, number> = {
  again: 0,
  hard: 1,
  good: 3,
  easy: 7,
  mastered: 30,
};

/** The ceiling for a mastered item. Without it the interval grows forever. */
const MASTERED_MAX_DAYS = 90;

/**
 * The next due date for a review.
 *
 * @param quality  How well the item was recalled.
 * @param now      The server date. Never read from the clock here.
 * @param previousIntervalDays  The item's current interval, when it has one.
 *                    Only "mastered" uses it, to extend 30 -> 90.
 */
export function nextInterval(
  quality: Quality,
  now: Date,
  previousIntervalDays?: number,
): Date {
  let days = BASE_DAYS[quality];

  // A mastered item that was already on a long interval gets one extension,
  // then stops. The guard is on the *previous* interval so the cap is reached
  // in one step rather than creeping.
  if (quality === 'mastered' && previousIntervalDays !== undefined) {
    days = Math.min(previousIntervalDays * 3, MASTERED_MAX_DAYS);
  }

  return new Date(now.getTime() + days * DAY_MS);
}

/**
 * Map a numeric review quality (0..5) onto a ladder rung.
 *
 * The route layer receives a number because that is what a five-button UI
 * produces. The ladder is named because names are debuggable. This is the only
 * place the two meet.
 *
 * 0 and 1 are both failures: a wrong answer and a guess are the same event as
 * far as scheduling is concerned, and splitting them would add a rung with no
 * behavioural difference.
 */
export function qualityToRung(quality: number): Quality {
  if (quality >= 5) return 'mastered';
  if (quality === 4) return 'easy';
  if (quality === 3) return 'good';
  if (quality === 2) return 'hard';
  return 'again';
}
