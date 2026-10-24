import { describe, expect, it } from 'vitest';
import { entrySchema } from './schema';

const base = {
  id: 'cogs',
  title: 'Cost of Goods Sold',
  domain: 'finance',
  one_line_definition: 'What it costs to produce what you sold.',
  why_it_matters: 'It is the first deduction from revenue.',
  difficulty: 2,
  layer: 1,
  status: 'reviewed',
};

describe('entrySchema', () => {
  it('accepts a minimal term', () => {
    const result = entrySchema.safeParse({ ...base, type: 'term' });
    expect(result.success).toBe(true);
  });

  it('defaults the array fields so authors only write what they use', () => {
    const parsed = entrySchema.parse({ ...base, type: 'term' });
    expect(parsed.related).toEqual([]);
    expect(parsed.sources).toEqual([]);
    expect(parsed.tags).toEqual([]);
    expect(parsed.body).toBe('');
  });

  it('accepts a term with its type-specific fields', () => {
    const result = entrySchema.safeParse({
      ...base,
      type: 'term',
      formula: 'COGS = beginning inventory + purchases - ending inventory',
      commonly_confused_with: ['cogs-vs-opex'],
      who_uses: ['cfo'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a playbook with a trigger', () => {
    const result = entrySchema.safeParse({
      ...base,
      id: 'pb1',
      type: 'playbook',
      trigger: 'pricing a new product',
      questions: ['What does it cost to produce?'],
      traps: ['Anchoring on the competitor price.'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a playbook with no trigger', () => {
    const result = entrySchema.safeParse({ ...base, id: 'pb1', type: 'playbook' });
    expect(result.success).toBe(false);
  });

  it('rejects a quote with no speaker', () => {
    const result = entrySchema.safeParse({
      ...base,
      id: 'q1',
      type: 'quote',
      text: 'Focus is about saying no.',
      work: 'The Innovator’s Solution',
      year: 2003,
      verification: 'verified',
      takeaway: 'You cannot be everything to everyone.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown verification flag', () => {
    const result = entrySchema.safeParse({
      ...base,
      id: 'q1',
      type: 'quote',
      text: 't',
      speaker: 's',
      work: 'w',
      verification: 'totally-real',
      takeaway: 'a takeaway long enough to be useful',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown entry type', () => {
    const result = entrySchema.safeParse({ ...base, type: 'glurb' });
    expect(result.success).toBe(false);
  });

  it('rejects a difficulty outside 1..4', () => {
    const result = entrySchema.safeParse({ ...base, type: 'term', difficulty: 9 });
    expect(result.success).toBe(false);
  });

  it('rejects a missing one_line_definition', () => {
    const { one_line_definition: _drop, ...rest } = base;
    const result = entrySchema.safeParse({ ...rest, type: 'term' });
    expect(result.success).toBe(false);
  });
});
