import type { Catalog } from './schema';

/** Above this, an entry is a hairball, not a graph. Flagged, not failed. */
export const MAX_RELATED = 10;

/**
 * Cross-entry invariants that the zod schema cannot express on its own,
 * because they need the whole catalog in scope.
 *
 * Returns human-readable errors. Empty array means the catalog is sound.
 * Pure: no I/O, no clock, same input always yields the same output.
 */
export function validateCatalog(catalog: Catalog): string[] {
  const errors: string[] = [];

  const entryIds = new Set(catalog.entries.map((e) => e.id));
  const sourceIds = new Set(catalog.sources.map((s) => s.id));
  const domainIds = new Set(catalog.domains.map((d) => d.id));

  // Duplicate ids. A duplicate is worse than a typo: it silently shadows.
  const seen = new Set<string>();
  for (const entry of catalog.entries) {
    if (seen.has(entry.id)) {
      errors.push(`${entry.id}: duplicate entry id`);
    }
    seen.add(entry.id);
  }

  for (const entry of catalog.entries) {
    if (!domainIds.has(entry.domain)) {
      errors.push(`${entry.id}: unknown domain '${entry.domain}'`);
    }

    if (entry.related.length > MAX_RELATED) {
      errors.push(
        `${entry.id}: too many related links (${entry.related.length} > ${MAX_RELATED})`,
      );
    }

    for (const target of entry.related) {
      if (target === entry.id) {
        errors.push(`${entry.id}: related references itself`);
      } else if (!entryIds.has(target)) {
        errors.push(`${entry.id}: related references unknown id '${target}'`);
      }
    }

    for (const source of entry.sources) {
      if (!sourceIds.has(source)) {
        errors.push(`${entry.id}: sources references unknown id '${source}'`);
      }
    }

    // Entry-typed reference fields, which differ per type. These are graph
    // edges, so a dangling one is a broken promise, same as `related`.
    if (entry.type === 'term') {
      for (const target of entry.commonly_confused_with) {
        if (!entryIds.has(target)) {
          errors.push(`${entry.id}: commonly_confused_with references unknown id '${target}'`);
        }
      }
    }

    if (entry.type === 'case') {
      for (const target of entry.framework_ids) {
        if (!entryIds.has(target)) {
          errors.push(`${entry.id}: framework_ids references unknown id '${target}'`);
        }
      }
    }

    if (entry.type === 'quote') {
      // The schema enforces presence; this catches a quote with no takeaway
      // in prose, which is the whole point of the feature.
      if (entry.takeaway.trim().length < 20) {
        errors.push(`${entry.id}: quote takeaway is too thin to be useful`);
      }
    }
  }

  // Symmetry. A one-sided link is a promise the graph does not keep.
  const relatedMap = new Map(
    catalog.entries.map((entry) => [entry.id, new Set(entry.related)]),
  );
  for (const entry of catalog.entries) {
    for (const target of entry.related) {
      if (!entryIds.has(target)) continue; // already reported above
      const back = relatedMap.get(target);
      if (!back?.has(entry.id)) {
        errors.push(
          `symmetry: ${entry.id} lists ${target}, but ${target} does not list ${entry.id}`,
        );
      }
    }
  }

  for (const source of catalog.sources) {
    for (const id of source.entries) {
      if (!entryIds.has(id)) {
        errors.push(`source ${source.id}: references unknown entry '${id}'`);
      }
    }
    for (const id of source.frameworks) {
      if (!entryIds.has(id)) {
        errors.push(`source ${source.id}: references unknown framework '${id}'`);
      }
    }
  }

  const positions = catalog.domains.map((d) => d.position);
  if (new Set(positions).size !== positions.length) {
    errors.push('domains: duplicate position values');
  }

  return errors;
}
