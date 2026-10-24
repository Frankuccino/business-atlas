import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { domainById, entryById } from '../content';
import { RelatedPanel } from '../components/RelatedPanel';
import { DIFFICULTY_LABELS, TYPE_LABELS } from '../content';

export function EntryPage() {
  const { id } = useParams();
  const entry = id ? entryById.get(id) : undefined;

  if (!entry) {
    return (
      <div className="empty">
        <p>No entry with that id.</p>
        <Link to="/">Back to the glossary</Link>
      </div>
    );
  }

  const domain = domainById.get(entry.domain);

  return (
    <article>
      <header className="entry-header">
        <h1>{entry.title}</h1>
        <p className="one-line">{entry.one_line_definition}</p>
        <div className="badges">
          <span className="badge">{TYPE_LABELS[entry.type] ?? entry.type}</span>
          <span className="badge">{domain?.name ?? entry.domain}</span>
          <span className={`badge d${entry.difficulty}`}>
            {DIFFICULTY_LABELS[entry.difficulty] ?? entry.difficulty}
          </span>
          <span className="badge">Layer {entry.layer}</span>
          <span className="badge">{entry.status}</span>
        </div>
      </header>

      <p>{entry.why_it_matters}</p>

      {entry.type === 'term' && 'formula' in entry && entry.formula && (
        <div className="formula">{entry.formula}</div>
      )}

      {entry.type === 'term' && 'how_to_read' in entry && entry.how_to_read && (
        <p className="muted">{entry.how_to_read}</p>
      )}

      {entry.body && (
        <div className="entry-body">
          <ReactMarkdown>{entry.body}</ReactMarkdown>
        </div>
      )}

      <RelatedPanel entry={entry} />

      {entry.sources.length > 0 && (
        <div className="panel">
          <h3>Sources</h3>
          <p className="muted">{entry.sources.join(', ')}</p>
        </div>
      )}
    </article>
  );
}
