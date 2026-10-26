import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer } from 'node:http';
import { once } from 'node:events';
import express from 'express';
import { entriesRouter } from './entries';
import { catalog } from '../content';

/**
 * The entries routes.
 *
 * Tested over real HTTP rather than by calling handlers directly. The earlier
 * approach — walking `router.stack` to find handlers — coupled the tests to
 * Express's internal layer shape, which is not part of its public API and does
 * not typecheck. A real request exercises the same code and asserts on what the
 * client actually receives.
 *
 * The router is mounted on a throwaway Express app on an ephemeral port. No
 * database is involved: these routes are read-only over the bundled catalog.
 */

const app = express();
app.use('/', entriesRouter);

const server = createServer(app);

/** Perform a request against the throwaway server. */
async function get(path: string): Promise<{ status: number; body: any }> {
  const port = (server.address() as any).port;
  const response = await fetch(`http://127.0.0.1:${port}${path}`);

  // A 404 body is JSON; anything else is too. Read it as JSON and fall back to
  // text so a non-JSON response surfaces as a failure rather than a parse error.
  const text = await response.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: response.status, body };
}

describe('GET /', () => {
  it('returns the catalog without entry bodies', async () => {
    const { status, body } = await get('/');

    expect(status).toBe(200);
    expect(body.entries).toHaveLength(catalog.entries.length);
    expect(body.domains).toEqual(catalog.domains);
    expect(body.sources).toEqual(catalog.sources);
  });

  it('strips the body from every entry', async () => {
    const { body } = await get('/');

    // The body is the bulk of each entry and is not needed for a listing. An
    // entry that leaks it means the strip is not applied uniformly.
    const withBody = catalog.entries.filter((e) => e.body.length > 0);
    expect(withBody.length).toBeGreaterThan(0);

    for (const entry of body.entries) {
      expect(entry).not.toHaveProperty('body');
    }
  });

  it('keeps the fields the client needs to render a card', async () => {
    const { body } = await get('/');
    const entry = body.entries[0];

    for (const field of ['id', 'title', 'domain', 'one_line_definition', 'type', 'difficulty']) {
      expect(entry, `missing ${field}`).toHaveProperty(field);
    }
  });
});

describe('GET /search', () => {
  it('returns an empty list for a blank query', async () => {
    const { body } = await get('/search?q=%20%20%20');
    expect(body).toEqual({ results: [] });
  });

  it('treats a missing query as blank', async () => {
    const { body } = await get('/search');
    expect(body).toEqual({ results: [] });
  });

  it('ranks an exact id match above a title match', async () => {
    const exact = catalog.entries[0]!;
    const { body } = await get(`/search?q=${encodeURIComponent(exact.id)}`);

    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].id).toBe(exact.id);
  });

  it('matches on a title substring', async () => {
    const entry = catalog.entries.find((e) => e.title.toLowerCase().includes('balance'));
    expect(entry, 'catalog has no balance entry').toBeDefined();

    const { body } = await get('/search?q=balance');
    const ids = body.results.map((r: any) => r.id);
    expect(ids).toContain(entry!.id);
  });

  it('is case-insensitive', async () => {
    const upper = await get('/search?q=BALANCE');
    const lower = await get('/search?q=balance');

    expect(upper.body.results.map((r: any) => r.id)).toEqual(
      lower.body.results.map((r: any) => r.id),
    );
  });

  it('caps the result list', async () => {
    const { body } = await get('/search?q=a');
    expect(body.results.length).toBeLessThanOrEqual(20);
  });

  it('strips bodies from results', async () => {
    const { body } = await get('/search?q=revenue');

    for (const entry of body.results) {
      expect(entry).not.toHaveProperty('body');
    }
  });
});

describe('GET /:id', () => {
  it('returns the full entry including its body', async () => {
    const entry = catalog.entries[0]!;
    const { status, body } = await get(`/${entry.id}`);

    expect(status).toBe(200);
    expect(body.id).toBe(entry.id);
    expect(body.body).toBe(entry.body);
  });

  it('returns 404 for an unknown id', async () => {
    const { status, body } = await get('/does-not-exist');

    expect(status).toBe(404);
    expect(body).toEqual({ error: 'not found' });
  });

  it('does not partial-match an id', async () => {
    // A substring of a real id must not resolve. `acv` is a prefix of `acv-arr`;
    // matching it would return the wrong entry for a typo.
    const { status } = await get('/acv');
    expect(status).toBe(404);
  });
});

// The server is started once for the file and closed after, so the test runner
// does not hang on an open handle.
let started = false;

beforeAll(async () => {
  if (started) return;
  server.listen(0);
  await once(server, 'listening');
  started = true;
});

afterAll(async () => {
  if (!started) return;
  server.close();
  await once(server, 'close');
});
