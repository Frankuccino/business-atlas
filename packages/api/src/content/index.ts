import raw from './manifest.json';
import { catalogSchema } from './schema';
import type { Catalog } from './schema';

/**
 * The generated manifest, validated at module load.
 *
 * Committed on purpose: a fresh clone should serve a catalog without running
 * the build. Validation happens here so a hand-edited manifest fails loudly at
 * boot rather than rendering as a missing page.
 */
export const catalog: Catalog = catalogSchema.parse(raw);
