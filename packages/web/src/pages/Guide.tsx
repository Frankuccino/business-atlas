import { Link } from 'react-router-dom';
import { entries } from '../content';

/**
 * The catalog's own documentation.
 *
 * Priority, Layer, and growth weighting are three orthogonal axes, and the
 * catalog stores two of them on every row. The distinction between them is the
 * single most misunderstood thing in the inventory, so it gets a page rather
 * than a paragraph in a doc.
 *
 * Counts are computed from the live manifest, not hardcoded: the page would
 * otherwise go stale the first time an entry is added.
 */

const LAYERS = [
  {
    n: 1,
    name: 'Literacy',
    desc: 'P&L, balance sheet, cash flow, core metrics, funnel, unit economics.',
  },
  {
    n: 2,
    name: 'Reasoning',
    desc: 'Strategy, pricing, positioning, operations, incentives.',
  },
  {
    n: 3,
    name: 'Judgment',
    desc: 'Playbooks, cases, decision journal.',
  },
  {
    n: 4,
    name: 'Venture-readiness',
    desc: 'Fundraising, cap tables, legal, hiring.',
  },
] as const;

const PRIORITIES = [
  {
    id: 'P1',
    name: 'v1',
    desc: 'The set that makes the site usable as a daily reference: the vocabulary you cannot reason without, plus the playbooks that make it a decision tool.',
  },
  {
    id: 'P2',
    name: 'Next wave',
    desc: 'Deepens the growth domains.',
  },
  {
    id: 'P3',
    name: 'Later',
    desc: 'Fills the rest of the taxonomy.',
  },
] as const;

const WEIGHTED = [
  'unit-economics',
  'marketing',
  'sales',
  'strategy',
  'capital',
] as const;

function countBy(predicate: (entry: (typeof entries)[number]) => boolean): number {
  return entries.filter(predicate).length;
}

export function GuidePage() {
  const byLayer = LAYERS.map((l) => ({
    ...l,
    count: countBy((e) => e.layer === l.n),
  }));

  const byStatus = {
    draft: countBy((e) => e.status === 'draft'),
    reviewed: countBy((e) => e.status === 'reviewed'),
  };

  return (
    <article className="entry-body">
      <header className="entry-header">
        <h1>How the catalog is organised</h1>
        <p className="one-line">
          Priority, Layer, and growth weighting are three separate axes. They are
          not three ways of ranking importance.
        </p>
        <div className="badges">
          <span className="badge">{entries.length} entries</span>
          <span className="badge">14 domains</span>
          <span className="badge">{byStatus.draft} draft</span>
          <span className="badge">{byStatus.reviewed} reviewed</span>
        </div>
      </header>

      <p>
        Every entry in the catalog carries five attributes. Three of them decide
        what the entry <em>is</em>; two decide <em>when it ships</em>. Reading the
        two groups as one is how a Layer 1 entry ends up filed as "less
        important" than a Layer 4 one.
      </p>

      <h2>Priority — when it ships</h2>
      <p>
        Priority answers <strong>when</strong>. It is a statement about the first
        release, not about value. From the catalog: "Priority is about the first
        build, not about importance."
      </p>

      <table>
        <thead>
          <tr>
            <th>Band</th>
            <th>Meaning</th>
            <th>What it contains</th>
          </tr>
        </thead>
        <tbody>
          {PRIORITIES.map((p) => (
            <tr key={p.id}>
              <td>
                <strong>{p.id}</strong>
              </td>
              <td>{p.name}</td>
              <td>{p.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Layer — how hard the idea is</h2>
      <p>
        Layer answers <strong>how deep</strong>. It is the sophistication of the
        reasoning the entry demands, and it is independent of when the entry
        ships.
      </p>

      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Name</th>
            <th>Typical content</th>
            <th>Entries</th>
          </tr>
        </thead>
        <tbody>
          {byLayer.map((l) => (
            <tr key={l.n}>
              <td>
                <span className={`badge d${l.n}`}>Layer {l.n}</span>
              </td>
              <td>
                <strong>{l.name}</strong>
              </td>
              <td>{l.desc}</td>
              <td className="muted">{l.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>The two axes disagree, and that is the point</h2>
      <p>
        The proof that Priority and Layer are independent is in the catalog
        itself. Two entries:
      </p>

      <table>
        <thead>
          <tr>
            <th>Entry</th>
            <th>Layer</th>
            <th>Priority</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Link to="/entries/supply-and-demand">Supply and Demand</Link>
            </td>
            <td>1 — Literacy</td>
            <td>P2</td>
            <td>
              The first idea any economics student meets, but not needed to make
              the v1 reference usable.
            </td>
          </tr>
          <tr>
            <td>
              <Link to="/entries/cap-table">Cap Table</Link>
            </td>
            <td>4 — Venture-readiness</td>
            <td>P1</td>
            <td>
              A venture-stage concern, but this catalog is built for a
              high-growth venture, so it ships in v1.
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        If you sequence by difficulty you build a textbook. If you sequence by
        who the product is for you build a product. The brief chose the second,
        and the catalog is that decision made visible.
      </p>

      <h2>Growth weighting — where depth pays off</h2>
      <p>
        A third signal, from the brief rather than from the entry rows. Built for
        high-growth ventures, so five domains get depth first:
      </p>

      <ul>
        {WEIGHTED.map((id) => {
          const list = entries.filter((e) => e.domain === id);
          return (
            <li key={id}>
              <code>{id}</code> — {list.length} entries
            </li>
          );
        })}
      </ul>

      <p>
        Foundations and Finance are the vocabulary base underneath them and stay
        shallow-but-complete. When the three signals disagree — a thin domain
        that is also growth-weighted, say — the catalog's coverage table is where
        they reconcile.
      </p>

      <h2>Status — how much to trust it</h2>
      <p>
        <code>draft</code> means authored but not verified against a primary or
        authoritative source. <code>reviewed</code> means verified. Currently{' '}
        {byStatus.draft} of {entries.length} entries are draft, so the whole
        catalog is honest but unverified.
      </p>

      <h2>What this is not</h2>
      <ul>
        <li>
          <strong>P3 is not debt.</strong> Unstarted, not overdue. The catalog
          says outright that the remaining entries are a roadmap.
        </li>
        <li>
          <strong>Layer 1 is not more important.</strong> It is earlier in a
          learning sequence, which is a different claim.
        </li>
        <li>
          <strong>Priority is not permanent.</strong> It is a v1 decision. A P2
          entry can become P1 if the product's audience changes.
        </li>
      </ul>

      <h2>Where this lives in the repo</h2>
      <ul>
        <li>
          <code>docs/catalog.md</code> — the inventory, with these axes as
          columns on every row.
        </li>
        <li>
          <code>docs/brief.md</code> — the definitions of Layer and the growth
          weighting.
        </li>
        <li>
          <code>packages/api/src/content/schema.ts</code> — the field-level
          schema, including the <code>layer</code> range.
        </li>
      </ul>

      <p className="muted">
        This page renders the live manifest, so its counts cannot go stale. The
        one thing it cannot show is Priority, because Priority is a catalog
        concept rather than an entry field — see the note on the home page.
      </p>
    </article>
  );
}
