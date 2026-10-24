import manifest from '@business-atlas/api/src/content/manifest.json';
import type { Catalog, Entry } from '@business-atlas/api/src/content/schema';

/**
 * The catalog, bundled at build time.
 *
 * The manifest is generated and validated by the API's build step, and the API
 * re-validates it on load. This cast is the one place the web trusts it without
 * re-parsing; it keeps the API data-only and lets the web ship without a runtime
 * dependency on the API being up.
 */
export const catalog = manifest as Catalog;

export type { Catalog, Entry };

export const entries = catalog.entries;
export const sources = catalog.sources;
export const domains = catalog.domains;

export const entryById = new Map<string, Entry>(entries.map((e) => [e.id, e]));

export const domainById = new Map(domains.map((d) => [d.id, d]));

/** Entries in one domain, in id order. */
export function byDomain(domainId: string): Entry[] {
  return entries.filter((e) => e.domain === domainId);
}

/** Related entries resolved to records, in declared order. */
export function relatedEntries(entry: Entry): Entry[] {
  return entry.related.map((id) => entryById.get(id)).filter((e): e is Entry => !!e);
}

/**
 * The next things worth reading after this entry.
 *
 * `related` is the graph. There is nothing clever here yet — when a
 * `layer`-ordered path lands, this is where it plugs in.
 */
export function learnNext(entry: Entry): Entry[] {
  return relatedEntries(entry).filter((e) => e.id !== entry.id).slice(0, 4);
}

export const TYPE_LABELS: Record<string, string> = {
  term: 'Term',
  framework: 'Framework',
  principle: 'Principle',
  process: 'Process',
  playbook: 'Playbook',
  case: 'Case',
  quote: 'Quote',
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Intro',
  2: 'Core',
  3: 'Operator',
  4: 'Advanced',
};
