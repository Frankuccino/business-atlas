import { loadCatalog, REPO_ROOT } from '../packages/api/src/content/loader';
import { validateCatalog } from '../packages/api/src/content/validate';

/**
 * Check the content without generating anything. Useful as a pre-commit gate:
 * the build writes the manifest, this only reports problems.
 */
async function main(): Promise<void> {
  const catalog = await loadCatalog();
  const errors = validateCatalog(catalog);

  console.log(`checked ${catalog.entries.length} entries in ${REPO_ROOT}/content`);
  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s):\n`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log('no errors');
}

await main();
