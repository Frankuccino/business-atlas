import cors from 'cors';

/**
 * CORS for a cross-origin deployment.
 *
 * The web app is on Vercel and the API is on Render, so every request is
 * cross-origin and the browser enforces CORS. Two things make this fragile:
 *
 * 1. `credentials: 'include'` is required for the refresh cookie to be sent.
 *    But `Access-Control-Allow-Origin: *` is INVALID alongside credentials —
 *    the browser rejects the response. So the origin must be an exact match,
 *    never a wildcard.
 *
 * 2. A raw string `origin` in the `cors` options matches exactly one origin.
 *    That breaks the moment you add localhost for development. Hence the
 *    allow-list below.
 *
 * The failure mode is silent from the server's side: the API responds 200 and
 * the browser throws. So this is written to be correct by construction rather
 * than by testing.
 */

const allowedOrigins = (process.env.CLIENT_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const corsOptions = cors({
  origin: (reqOrigin, callback) => {
    // No Origin header means a same-origin request, a curl, or Render's health
    // probe. Those are allowed — there is nothing to enforce.
    if (!reqOrigin) return callback(null, true);

    // An empty allow-list means the env var was not set. Allowing everything
    // here is the development fallback; in production CLIENT_URL is set and
    // this branch is never reached.
    if (allowedOrigins.length === 0) return callback(null, true);

    if (allowedOrigins.includes(reqOrigin)) return callback(null, true);

    callback(new Error(`CORS: origin ${reqOrigin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
