import { useParams, Link } from 'react-router-dom';
import { domains, byDomain, TYPE_LABELS } from '../content';

const LAYER_NAMES: Record<number, string> = {
  1: 'Foundations',
  2: 'Frameworks',
  3: 'Advanced',
};

export function DomainPage() {
  const { id } = useParams<{ id: string }>();
  const domain = domains.find((d) => d.id === id);

  if (!domain) {
    return (
      <div>
        <h1>Domain not found</h1>
        <p className="muted">No domain with id "{id}".</p>
        <Link to="/">Back to catalog</Link>
      </div>
    );
  }

  const entries = byDomain(domain.id);

  // Group by layer
  const byLayer = new Map<number, typeof entries>();
  for (const e of entries) {
    const layer = e.layer ?? 1;
    if (!byLayer.has(layer)) byLayer.set(layer, []);
    byLayer.get(layer)!.push(e);
  }

  // Group by type
  const byType = new Map<string, typeof entries>();
  for (const e of entries) {
    if (!byType.has(e.type)) byType.set(e.type, []);
    byType.get(e.type)!.push(e);
  }

  return (
    <div>
      <header className="dash-header">
        <h1>{domain.name}</h1>
        <p>{entries.length} entries in this domain.</p>
      </header>

      {/* By layer */}
      {Array.from(byLayer.entries())
        .sort(([a], [b]) => a - b)
        .map(([layer, layerEntries]) => (
          <section className="domain-section" key={layer}>
            <h2>
              Layer {layer} — {LAYER_NAMES[layer] ?? `Layer ${layer}`}
              <span className="muted">{layerEntries.length} entries</span>
            </h2>
            <div className="card-grid">
              {layerEntries.map((e) => (
                <Link key={e.id} to={`/entries/${e.id}`} className="entry-card">
                  <div className="entry-card-top">
                    <span className="layer-badge">L{e.layer}</span>
                    <span className="domain-label">{TYPE_LABELS[e.type] ?? e.type}</span>
                  </div>
                  <h3 className="entry-card-title">{e.title}</h3>
                  <p className="entry-card-desc">{e.one_line_definition}</p>
                  <div className="entry-card-tags">
                    {e.tags.slice(0, 4).map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

      {/* By type summary */}
      <section className="domain-section">
        <h2>
          By type
          <span className="muted">{byType.size} types</span>
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)' }}>
          {Array.from(byType.entries()).map(([type, typeEntries]) => (
            <span key={type} className="badge">
              {TYPE_LABELS[type] ?? type} ({typeEntries.length})
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
