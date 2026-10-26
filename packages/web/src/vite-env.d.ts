/// <reference types="vite/client" />

/**
 * Environment variables the web app reads.
 *
 * Only `VITE_`-prefixed variables are exposed to the client bundle — Vite
 * inlines them at build time and everything else stays server-side. That is a
 * security property, not a convention: a secret without the prefix is simply
 * absent from the bundle, so it cannot leak.
 */
interface ImportMetaEnv {
  /**
   * The API base URL. Defaults to `/api` in development, where Vite proxies that
   * path to the local server. Must be set in production, where the web app is on
   * Vercel and the API is on Render.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
