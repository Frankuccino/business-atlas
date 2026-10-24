import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { closeGraph } from './graph';
import { catalogSchema, entrySchema, sourceSchema } from './schema';
import type { Catalog, Entry, Source } from './schema';

/**
 * Repo root, resolved from packages/api/src/content/. Four levels up:
 * content -> src -> api -> packages -> root.
 */
export const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
export const CONTENT_DIR = join(REPO_ROOT, 'content');

export class ContentError extends Error {
  constructor(path: string, detail: string) {
    super(`${relative(REPO_ROOT, path)}: ${detail}`);
    this.name = 'ContentError';
  }
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/**
 * Split a markdown file into frontmatter and body.
 *
 * Deliberately small. A full markdown parser would drag in a dependency for ten
 * lines of work, and frontmatter is the only thing we need to interpret: the
 * body is shipped verbatim and rendered by the client.
 */
export function splitFrontmatter(raw: string): { data: unknown; body: string } {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return { data: {}, body: raw.trim() };

  const yamlText = match[1] ?? '';
  let data: unknown = {};
  if (yamlText.trim().length > 0) {
    data = parseYaml(yamlText) ?? {};
  }
  return { data, body: raw.slice(match[0].length).trim() };
}

async function markdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    if (dirent.isDirectory()) {
      files.push(...(await markdownFiles(join(dir, dirent.name))));
    } else if (dirent.name.endsWith('.md')) {
      files.push(join(dir, dirent.name));
    }
  }
  return files.sort();
}

async function readEntries(): Promise<Entry[]> {
  const dir = join(CONTENT_DIR, 'entries');
  const entries: Entry[] = [];

  for (const file of await markdownFiles(dir)) {
    const raw = await readFile(file, 'utf8');
    const { data, body } = splitFrontmatter(raw);

    // The body is injected here rather than declared in frontmatter, so an
    // author can never shadow it by accident.
    const parsed = entrySchema.safeParse({ ...(data as object), body });
    if (!parsed.success) {
      throw new ContentError(file, parsed.error.issues.map((i) => i.message).join('; '));
    }
    entries.push(parsed.data);
  }

  // The graph is undirected. An entry declares the links it cares about; the
  // manifest carries the symmetric closure, so no author maintains both
  // directions of an edge. See closeGraph for why this is computed rather than
  // authored.
  closeGraph(entries);

  entries.sort((a, b) => a.id.localeCompare(b.id));
  return entries;
}

async function readSources(): Promise<Source[]> {
  const dir = join(CONTENT_DIR, 'sources');
  const sources: Source[] = [];

  for (const file of await markdownFiles(dir)) {
    const raw = await readFile(file, 'utf8');
    const { data } = splitFrontmatter(raw);

    const parsed = sourceSchema.safeParse(data);
    if (!parsed.success) {
      throw new ContentError(file, parsed.error.issues.map((i) => i.message).join('; '));
    }
    sources.push(parsed.data);
  }

  sources.sort((a, b) => a.id.localeCompare(b.id));
  return sources;
}

/**
 * Read and parse the whole catalog.
 *
 * Throws on the first malformed file. That is the right failure mode here: a
 * typo in one entry should fail the build, not render as an empty page.
 */
export async function loadCatalog(): Promise<Catalog> {
  const { domains } = await import('../../../../content/domains');

  const catalog = catalogSchema.parse({
    entries: await readEntries(),
    sources: await readSources(),
    domains,
  });

  return catalog;
}
