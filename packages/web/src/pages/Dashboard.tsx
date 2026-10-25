import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { domains, entries, entryById } from '../content';
import { LAYERS, PHASES, PRIORITY_BY_ENTRY, phaseSize, type Priority } from '../priority';

/**
 * Progress dashboard.
 *
 * Two things are deliberately not here yet, and the page says so rather than
 * pretending otherwise:
 *
 *   1. Real per-user mastery. That lives in Postgres (`user_entry.mastery`) and
 *      needs auth, which is not built. Until then this page shows catalog
 *      coverage — what exists, how it is phased, what is unlocked — which is
 *      useful on its own and becomes the real dashboard the day auth lands.
 *   2. A server round-trip. The catalog is bundled, so every number here is
 *      computed locally and instant.
 *
 * The phase gate is the interesting part. P2 and P3 are locked until the user
 * reaches a mastery fraction in the previous phase. With no user state that
 * fraction is zero, so everything reads as unlocked — which is correct for a
 * catalog view and wrong for a learning view. The gate is implemented now so the
 * day mastery exists, the page needs no structural change.
 */

/** Mastery fraction for a phase. Zero until user state exists. */
function masteryFraction(_phase: Priority): number {
  return 0;
}

function PhaseCard({ phase }: { phase: (typeof PHASES)[number] }) {
  const size = phaseSize(phase.id);
  const fraction = masteryFraction(phase.id);
  const unlocked = fraction >= phase.unlockAt;
  const pct = Math.round(fraction * 100);

  return (
    <div className={`phase${unlocked ? '' : ' locked'}`}>
      <div className="phase-head">
        <span className="phase-name">{phase.name}</span>
        <span className={`badge ${unlocked ? 'd2' : ''}`}>
          {unlocked ? 'unlocked' : 'locked'}
        </span>
      </div>

      <div className="phase-title">{phase.title}</div>
      <p className="phase-desc">{phase.description}</p>

      <div className="bar">
        <div
          className={`bar-fill ${unlocked ? 'good' : ''}`}
          style={{ width: `${Math.max(pct, unlocked ? 4 : 0)}%` }}
        />
      </div>

      <div className="phase-meta">
        <span>{size} entries</span>
        <span>{pct}% mastered</span>
      </div>

      <div className="phase-rule">
        {phase.unlockAt === 0 ? (
          <>
            <strong>Open from the start.</strong> This is the v1 set.
          </>
        ) : (
          <>
            <strong>Unlocks at {Math.round(phase.unlockAt * 100)}%</strong> mastery of the
            previous phase.
          </>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const byLayer = useMemo(
    () =>
      LAYERS.map((l) => ({
        ...l,
        count: entries.filter((e) => e.layer === l.n).length,
      })),
    [],
  );

  const byDomain = useMemo(
    () =>
      domains.map((d) => {
        const list = entries.filter((e) => e.domain === d.id);
        return {
          ...d,
          total: list.length,
          p1: list.filter((e) => PRIORITY_BY_ENTRY[e.id] === 'P1').length,
        };
      }),
    [],
  );

  const draft = entries.filter((e) => e.status === 'draft').length;
  const reviewed = entries.length - draft;

  return (
    <div>
      <header className="dash-header">
        <h1>Progress</h1>
        <p>
          Catalog coverage and phase gating. Per-entry mastery arrives with auth;
          until then this tracks what exists and how it is sequenced.
        </p>
      </header>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Entries</div>
          <div className="stat-value accent">{entries.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Domains</div>
          <div className="stat-value">{domains.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Reviewed</div>
          <div className="stat-value good">{reviewed}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Draft</div>
          <div className="stat-value warn">{draft}</div>
        </div>
      </div>

      <h2 className="phase-name" style={{ marginBottom: 12 }}>
        Phases
      </h2>
      <div className="phases">
        {PHASES.map((p) => (
          <PhaseCard key={p.id} phase={p} />
        ))}
      </div>

      <h2 className="phase-name" style={{ marginBottom: 12 }}>
        Layers
      </h2>
      <div className="phases">
        {byLayer.map((l) => (
          <div className="phase" key={l.n}>
            <div className="phase-head">
              <span className="phase-name">Layer {l.n}</span>
              <span className="badge d{l.n}">{l.count} entries</span>
            </div>
            <div className="phase-title">{l.name}</div>
            <p className="phase-desc">{l.description}</p>
          </div>
        ))}
      </div>

      <h2 className="phase-name" style={{ marginBottom: 12 }}>
        Coverage by domain
      </h2>
      <table className="dash-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Total</th>
            <th>P1</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {byDomain.map((d) => {
            const pct = d.total === 0 ? 0 : Math.round((d.p1 / d.total) * 100);
            return (
              <tr key={d.id}>
                <td>
                  <Link to={`/?domain=${d.id}`}>{d.name}</Link>
                </td>
                <td className="num">{d.total}</td>
                <td className="num">{d.p1}</td>
                <td>
                  <div className="bar">
                    <div className="bar-fill good" style={{ width: `${pct}%` }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="panel">
        <h3>What is missing</h3>
        <ul>
          <li>
            <strong>Per-entry mastery.</strong> Requires <code>user_entry</code> in
            Postgres and refresh-cookie auth. The schema is specified in{' '}
            <code>docs/data-model.md</code>; the API is not built.
          </li>
          <li>
            <strong>Spaced repetition.</strong> Depends on mastery, so it follows auth.
          </li>
          <li>
            <strong>Real unlock state.</strong> The phase gate is implemented and reads{' '}
            <code>unlockAt</code>; with no user state every phase reads as unlocked.
          </li>
        </ul>
      </div>
    </div>
  );
}
