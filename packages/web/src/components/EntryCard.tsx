import { Link } from 'react-router-dom';
import { DIFFICULTY_LABELS, TYPE_LABELS, domainById, entryById } from '../content';

export function EntryCard({ id }: { id: string }) {
  const entry = entryById.get(id);
  if (!entry) return null;
  const domain = domainById.get(entry.domain);

  return (
    <Link className="card" to={`/entries/${entry.id}`}>
      <div className="title">{entry.title}</div>
      <div className="one-line">{entry.one_line_definition}</div>
      <div className="badges">
        <span className="badge">{TYPE_LABELS[entry.type] ?? entry.type}</span>
        <span className="badge">{domain?.name ?? entry.domain}</span>
        <span className={`badge d${entry.difficulty}`}>
          {DIFFICULTY_LABELS[entry.difficulty] ?? entry.difficulty}
        </span>
      </div>
    </Link>
  );
}
