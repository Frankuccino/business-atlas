import { Router } from 'express';
import { catalog } from '../content';
import type { Entry } from '../content/schema';

export const entriesRouter = Router();

function withoutBody(entry: Entry): Omit<Entry, 'body'> {
  const { body: _body, ...rest } = entry;
  return rest;
}

/** The whole catalog. Small enough to ship whole; the client searches locally. */
entriesRouter.get('/', (_req, res) => {
  res.json({
    entries: catalog.entries.map(withoutBody),
    sources: catalog.sources,
    domains: catalog.domains,
  });
});

/**
 * Case-insensitive substring search over title, id, tags, and body.
 *
 * Ranking is deliberate: an exact id match beats a title match, which beats a
 * body mention. Without it, searching "roas" would rank a long article that
 * mentions ROAS once above the ROAS entry itself.
 */
entriesRouter.get('/search', (req, res) => {
  const raw = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  if (raw.length === 0) return res.json({ results: [] });

  const scored = catalog.entries
    .map((entry) => {
      const id = entry.id.toLowerCase();
      const title = entry.title.toLowerCase();
      const inTags = entry.tags.some((tag) => tag.toLowerCase().includes(raw));
      const inBody = entry.body.toLowerCase().includes(raw);

      let score = 0;
      if (id === raw) score = 100;
      else if (id.startsWith(raw)) score = 60;
      else if (title.includes(raw)) score = 40;
      if (inTags) score += 10;
      if (inBody) score += 5;

      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
    .slice(0, 20);

  res.json({ results: scored.map(({ entry }) => withoutBody(entry)) });
});

entriesRouter.get('/:id', (req, res) => {
  const entry = catalog.entries.find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'not found' });
  res.json(entry);
});
