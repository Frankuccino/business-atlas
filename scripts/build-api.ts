import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

/**
 * Bundle the API for production.
 *
 * Why esbuild rather than `tsc`: the source uses extensionless relative imports,
 * which is correct under `moduleResolution: bundler` (what the typecheck uses)
 * but illegal under NodeNext, which is what Node needs to run ESM directly.
 * Adding `.js` to every import would mean two import styles in one codebase and
 * a typecheck that no longer matches what runs.
 *
 * Bundling sidesteps that: esbuild resolves the extensionless imports and emits
 * a single file Node can execute. The typecheck stays the authority on types;
 * esbuild is only the packaging step.
 *
 * External dependencies are not bundled — `node_modules` is installed on the
 * deploy target, and bundling `postgres` or `express` would break their
 * dynamic requires.
 *
 * Paths are resolved from this file, not from `process.cwd()`. npm runs a
 * workspace script with cwd set to the workspace directory, so a relative path
 * like `packages/api/src/index.ts` would resolve against `packages/api` and
 * fail. Anchoring to the repo root makes the script work from any cwd.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const isWatch = process.argv.includes('--watch');

await build({
  entryPoints: [resolve(repoRoot, 'packages/api/src/index.ts')],
  outfile: resolve(repoRoot, 'packages/api/dist/index.js'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  // The manifest is imported as JSON. esbuild inlines it, which is what we
  // want: the catalog must be present without a filesystem read at runtime.
  loader: { '.json': 'json' },
  external: [
    'express',
    'cookie-parser',
    'cors',
    'jsonwebtoken',
    'postgres',
    'dotenv',
    'drizzle-orm',
    'drizzle-orm/postgres-js',
    'zod',
    'yaml',
  ],
  sourcemap: false,
  minify: false,
  logLevel: 'info',
});

if (!isWatch) {
  console.log('[build] api bundled to packages/api/dist/index.js');
}
