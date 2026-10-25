/**
 * Apply the Drizzle migrations.
 *
 * Plain JavaScript, no TypeScript, no tsx — same reason as build-api.mjs: this
 * runs during `npm install` on the deploy target, where devDependencies are not
 * installed.
 *
 * Why this exists instead of `drizzle-kit push`: `push` needs an interactive TTY
 * to confirm destructive changes, and Render's free tier has no shell. So the
 * schema is applied by running the generated SQL files directly.
 *
 * Idempotent on two axes, because it runs on every deploy and a deploy step that
 * fails on the second run is a deploy step that will eventually fail:
 *
 *   1. `__drizzle_applied` records which files have run, so a re-run skips them.
 *   2. Duplicate-object errors are swallowed per statement, so a schema created
 *      by an earlier `drizzle-kit push` does not block the migration.
 */

import postgres from 'postgres';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

/**
 * The database URL.
 *
 * Read inside a function rather than at module scope so the guard narrows the
 * type. A module-level `if (!x) throw` does not narrow a `const` for the rest of
 * the module, and the un-narrowed `string | undefined` then fails at the call
 * site.
 */
function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Cannot apply migrations.');
  }
  return url;
}

/**
 * The migrations directory, anchored to the repo root.
 *
 * Not `process.cwd()`. npm runs a workspace script with cwd set to the workspace
 * directory (`packages/api`), so a cwd-relative path would look for
 * `packages/api/drizzle` and find nothing. Anchoring to this file's location
 * makes the script work from any cwd.
 */
function migrationsDir() {
  const fromEnv = process.env.MIGRATIONS_DIR;
  if (fromEnv) return fromEnv;

  const here = dirname(fileURLToPath(import.meta.url));
  // packages/api/src/db/migrate.mjs -> repo root
  return resolve(here, '../../../../drizzle');
}

async function main() {
  // SSL is required by managed Postgres (Render, Neon) and rejected by a local
  // one. Deciding from the hostname rather than from an env var means the same
  // command works locally and in production without a flag to remember.
  const url = requireDatabaseUrl();
  const needsSsl = url.includes('.render.com') || url.includes('neon.tech') || url.includes('supabase');

  const sql = postgres(url, { max: 1, ssl: needsSsl ? 'require' : false });

  try {
    // The tracking table. `IF NOT EXISTS` so the first run creates it.
    await sql`
      CREATE TABLE IF NOT EXISTS __drizzle_applied (
        id text PRIMARY KEY,
        applied_at timestamp DEFAULT now() NOT NULL
      )
    `;

    const appliedRows = await sql`SELECT id FROM __drizzle_applied`;
    const applied = new Set(appliedRows.map((r) => r.id));

    const dir = migrationsDir();
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('[db:migrate] no migration files found');
      return;
    }

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[db:migrate] skip ${file} (already applied)`);
        continue;
      }

      const statements = readFileSync(join(dir, file), 'utf8');

      // Drizzle emits `--> statement-breakpoint` between statements. Splitting on
      // it rather than on semicolons, because a semicolon can appear inside a
      // string literal or a function body.
      const parts = statements
        .split('--> statement-breakpoint')
        .map((s) => s.trim())
        .filter(Boolean)
        // Generated migrations use bare `CREATE TABLE`, which fails on a second
        // run. Rewriting to `IF NOT EXISTS` makes the runner idempotent.
        .map((s) => s.replace(/^CREATE TABLE (?!IF NOT EXISTS)/i, 'CREATE TABLE IF NOT EXISTS '))
        .map((s) => s.replace(/^CREATE INDEX (?!IF NOT EXISTS)/i, 'CREATE INDEX IF NOT EXISTS '))
        .map((s) => s.replace(/^CREATE UNIQUE INDEX (?!IF NOT EXISTS)/i, 'CREATE UNIQUE INDEX IF NOT EXISTS '));

      console.log(`[db:migrate] applying ${file} (${parts.length} statements)`);

      // Each statement runs in its own transaction.
      //
      // Not one transaction for the whole file. postgres.js aborts the entire
      // transaction on the first error, so a single "already exists" would roll
      // back every statement before it and the migration would never complete.
      // Per-statement transactions mean a duplicate is skipped without losing
      // the work already applied.
      //
      // "Already exists" errors are swallowed rather than fatal. This runs on
      // every deploy, and the realistic case is a schema created by an earlier
      // `drizzle-kit push` — the tables are there, the migration was never
      // recorded, and failing would block every subsequent deploy. A genuine
      // error (a syntax problem, a missing referenced table) still throws,
      // because its code is not one of the duplicate-object codes.
      const DUPLICATE_CODES = new Set(['42P07', '42710', '42P06', '42701', '42P16']);

      for (const statement of parts) {
        try {
          await sql.begin(async (tx) => {
            await tx.unsafe(statement);
          });
        } catch (err) {
          const code = err?.code;
          if (code && DUPLICATE_CODES.has(code)) {
            console.log(`[db:migrate]   skipped duplicate: ${statement.slice(0, 60)}…`);
            continue;
          }
          throw err;
        }
      }

      await sql`INSERT INTO __drizzle_applied (id) VALUES (${file})`;
    }

    console.log('[db:migrate] done');
  } finally {
    // End the pool explicitly. Without this the process hangs on Render's
    // build step, which has a timeout.
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('[db:migrate] failed:', err);
  process.exit(1);
});
