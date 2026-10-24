import type { Entry } from './schema';

/**
 * The symmetric closure of the declared link graph.
 *
 * An entry declares the links it cares about. This adds the reverse direction so
 * the graph is undirected, which is what a knowledge graph should be: if ROAS
 * links to CAC, then CAC is about ROAS.
 *
 * Dangling links are left alone. Resolving them is the validator's job, and
 * silently dropping one here would hide an authoring error rather than surface
 * it.
 *
 * Mutates and returns the same array. Callers hold the only reference at build
 * time, so the aliasing is harmless — but a copy would be the safe choice if
 * this ever feeds a cache.
 */
export function closeGraph(entries: Entry[]): Entry[] {
  const byId = new Map(entries.map((e) => [e.id, e]));

  for (const entry of entries) {
    for (const target of entry.related) {
      const other = byId.get(target);
      if (other && !other.related.includes(entry.id)) {
        other.related.push(entry.id);
      }
    }
  }

  return entries;
}
