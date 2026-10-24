import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { entries, TYPE_LABELS } from '../content';

/**
 * Instant search over the bundled catalog.
 *
 * Client-side by design: the catalog is bundled, so this is a synchronous scan
 * with no network. It is the same ranking rule the API's `/search` implements —
 * exact id match, then title, then tag, then body — so local and remote results
 * never disagree.
 */
export function SearchBox() {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const raw = q.trim().toLowerCase();
    if (raw.length === 0) return [];

    return entries
      .map((entry) => {
        const id = entry.id.toLowerCase();
        const title = entry.title.toLowerCase();
        const inTags = entry.tags.some((t) => t.toLowerCase().includes(raw));
        const inBody = entry.body.toLowerCase().includes(raw);

        let score = 0;
        if (id === raw) score = 100;
        else if (id.startsWith(raw)) score = 60;
        else if (title.includes(raw)) score = 40;
        if (inTags) score += 10;
        if (inBody) score += 5;

        return { entry, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
      .slice(0, 8);
  }, [q]);

  return (
    <div className="search">
      <input
        type="search"
        value={q}
        placeholder="Search terms, acronyms, tags…"
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search"
      />
      {results.length > 0 && (
        <div className="results">
          {results.map(({ entry }) => (
            <Link key={entry.id} to={`/entries/${entry.id}`} onClick={() => setQ('')}>
              {entry.title}
              <span className="type">{TYPE_LABELS[entry.type] ?? entry.type}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
