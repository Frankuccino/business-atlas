# Business Atlas — Scheduler

Status: implemented 2026-10-25 — `packages/api/src/scheduler/`

Reference: `intervals.ts` (the ladder) and `session.ts` (the generator). Both are
pure: `now` is an argument, so neither reads the clock and both are testable at
any date. 27 unit tests cover them.

## The one rule that matters

**Compute the session from persisted state. Never mutate during render.**

Same rule as Platform Atlas, and for the same reason: recomputing "today's
list" inside the component body re-rolls it on every render, so items vanish
when you tab away and the list changes shape mid-session.

## Rolling queue, not a calendar day

The brief's "daily session" is a habit loop, not a calendar constraint. So:

- There is no "today's list" that resets at midnight.
- A session is generated on demand from persisted state.
- The cap is on **items per session**, not sessions per day.

You can run two sessions in a day. You can miss a week and come back to a
backlog. The habit survives; a fixed calendar day with streaks does not.

## Session composition

    1 new term
    1 new framework or principle
    N due review items
    1 quote tied to the session's domain

Capped at 15 items total. The caps are constants, not configuration — you can
tune them later, but they are not user-facing settings in v1.

Verified against the real catalog: a fresh user gets 2 items (1 term + 1
framework/principle), and a user with everything overdue gets the 15-item cap.

## Due calculation

    due = user_entry.due_at <= now

`now` is the **server** date, computed once per request. Never the client date.
If the client supplies the date, you can mark anything reviewed and never be
shown it again.

New entries have no `user_entry` row. They are due by definition, ordered by
`layer`, then by position within the domain.

## Intervals

Fixed ladder, not SM-2. SM-2 is opaque and hard to defend in an interview; a
fixed ladder is predictable and debuggable.

    again    -> 0 days   (re-queue today)
    hard     -> 1 day
    good     -> 3 days
    easy     -> 7 days
    mastered -> 30 days, then 90, then capped at 90

The `mastered` cap matters: an unbounded interval means an item you never see
again, which is a silent hole in your review coverage.

## Skip is not free

Skipping advances `due_at` and logs a `review` row with `quality = 0` and
`answer = null`. Otherwise the item is silently rescheduled forever and you
never notice you are avoiding it.

Skipping something you did not know is worse than answering it wrong. That is
the correct incentive.

## The quote is deterministic, not random

"Quote tied to today's topic" needs variety across days and reproducibility
within a day. `Math.random()` breaks both.

    index = dayOfYear % quotes.length

Deterministic across replays, varied across days, no stored state. If you want
a different spread, change the seed — do not reach for randomness.

**Currently inert.** The catalog has one source, so `dayOfYear % 1` is always 0
and the same quote is served every day. This is correct behaviour, not a bug —
the rotation only becomes meaningful once quotes are authored.

## Determinism

The same persisted state must always produce the same session. Order by
`due_at` ascending, then `entry_id`. No shuffle, no time-dependent ordering.

Verified: the ordering property holds against the real catalog.

## Property tests

All of these are covered:

- Each quality value maps to the expected next `due_at` from a known date.
- A skipped item still advances.
- The same state produces the same session on repeated calls.
- Day boundaries: an item due at 23:59 is not due at 00:01 the same day.
- Clock skew: the scheduler uses the server date, never the client date.
- The quote index is stable for a given date and varies across dates.
- A new entry with no `user_entry` row is always due.

## Not yet wired

The generator is built and tested but no route calls it. `POST /api/session`
(plan task 11) is the consumer, and it needs the Drizzle schema and auth first.
