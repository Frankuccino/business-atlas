import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { entryById } from '../content';
import { study, type SessionRecord } from '../api/client';
import { useAuthGate } from '../api/useAuthGate';
import { ReviewCard } from '../components/ReviewCard';

/**
 * The daily session.
 *
 * The queue comes from the server, generated from persisted state. That matters:
 * a queue computed in the component body would re-roll on every render, so items
 * would vanish when you tab away and the list would change shape mid-session.
 *
 * The page owns the queue and advances through it locally. It does not
 * regenerate — the server already decided what belongs in this session.
 */

type Phase = 'loading' | 'unauthenticated' | 'ready' | 'empty' | 'done' | 'error';

export function SessionPage() {
  const { check: checkAuth } = useAuthGate();
  const [phase, setPhase] = useState<Phase>('loading');
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Bumped to re-run the effect. A retry is a user action, so it needs a handle
  // rather than being folded into the mount effect.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // StrictMode double-invokes effects in development: mount, cleanup, mount.
    // The cleanup sets `cancelled`, which would kill the first mount's work —
    // but the second mount starts fresh with its own `cancelled`, so the work
    // completes. A `ran` boolean guard would break this: the first mount sets
    // it, the cleanup cancels the work, and the second mount is blocked.
    let cancelled = false;

    (async () => {
      const authenticated = await checkAuth();
      if (!authenticated || cancelled) return;

      try {
        const created = await study.createSession();
        if (cancelled) return;

        setSession(created);
        if (created.entryIds.length === 0) {
          setPhase('empty');
          return;
        }
        setPhase('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Could not load a session');
        setPhase('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkAuth, attempt]);

  const review = useCallback(
    async (quality: number) => {
      if (!session) return;

      const entryId = session.entryIds[index];
      if (!entryId) return;

      setPending(true);
      try {
        await study.review(session.id, entryId, quality);
        if (index + 1 >= session.entryIds.length) {
          await study.completeSession(session.id).catch(() => undefined);
          setPhase('done');
        } else {
          setIndex((i) => i + 1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Review failed');
      } finally {
        setPending(false);
      }
    },
    [session, index],
  );

  if (phase === 'loading') {
    return (
      <div>
        <h1>Session</h1>
        <p className="muted">Loading your queue…</p>
      </div>
    );
  }

  if (phase === 'unauthenticated') {
    return (
      <div>
        <h1>Session</h1>
        <p className="muted">You need an account to review.</p>
        <p>
          The catalog is public, but study state is per-user. <Link to="/">Browse the catalog</Link>{' '}
          meanwhile.
        </p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div>
        <h1>Session</h1>
        <p className="warn">{error}</p>
        <button className="btn" onClick={() => setAttempt((a) => a + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div>
        <h1>Session</h1>
        <p className="muted">Nothing is due right now.</p>
        <p>
          New entries are added to the queue as you work through the catalog, and due items return on
          their interval.
        </p>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div>
        <h1>Session complete</h1>
        <p className="muted">
          {session?.entryIds.length ?? 0} items reviewed. Your next session is generated from this
          state, so the queue will reflect what you just graded.
        </p>
        <button className="btn" onClick={() => setAttempt((a) => a + 1)}>
          Start another
        </button>
      </div>
    );
  }

  const entry = session ? entryById.get(session.entryIds[index] ?? '') : undefined;

  if (!entry) {
    return (
      <div>
        <h1>Session</h1>
        <p className="warn">This entry is not in the catalog.</p>
      </div>
    );
  }

  const total = session?.entryIds.length ?? 0;

  return (
    <div>
      <header className="dash-header">
        <h1>Session</h1>
        <p>
          {total} items. {session?.quoteId ? `Quote: ${session.quoteId}` : 'No quote today.'}
        </p>
      </header>

      <div className="bar">
        <div
          className="bar-fill good"
          style={{ width: `${Math.round(((index + 1) / total) * 100)}%` }}
        />
      </div>
      <div className="phase-meta">
        <span>
          Item {index + 1} of {total}
        </span>
        <span>{Math.round(((index + 1) / total) * 100)}%</span>
      </div>

      <ReviewCard entry={entry} onReview={(q) => void review(q)} pending={pending} />

      {error ? <p className="warn">{error}</p> : null}
    </div>
  );
}
