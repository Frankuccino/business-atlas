/**
 * Bundle the API for production.
 *
 * Lives inside packages/api, not at the repo root.
 *
 * Why that matters: Node resolves imports by walking up from the importing
 * file's own location. A script at the repo root looks for esbuild in
 * `node_modules` at the root, but esbuild is installed in
 * `packages/api/node_modules` because that is where it is declared. The import
 * failed with ERR_MODULE_NOT_FOUND even though esbuild was installed and
 * declared — the file was simply in the wrong tree.
 *
 * Why esbuild rather than `tsc`: the source uses extensionless relative imports,
 * which is correct under `moduleResolution: bundler` (what the typecheck uses)
 * but illegal under NodeNext, which is what Node needs to run ESM directly.
 * Adding `.js` to every import would mean two import styles in one codebase and
 * a typecheck that no longer matches what runs.
 *
 * Plain JavaScript, no tsx: this runs during `npm install` on the deploy target,
 * where devDependencies are not installed.
 *
 * External dependencies are not bundled — `node_modules` is installed on the
 * deploy target, and bundling `postgres` or `express` would break their
 * dynamic requires.
 */

import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
// packages/api/scripts/build-api.mjs -> packages/api
const pkgRoot = resolve(here, "..");
// packages/api -> repo root, where the content manifest lives
const repoRoot = resolve(pkgRoot, "..", "..");

await build({
  entryPoints: [resolve(pkgRoot, "src/index.ts")],
  outfile: resolve(pkgRoot, "dist/index.js"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  // The manifest is imported as JSON. esbuild inlines it, which is what we
  // want: the catalog must be present without a filesystem read at runtime.
  loader: { ".json": "json" },
  external: [
    "express",
    "cookie-parser",
    "cors",
    "jsonwebtoken",
    "postgres",
    "dotenv",
    "drizzle-orm",
    "drizzle-orm/postgres-js",
    "zod",
    "yaml",
  ],
  sourcemap: false,
  minify: false,
  logLevel: "info",
});

console.log("[build] api bundled to packages/api/dist/index.js");
