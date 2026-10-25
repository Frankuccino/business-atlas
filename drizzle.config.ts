import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config.
 *
 * Reads DATABASE_URL from the environment rather than hardcoding it. The
 * connection string is a secret and belongs in .env, not in a committed file.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './packages/api/src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
