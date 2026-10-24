import { describe, expect, it } from 'vitest';
import { validateCatalog } from './validate';
import type { Catalog } from './schema';

/**
 * The validator only reads, so the fixtures can be loose. They are cast at the
 * boundary rather than built field by field — the point of these tests is the
 * invariant, not the fixture.
 */
const entry = (over: Record<string, unknown> = {}) => ({
  id: 'a',
  type: 'term',
  title: 'A',
  domain: 'finance',
  one_line_definition: 'x',
  why_it_matters: 'y',
  body: '',
  related: [],
  sources: [],
  tags: [],
  commonly_confused_with: [],
  difficulty: 1,
  layer: 1,
  status: 'reviewed',
  ...over,
});

/** A one-domain catalog, so tests stay about the invariant under test. */
const catalog = (entries: object[]): Catalog => ({
  entries: entries as Catalog['entries'],
  sources: [],
  domains: [{ id: 'finance', name: 'Finance', blurb: 'b', position: 1 }],
});

describe('validateCatalog', () => {
  it('accepts two entries that link to each other', () => {
    const errors = validateCatalog(
      catalog([entry({ id: 'a', related: ['b'] }), entry({ id: 'b', related: ['a'] })]),
    );
    expect(errors).toEqual([]);
  });

  it('rejects a one-sided related link', () => {
    const errors = validateCatalog(
      catalog([entry({ id: 'a', related: ['b'] }), entry({ id: 'b', related: [] })]),
    );
    expect(errors.some((e) => e.includes('symmetry'))).toBe(true);
  });

  it('rejects a dangling related id', () => {
    const errors = validateCatalog(catalog([entry({ id: 'a', related: ['zzz'] })]));
    expect(errors.some((e) => e.includes('unknown id'))).toBe(true);
  });

  it('rejects a self-reference', () => {
    const errors = validateCatalog(catalog([entry({ id: 'a', related: ['a'] })]));
    expect(errors.some((e) => e.includes('itself'))).toBe(true);
  });

  it('flags more than 10 related links', () => {
    const many = Array.from({ length: 11 }, (_, i) => `e${i}`);
    const errors = validateCatalog(
      catalog([
        entry({ id: 'a', related: many }),
        ...many.map((id) => entry({ id, related: ['a'] })),
      ]),
    );
    expect(errors.some((e) => e.includes('too many'))).toBe(true);
  });

  it('rejects a duplicate entry id', () => {
    const errors = validateCatalog(catalog([entry({ id: 'a' }), entry({ id: 'a' })]));
    expect(errors.some((e) => e.includes('duplicate'))).toBe(true);
  });

  it('rejects an unknown domain', () => {
    const errors = validateCatalog(catalog([entry({ id: 'a', domain: 'nope' })]));
    expect(errors.some((e) => e.includes('unknown domain'))).toBe(true);
  });

  it('rejects a dangling source reference', () => {
    const errors = validateCatalog(catalog([entry({ id: 'a', sources: ['no-such-book'] })]));
    expect(errors.some((e) => e.includes('unknown id'))).toBe(true);
  });

  it('rejects duplicate domain positions', () => {
    const errors = validateCatalog({
      entries: [],
      sources: [],
      domains: [
        { id: 'a', name: 'A', blurb: 'b', position: 1 },
        { id: 'b', name: 'B', blurb: 'b', position: 1 },
      ],
    });
    expect(errors.some((e) => e.includes('position'))).toBe(true);
  });

  it('rejects a quote with a takeaway too thin to be useful', () => {
    const errors = validateCatalog(
      catalog([
        entry({
          id: 'q1',
          type: 'quote',
          text: 'Focus is about saying no.',
          speaker: 'Someone',
          work: 'Some Book',
          year: 2003,
          verification: 'verified',
          takeaway: 'short',
        }),
      ]),
    );
    expect(errors.some((e) => e.includes('too thin'))).toBe(true);
  });
});
