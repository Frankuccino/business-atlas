import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { study, type Progress } from '../api/client';
import { useAuthGate } from '../api/useAuthGate';
import { LAYERS } from '../priority';

/**
 * The progress page.
 *
 * Every number here is derived on the server from `user_entry` and `review`.
 * Nothing is cached client-side, because a stale mastery count is worse than a
 * loading spinner — it tells you you are further along than you are.
 */

export function ProgressPage() {
  const { phase: authPhase, check: checkAuth } = useAuthGate();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        const p = await study.progress();
        if (!cancelled) setProgress(p);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load progress');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checkAuth]);

  if (authPhase === 'anonymous') {
    return (
      <div>
        <h1>Progress</h1>
        <p className="muted">Log in to see your progress.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Progress</h1>
        <p className="warn">{error}</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div>
        <h1>Progress</h1>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const totalEntries = progress.domains.reduce((sum, d) => sum + d.total, 0);
  const totalMastered = progress.domains.reduce((sum, d) => sum + d.canApply, 0);
  const pct = totalEntries === 0 ? 0 : Math.round((totalMastered / totalEntries) * 100);

  return (
    <div>
      <header className="dash-header">
        <h1>Progress</h1>
        <p>Mastery is derived from your reviews, not stored as a counter.</p>
      </header>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Streak</div>
          <div className="stat-value accent">{progress.streak}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Reviews</div>
          <div className="stat-value">{progress.totalReviews}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Mastered</div>
          <div className="stat-value good">{totalMastered}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Catalog</div>
          <div className="stat-value">{totalEntries}</div>
        </div>
      </div>

      <div className="bar">
        <div className="bar-fill good" style={{ width: `${pct}%` }} />
      </div>
      <div className="phase-meta">
        <span>{pct}% of the catalog mastered</span>
        <span>{pct}%</span>
      </div>

      <h2 className="phase-name" style={{ marginBottom: 12 }}>
        By domain
      </h2>
      <table className="dash-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Total</th>
            <th>Unseen</th>
            <th>Seen</th>
            <th>Can explain</th>
            <th>Can apply</th>
          </tr>
        </thead>
        <tbody>
          {progress.domains.map((d) => (
            <tr key={d.id}>
              <td>
                <Link to={`/?domain=${d.id}`}>{d.name}</Link>
              </td>
              <td className="num">{d.total}</td>
              <td className="num">{d.unseen}</td>
              <td className="num">{d.seen}</td>
              <td className="num">{d.canExplain}</td>
              <td className="num">{d.canApply}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="phase-name" style={{ marginBottom: 12 }}>
        Layers
      </h2>
      <div className="phases">
        {LAYERS.map((l) => (
          <div className="phase" key={l.n}>
            <div className="phase-head">
              <span className="phase-name">Layer {l.n}</span>
            </div>
            <div className="phase-title">{l.name}</div>
            <p className="phase-desc">{l.description}</p>
          </div>
        ))}
      </div>

      <h2 className="phase-name" style={{ marginBottom: 12 }}>
        Weak spots
      </h2>
      {progress.weakSpots.length === 0 ? (
        <p className="muted">No failed reviews yet. Grade honestly and this list will appear.</p>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Entry</th>
              <th>Domain</th>
              <th>Failures</th>
            </tr>
          </thead>
          <tbody>
            {progress.weakSpots.map((w) => (
              <tr key={w.entryId}>
                <td>
                  <Link to={`/entries/${w.entryId}`}>{w.title}</Link>
                </td>
                <td>{w.domain}</td>
                <td className="num">{w.failures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
