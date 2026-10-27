import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { entries } from '../content';
import type { Entry } from '../content';

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

      <div className="search" style={{ maxWidth: '480px', marginBottom: 'var(--s5)' }}>
        <input
          type="search"
          placeholder='Search by situation, e.g. "raising a seed round"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {playbooks.length === 0 ? (
        <p className="empty">
          No playbooks yet. They are entries of type <code>playbook</code> and appear here once
          authored.
        </p>
      ) : results.length === 0 ? (
        <p className="empty">No playbooks match "{query}".</p>
      ) : (
        <div className="entry-grid">
          {results.map((p) => (
            <Link className="card" key={p.id} to={`/entries/${p.id}`}>
              <div className="card-head">
                <div
                  className="layer-badge"
                  style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}
                >
                  PB
                </div>
                <span className="domain-label">{p.domain}</span>
              </div>
              <div className="title">{p.title}</div>
              <div className="one-line">{p.one_line_definition}</div>
              <div className="tags">
                <span className="tag">playbook</span>
                {(p.tags ?? []).slice(0, 2).map((t) => (
                  <span className="tag" key={t}>{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
