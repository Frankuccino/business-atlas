import { describe, expect, it } from 'vitest';
import { closeGraph } from './graph';
import type { Entry } from './schema';

const entry = (id: string, related: string[] = []) =>
  ({
    id,
    type: 'term',
    title: id,
    domain: 'finance',
    one_line_definition: 'x',
    why_it_matters: 'y',
    body: '',
    related: [...related],
    sources: [],
    tags: [],
    difficulty: 1,
    layer: 1,
    status: 'draft',
  }) as unknown as Entry;

describe('closeGraph', () => {
  it('adds the reverse direction for a one-sided link', () => {
    const a = entry('a', ['b']);
    const b = entry('b', []);
    closeGraph([a, b]);
    expect(b.related).toContain('a');
  });

  it('is idempotent — a second pass changes nothing', () => {
    const a = entry('a', ['b']);
    const b = entry('b', ['a']);
    closeGraph([a, b]);
    const after = [...a.related].sort();
    closeGraph([a, b]);
    expect(a.related.slice().sort()).toEqual(after);
    expect(a.related.filter((r) => r === 'b')).toHaveLength(1);
  });

  it('does not duplicate an existing link', () => {
    const a = entry('a', ['b']);
    const b = entry('b', ['a']);
    closeGraph([a, b]);
    expect(a.related.filter((r) => r === 'b')).toHaveLength(1);
    expect(b.related.filter((r) => r === 'a')).toHaveLength(1);
  });

  it('leaves a dangling link alone rather than dropping it', () => {
    const a = entry('a', ['does-not-exist']);
    closeGraph([a]);
    expect(a.related).toEqual(['does-not-exist']);
  });

  it('closes a chain in one pass', () => {
    const a = entry('a', ['b']);
    const b = entry('b', ['c']);
    const c = entry('c', []);
    closeGraph([a, b, c]);
    expect(b.related).toContain('a');
    expect(c.related).toContain('b');
    // a does not link to c: the closure is one hop, not transitive.
    expect(a.related).not.toContain('c');
  });
});
