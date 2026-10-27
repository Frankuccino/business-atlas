import { useSearchParams } from 'react-router-dom';
import { byDomain, domains } from '../content';
import { EntryCard } from '../components/EntryCard';

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
