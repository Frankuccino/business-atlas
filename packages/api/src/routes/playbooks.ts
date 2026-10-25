import { Router } from 'express';
import { catalog } from '../content';

export const playbooksRouter = Router();

/**
 * Playbooks.
 *
 * A playbook is an entry of type `playbook`: a situation-triggered checklist
 * with the questions to ask, the numbers to pull, the traps, and who to consult.
 *
 * These are content, not user state, so the routes are public and read-only.
 * The catalog is already shipped to the browser for the glossary; playbooks are
 * served here because they are searched by `trigger`, which is a query the
 * client should not have to download the whole catalog to answer.
 */

/** Every playbook, without bodies. */
playbooksRouter.get('/', (_req, res) => {
  const playbooks = catalog.entries.filter((e) => e.type === 'playbook');

  res.json({
    playbooks: playbooks.map((p) => {
      const { body: _body, ...rest } = p;
      return rest;
    }),
  });
});

/**
 * Search playbooks by trigger.
 *
 * Ranked on `trigger` first, then title, then body. A playbook is looked up by
 * the situation it handles, so the trigger is the field that matters.
 */
playbooksRouter.get('/search', (req, res) => {
  const raw = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  if (raw.length === 0) return res.json({ results: [] });

  const scored = catalog.entries
    .filter((e) => e.type === 'playbook')
    .map((entry) => {
      const trigger = entry.trigger.toLowerCase();
      const title = entry.title.toLowerCase();
      const inBody = entry.body.toLowerCase().includes(raw);

      let score = 0;
      if (trigger === raw) score = 100;
      else if (trigger.includes(raw)) score = 60;
      else if (title.includes(raw)) score = 30;
      if (inBody) score += 5;

      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
    .slice(0, 20);

  res.json({ results: scored.map(({ entry }) => entry) });
});

playbooksRouter.get('/:id', (req, res) => {
  const entry = catalog.entries.find((e) => e.id === req.params.id && e.type === 'playbook');
  if (!entry) return res.status(404).json({ error: 'not found' });
  res.json(entry);
});
