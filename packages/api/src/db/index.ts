import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * The database handle.
 *
 * `DATABASE_URL` is required rather than defaulted. A silent fallback to a
 * local socket would mean a misconfiguration connects to the wrong database
 * instead of failing loudly at boot.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. The API cannot boot without it.');
}

const sql = postgres(connectionString);

export const db = drizzle(sql, { schema });

export { schema };
