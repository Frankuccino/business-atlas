import { Link } from 'react-router-dom';
import { learnNext, relatedEntries } from '../content';
import type { Entry } from '../content';

/**
 * The graph panel. Related links first, then "what to learn next".
 *
 * Related is the entry's declared edges; learnNext is derived from them. The two
 * are separated because one is authored and one is computed — a reviewer should
 * be able to tell which is which.
 */
export function RelatedPanel({ entry }: { entry: Entry }) {
  const related = relatedEntries(entry);
  const next = learnNext(entry);

  if (related.length === 0 && next.length === 0) {
    return null;
  }

  return (
    <div className="panel">
      <h3>Related</h3>
      {related.length === 0 ? (
        <p className="muted">No links yet.</p>
      ) : (
        <div className="related">
          {related.map((r) => (
            <Link key={r.id} to={`/entries/${r.id}`}>
              <strong>{r.title}</strong>
              <div className="muted">{r.one_line_definition}</div>
            </Link>
          ))}
        </div>
      )}

      {next.length > 0 && (
        <>
          <h3 style={{ marginTop: 10 }}>What to learn next</h3>
          <ul>
            {next.map((n) => (
              <li key={n.id}>
                <Link to={`/entries/${n.id}`}>{n.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
