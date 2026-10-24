import { useSearchParams } from 'react-router-dom';
import { byDomain, domains } from '../content';
import { EntryCard } from '../components/EntryCard';

/**
 * The glossary. All populated domains by default, or one when `?domain=` is set.
 *
 * The `?domain=` param keeps the sidenav links plain stateless hrefs, so the
 * catalog is shareable by URL without routing every domain through a path
 * segment.
 *
 * Empty domains are omitted from the body, not the nav: the nav already carries
 * the full taxonomy and marks what is empty, so fourteen "nothing here yet"
 * blocks would bury the entries that exist.
 */
export function Home() {
  const [params] = useSearchParams();
  const active = params.get('domain');
  const populated = domains.filter((d) => byDomain(d.id).length > 0);
  const shown = active ? populated.filter((d) => d.id === active) : populated;

  if (shown.length === 0) {
    return <p className="empty">No entries in this domain yet.</p>;
  }

  return (
    <div>
      {shown.map((d) => {
        const list = byDomain(d.id);
        return (
          <section className="domain-section" key={d.id}>
            <h2>
              {d.name} <span className="muted">({list.length})</span>
            </h2>
            <div className="entry-grid">
              {list.map((e) => (
                <EntryCard key={e.id} id={e.id} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
