import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { entries } from '../content';
import type { Entry } from '../content';

/**
 * The playbook library.
 *
 * A playbook is an entry of type `playbook`: a situation, the questions to ask,
 * the numbers to pull, the traps, and who to consult.
 *
 * The catalog is bundled, so this page filters it locally rather than calling the
 * API. That is deliberate — the playbook list is content, and shipping it with
 * the bundle means this page works with the API down. The API's
 * `/api/playbooks` routes exist for clients that are not the bundled web app.
 */

type Playbook = Extract<Entry, { type: 'playbook' }>;

const playbooks = entries.filter((e): e is Playbook => e.type === 'playbook');

export function PlaybooksPage() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return playbooks;

    return playbooks.filter(
      (p) =>
        p.trigger.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div>
      <header className="dash-header">
        <h1>Playbooks</h1>
        <p>Situation-triggered checklists. Search by the situation you are in.</p>
      </header>

      <input
        className="search"
        type="search"
        placeholder="Search by situation, e.g. “raising a seed round”"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {playbooks.length === 0 ? (
        <p className="muted">
          No playbooks yet. They are entries of type <code>playbook</code> and appear here once
          authored.
        </p>
      ) : results.length === 0 ? (
        <p className="muted">No playbooks match “{query}”.</p>
      ) : (
        <div className="cards">
          {results.map((p) => (
            <Link className="card" key={p.id} to={`/entries/${p.id}`}>
              <div className="card-head">
                <span className="card-kind">{p.trigger}</span>
              </div>
              <h3 className="card-title">{p.title}</h3>
              <p className="card-desc">{p.one_line_definition}</p>

              {p.questions.length > 0 ? (
                <div className="card-section">
                  <div className="card-label">Ask</div>
                  <ul>
                    {p.questions.slice(0, 3).map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                    {p.questions.length > 3 ? (
                      <li className="muted">+{p.questions.length - 3} more</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}

              {p.traps.length > 0 ? (
                <div className="card-section">
                  <div className="card-label">Traps</div>
                  <ul>
                    {p.traps.slice(0, 2).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
