import { Link } from 'react-router-dom';
import { DIFFICULTY_LABELS, TYPE_LABELS, domainById, entryById } from '../content';

const LAYER_COLORS: Record<number, string> = {
  1: '#34c759',
  2: '#007aff',
  3: '#ff9500',
  4: '#ff3b30',
};

export function EntryCard({ id }: { id: string }) {
  const entry = entryById.get(id);
  if (!entry) return null;
  const domain = domainById.get(entry.domain);

  return (
    <Link className="card" to={`/entries/${entry.id}`}>
      <div className="card-head">
        <div
          className="layer-badge"
          style={{ background: `${LAYER_COLORS[entry.difficulty] ?? '#86868b'}15`, color: LAYER_COLORS[entry.difficulty] ?? '#86868b' }}
        >
          L{entry.difficulty}
        </div>
        <span className="domain-label">{domain?.name ?? entry.domain}</span>
      </div>
      <div className="title">{entry.title}</div>
      <div className="one-line">{entry.one_line_definition}</div>
      <div className="tags">
        <span className="tag">{TYPE_LABELS[entry.type] ?? entry.type}</span>
        {(entry.tags ?? []).slice(0, 2).map((t) => (
          <span className="tag" key={t}>{t}</span>
        ))}
      </div>
    </Link>
  );
}
