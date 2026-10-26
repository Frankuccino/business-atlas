# Deployment

The API runs on Render's free tier; the web app runs on Vercel. Both are free.

## Services

| Piece | Where | URL |
| --- | --- | --- |
| Web | Vercel | https://businessliteracy.vercel.app |
| API | Render | https://business-atlas-backend.onrender.com |
| Database | Render Postgres | internal only |

## Render configuration

| Field | Value |
| --- | --- |
| Language | Node |
| Branch | main |
| Region | Singapore (Southeast Asia) |
| Root Directory | `packages/api` |
| Build Command | `npm install && npm run build && npm run db:migrate` |
| Start Command | `npm start` |
| Compute | Free |

### Environment variables

| Key | Value |
| --- | --- |
| `DATABASE_URL` | injected by Render when the Postgres instance is attached |
| `JWT_SECRET` | random 48 bytes, hex-encoded |
| `CLIENT_URL` | `https://businessliteracy.vercel.app` |
| `NODE_ENV` | `production` |

`DATABASE_URL` must not be set manually. Render injects it when the database is
attached, and a manual value collides with the injected one.

`CLIENT_URL` is the CORS allow-list. It must be the exact origin with no trailing
slash. If it is wrong, the API still returns 200 and the browser blocks the
response anyway, so a typo here looks like a server bug when it is not.

## Build pipeline

    npm install      installs packages/api dependencies
    npm run build    esbuild bundles src/index.ts to dist/index.js
    npm run db:migrate  applies drizzle/*.sql, idempotent

The bundle is built with esbuild rather than `tsc` because the source uses
extensionless relative imports, which is correct under
`moduleResolution: bundler` but illegal under NodeNext. Adding `.js` to every
import would mean two import styles in one codebase and a typecheck that no
longer matches what runs.

The migration runner is idempotent on two axes: a `__drizzle_applied` table
skips files that already ran, and duplicate-object errors are swallowed per
statement. It runs on every deploy, and a deploy step that fails on the second
run is a deploy step that will eventually fail.

## Rules that cost deploy cycles

Three failures, one root cause each time. All three are the same mistake:
assuming the deploy target looks like a local machine.

1. **`tsx` missing.** A build script must only use what production installs.
   Anything in `devDependencies` is invisible on the deploy target. Render
   installs with `NODE_ENV=production`, which omits them.

2. **`esbuild` missing.** It was only present transitively through Vite. A
   module a production script imports must be declared in `dependencies`, not
   merely present in `node_modules`. Transitive presence is an accident of what
   else is installed.

3. **Script in the wrong tree.** Node resolves imports by walking up from the
   importing file's location. A script at the repo root looks for dependencies
   in the root `node_modules`, not in `packages/api/node_modules`. Build scripts
   belong inside the package they build.

### The check that catches all three

Install with `--omit=dev` in a clean copy and run the build there:

    rsync -a --exclude node_modules --exclude dist --exclude .git \
      ./ /tmp/render-sim/
    cd /tmp/render-sim && NODE_ENV=production npm install --omit=dev
    cd packages/api && npm run build

Local success is not evidence about the deploy target.

## Verifying a deploy

    curl -s https://business-atlas-backend.onrender.com/health
    curl -s https://business-atlas-backend.onrender.com/api | head -c 100

    curl -s -o /dev/null -D - -X OPTIONS \
      https://business-atlas-backend.onrender.com/api/auth/login \
      -H "Origin: https://businessliteracy.vercel.app" \
      -H "Access-Control-Request-Method: POST" | grep -i access-control

The preflight must echo the exact origin and include
`access-control-allow-credentials: true`. A wildcard origin with credentials is
invalid and the browser rejects it.

## Known issue

The web app calls `/api` on its own origin, which Vercel's SPA rewrite catches
and returns HTML. It needs `VITE_API_URL` pointing at the Render URL. Until that
is set, auth, session, and progress work only against a local API.
