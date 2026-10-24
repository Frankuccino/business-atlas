import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadCatalog } from '../packages/api/src/content/loader';
import { validateCatalog } from '../packages/api/src/content/validate';

const REPO_ROOT = join(import.meta.dirname, '..');
const MANIFEST = join(REPO_ROOT, 'packages/api/src/content/manifest.json');

async function main(): Promise<void> {
  const catalog = await loadCatalog();
  const errors = validateCatalog(catalog);

  if (errors.length > 0) {
    console.error(`content validation failed with ${errors.length} error(s):\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  await mkdir(join(REPO_ROOT, 'packages/api/src/content'), { recursive: true });
  await writeFile(MANIFEST, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  console.log(
    `manifest written: ${catalog.entries.length} entries, ` +
      `${catalog.sources.length} sources, ${catalog.domains.length} domains`,
  );
}

await main();
