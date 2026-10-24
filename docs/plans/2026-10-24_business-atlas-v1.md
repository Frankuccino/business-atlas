# Business Atlas v1 Implementation Plan

> **For Hermes:** execute task-by-task with subagent-driven-development.

**Goal:** Ship a working v1 — content loader, glossary, entry pages, map, daily
session with spaced repetition, playbooks, and progress tracking.

**Architecture:** Content is Markdown + frontmatter in the repo, validated at
build time into a typed manifest. The API (Express + Drizzle + Neon Postgres)
serves the manifest and owns all user state. The web app (React + TS + Vite)
renders it. Auth mirrors Platform Atlas: refresh-cookie, httpOnly, server-side
session.

**Tech Stack:** React 19, TypeScript, Vite, Express, Drizzle ORM, Neon Postgres,
zod, vitest, d3-zoom.

---

## Repo layout

```
business-atlas/
  package.json              # npm workspaces: packages/*
  content/
    domains.ts
    entries/<domain>/<slug>.md
    sources/<slug>.md
  scripts/
    build-content.ts        # validate + emit typed manifest
    validate-content.ts     # the validator itself
  packages/
    api/
      src/
        index.ts
        db/{index.ts,schema.ts}
        auth/{session.ts,routes.ts}
        content/{manifest.ts,loader.ts}
        scheduler/{intervals.ts,session.ts}
        routes/{entries.ts,session.ts,progress.ts,playbooks.ts}
    web/
      src/
        main.tsx, App.tsx
        api/client.ts
        pages/{Home,Domain,Entry,Map,Session,Playbooks,Progress}.tsx
        components/{DomainNav,EntryCard,RelatedPanel,MapView}.tsx
```

Content is served by the API, not bundled into the web app. The web fetches the
manifest once and searches client-side.

---

## Phase 0 — Scaffold

### Task 1: Create the monorepo

**Objective:** Root workspace with two packages and shared scripts.

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `packages/api/package.json`
- Create: `packages/web/package.json`

**Step 1: Root package.json**

```json
{
  "name": "business-atlas",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build:content": "tsx scripts/build-content.ts",
    "validate:content": "tsx scripts/validate-content.ts",
    "dev": "concurrently \"npm:dev:api\" \"npm:dev:web\"",
    "dev:api": "npm run dev -w packages/api",
    "dev:web": "npm run dev -w packages/web"
  },
  "devDependencies": {
    "concurrently": "^9.1.0",
    "tsx": "^4.23.15",
    "typescript": "^5.8.3"
  }
}
```

**Step 2: Verify**

Run: `npm install`
Expected: installs, no errors.

**Step 3: Commit**

```bash
git init
git add package.json .gitignore packages
git commit -m "chore: scaffold business-atlas monorepo"
```

---

### Task 2: Add the API package

**Objective:** Express + TypeScript + Drizzle + zod + vitest, with a health route.

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`

**Step 1: package.json**

```json
{
  "name": "@business-atlas/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "drizzle-orm": "^0.44.2",
    "express": "^4.21.2",
    "postgres": "^3.4.5",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "drizzle-kit": "^0.31.1",
    "tsx": "^4.23.15",
    "typescript": "^5.8.3",
    "vitest": "^3.0.5"
  }
}
```

**Step 2: Health route**

    import express from 'express';

    const app = express();
    app.get('/health', (_req, res) => res.json({ ok: true }));

    const port = process.env.PORT ?? 3001;
    app.listen(port, () => console.log(`api on :${port}`));

**Step 3: Verify**

Run: `npm run dev -w packages/api` then `curl localhost:3001/health`
Expected: `{"ok":true}`

**Step 4: Commit**

```bash
git add packages/api
git commit -m "feat(api): scaffold express server with health route"
```

---

## Phase 1 — Content

### Task 3: Define the content schema with zod

**Objective:** One schema per entry type, plus source and domain.

**Files:**
- Create: `packages/api/src/content/schema.ts`
- Test: `packages/api/src/content/schema.test.ts`

**Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { entrySchema } from './schema';

describe('entrySchema', () => {
  it('accepts a minimal term', () => {
    const result = entrySchema.safeParse({
      id: 'cogs', type: 'term', title: 'Cost of Goods Sold',
      domain: 'finance', one_line_definition: 'x', why_it_matters: 'y',
      related: [], sources: [], tags: [], difficulty: 2, layer: 1,
      status: 'reviewed',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a quote with no speaker', () => {
    const result = entrySchema.safeParse({
      id: 'q1', type: 'quote', title: 'q', domain: 'strategy',
      one_line_definition: 'x', why_it_matters: 'y',
      related: [], sources: [], tags: [], difficulty: 1, layer: 1,
      status: 'reviewed', text: 't', work: 'w', year: 1911,
      verification: 'verified', takeaway: 't',
    });
    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run to verify failure**

Run: `npm test -w packages/api`
Expected: FAIL — module not found.

**Step 3: Implement**

Use a discriminated union on `type`. Common fields in a base schema, type
specifics in per-type extras, merged with `.and()` or a union of extended
objects. `quoteSchema` requires `speaker`, `work`, `year`, `verification`.

**Step 4: Run to verify pass**

Run: `npm test -w packages/api`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/api/src/content
git commit -m "feat(content): add zod schema for entries, sources, domains"
```

---

### Task 4: Write the validator

**Objective:** Cross-entry invariants: resolvable ids, symmetric `related`,
quote attribution, difficulty range.

**Files:**
- Create: `scripts/validate-content.ts`
- Test: `scripts/validate-content.test.ts`

**Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { validateCatalog } from './validate-content';

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'a', type: 'term', title: 'A', domain: 'finance',
  one_line_definition: 'x', why_it_matters: 'y',
  related: [], sources: [], tags: [], difficulty: 1, layer: 1,
  status: 'reviewed', ...over,
});

describe('validateCatalog', () => {
  it('accepts two entries that link to each other', () => {
    const errors = validateCatalog([
      entry({ id: 'a', related: ['b'] }),
      entry({ id: 'b', related: ['a'] }),
    ]);
    expect(errors).toEqual([]);
  });

  it('rejects a one-sided related link', () => {
    const errors = validateCatalog([
      entry({ id: 'a', related: ['b'] }),
      entry({ id: 'b', related: [] }),
    ]);
    expect(errors.some((e) => e.includes('symmetry'))).toBe(true);
  });

  it('rejects a dangling related id', () => {
    const errors = validateCatalog([entry({ id: 'a', related: ['zzz'] })]);
    expect(errors.some((e) => e.includes('unknown id'))).toBe(true);
  });

  it('flags more than 10 related links', () => {
    const many = Array.from({ length: 11 }, (_, i) => `e${i}`);
    const errors = validateCatalog([
      entry({ id: 'a', related: many }),
      ...many.map((id) => entry({ id, related: ['a'] })),
    ]);
    expect(errors.some((e) => e.includes('too many'))).toBe(true);
  });
});
```

**Step 2: Run to verify failure**

Run: `npm test -w packages/api`
Expected: FAIL — module not found.

**Step 3: Implement**

`validateCatalog(entries, sources, domains): string[]` — pure, returns human
readable errors. Also export `validateEntry(entry, ctx)` for the build script.

**Step 4: Run to verify pass**

Run: `npm test -w packages/api`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/validate-content.ts scripts/validate-content.test.ts
git commit -m "feat(content): add catalog validator with symmetry checks"
```

---

### Task 5: Write the loader and build script

**Objective:** Read markdown + frontmatter, validate, emit a typed manifest.

**Files:**
- Create: `packages/api/src/content/loader.ts`
- Create: `packages/api/src/content/manifest.ts` (generated, committed)
- Create: `scripts/build-content.ts`

**Step 1: Loader**

Walk `content/entries/**/*.md` and `content/sources/*.md`, parse frontmatter
with `gray-matter`, parse the body as markdown with `marked`. Return typed
objects. Throw on the first schema failure.

**Step 2: Build script**

```ts
import { build } from './loader';
import { validateCatalog } from './validate-content';

const { entries, sources, domains } = loadContent();
const errors = validateCatalog(entries, sources, domains);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
writeManifest(entries, sources, domains); // packages/api/src/content/manifest.ts
console.log(`manifest: ${entries.length} entries, ${sources.length} sources`);
```

**Step 3: Verify**

Run: `npm run build:content` with an empty `content/entries`
Expected: `manifest: 0 entries, 0 sources`, file written.

**Step 4: Commit**

```bash
git add packages/api/src/content scripts/build-content.ts
git commit -m "feat(content): add markdown loader and manifest build"
```

---

### Task 6: Seed the taxonomy and first entries

**Objective:** 14 domains in `content/domains.ts`, and 5 real entries.

**Files:**
- Create: `content/domains.ts`
- Create: `content/entries/finance/cogs.md`
- Create: `content/entries/finance/gross-margin.md`
- Create: `content/entries/unit-economics/contribution-margin.md`
- Create: `content/entries/unit-economics/cac.md`
- Create: `content/entries/unit-economics/roas.md`
- Create: `content/sources/the-personal-mba.md`

**Step 1: domains.ts**

14 domains from the brief, each `{ id, name, blurb, position }`.

**Step 2: Entries**

Each with a worked numeric example in the body. `roas.md` links to `cac.md`
and `contribution-margin.md`; both link back.

**Step 3: Verify**

Run: `npm run build:content`
Expected: `manifest: 5 entries, 1 sources`.

**Step 4: Commit**

```bash
git add content
git commit -m "feat(content): seed domains and five linked entries"
```

---

## Phase 2 — API

### Task 7: Content routes and search

**Objective:** `GET /api/entries`, `GET /api/entries/:id`, `GET /api/search?q=`.

**Files:**
- Create: `packages/api/src/routes/entries.ts`
- Modify: `packages/api/src/index.ts`
- Test: `packages/api/src/routes/entries.test.ts`

**Step 1: Search test**

Search must match titles, aliases, and body text. Assert that searching `COG`
finds `cogs` (acronym tolerance), and that results are ranked.

**Step 2: Implement**

Load the manifest at boot into memory. `/api/entries` returns all entries
(small enough to ship whole). `/api/search` does a case-insensitive substring
match over title, `id`, `tags`, and body.

**Step 3: Verify**

Run: `npm test -w packages/api`, then `curl localhost:3001/api/entries`
Expected: PASS, and the manifest count.

**Step 4: Commit**

```bash
git add packages/api/src/routes/entries.ts
git commit -m "feat(api): add entry and search routes"
```

---

### Task 8: Auth

**Objective:** Refresh-cookie auth, httpOnly, server-side session — mirror
Northstar.

**Files:**
- Create: `packages/api/src/auth/session.ts`
- Create: `packages/api/src/auth/routes.ts`
- Create: `packages/api/src/db/schema.ts` (auth tables)

**Step 1: Schema**

`user`, `session` tables. Reuse the Northstar pattern.

**Step 2: Session middleware**

`requireUser` reads the httpOnly refresh cookie, resolves the session row,
attaches the user to the request. Rotate the cookie on refresh.

**Step 3: Verify**

Register, log in, call an authed route, log out, call it again.
Expected: 200, 200, 200, 401.

**Step 4: Commit**

```bash
git add packages/api/src/auth packages/api/src/db/schema.ts
git commit -m "feat(api): add refresh-cookie auth"
```

---

### Task 9: Interval ladder (TDD)

**Objective:** Pure function mapping a review quality to the next `due_at`.

**Files:**
- Create: `packages/api/src/scheduler/intervals.ts`
- Test: `packages/api/src/scheduler/intervals.test.ts`

**Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { nextInterval } from './intervals';

describe('nextInterval', () => {
  it('re-queues an "again" today', () => {
    expect(nextInterval('again', new Date('2026-10-24T10:00:00Z')))
      .toEqual(new Date('2026-10-24T10:00:00Z'));
  });

  it('schedules "good" three days out', () => {
    expect(nextInterval('good', new Date('2026-10-24T10:00:00Z')))
      .toEqual(new Date('2026-10-27T10:00:00Z'));
  });

  it('schedules "mastered" 30 days out', () => {
    expect(nextInterval('mastered', new Date('2026-10-24T10:00:00Z')))
      .toEqual(new Date('2026-11-23T10:00:00Z'));
  });

  it('takes the previous interval into account for "mastered"', () => {
    expect(nextInterval('mastered', new Date('2026-10-24T10:00:00Z'), 30))
      .toEqual(new Date('2026-01-22T10:00:00Z')); // 90 days
  });
});
```

**Step 2: Run to verify failure**

Run: `npm test -w packages/api`
Expected: FAIL — module not found.

**Step 3: Implement**

Pure function, no I/O, no clock reads — takes `now` as an argument.

**Step 4: Run to verify pass**

Run: `npm test -w packages/api`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/api/src/scheduler/intervals.ts
git commit -m "feat(scheduler): add fixed interval ladder"
```

---

### Task 10: Session generator (TDD)

**Objective:** Deterministic session from persisted state.

**Files:**
- Create: `packages/api/src/scheduler/session.ts`
- Test: `packages/api/src/scheduler/session.test.ts`

**Step 1: Write failing test**

Assert:
- The same state produces the same session on repeated calls.
- New entries have no `user_entry` row and are always due.
- A `due_at` in the past is due; one in the future is not.
- The quote index is stable for a date and varies across dates.
- The session never exceeds 15 items.
- The server date is used, never a client-supplied one.

**Step 2: Run to verify failure**

Run: `npm test -w packages/api`
Expected: FAIL — module not found.

**Step 3: Implement**

    generateSession(state, now): { entryIds: string[]; quoteId: string | null }

Order by `due_at` ascending, then `entry_id`. 1 new term, 1 new
framework/principle, then due reviews. Quote index = `dayOfYear % quotes.length`.

**Step 4: Run to verify pass**

Run: `npm test -w packages/api`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/api/src/scheduler/session.ts
git commit -m "feat(scheduler): add deterministic session generator"
```

---

### Task 11: Session and progress routes

**Objective:** `POST /api/session`, `POST /api/session/:id/items/:entryId/review`,
`GET /api/progress`.

**Files:**
- Create: `packages/api/src/routes/session.ts`
- Create: `packages/api/src/routes/progress.ts`

**Step 1: Review route**

Body: `{ quality: 0..5 }`. Upsert `user_entry` with the new `due_at` from the
ladder, insert an append-only `review` row. Skipping sends `quality: 0` and
still advances.

**Step 2: Progress route**

Mastery counts per domain, streak, weak-spot list (items with the most
`quality <= 1` reviews).

**Step 3: Verify**

Run the route tests against a real Postgres (or a test container). Assert a
review advances `due_at` and inserts exactly one `review` row.

**Step 4: Commit**

```bash
git add packages/api/src/routes/session.ts packages/api/src/routes/progress.ts
git commit -m "feat(api): add session, review, and progress routes"
```

---

## Phase 3 — Web

### Task 12: Web scaffold and router

**Files:**
- Create: `packages/web/package.json`, `index.html`, `vite.config.ts`
- Create: `packages/web/src/main.tsx`, `App.tsx`, `api/client.ts`

**Step 1: Verify**

Run: `npm run dev -w packages/web`
Expected: blank app on :5173, proxying `/api` to :3001.

**Step 2: Commit**

```bash
git add packages/web
git commit -m "feat(web): scaffold react app with api proxy"
```

---

### Task 13: Glossary and domain pages

**Files:**
- Create: `packages/web/src/pages/Home.tsx`, `Domain.tsx`
- Create: `packages/web/src/components/DomainNav.tsx`, `EntryCard.tsx`

**Step 1: Verify**

Run: `npm run build -w packages/web`
Expected: builds, no type errors. Home shows all 5 entries grouped by domain.

**Step 2: Commit**

```bash
git add packages/web/src/pages/Home.tsx packages/web/src/pages/Domain.tsx
git commit -m "feat(web): add glossary and domain pages"
```

---

### Task 14: Entry page and related panel

**Files:**
- Create: `packages/web/src/pages/Entry.tsx`
- Create: `packages/web/src/components/RelatedPanel.tsx`

**Step 1: Verify**

Run: `npm run build -w packages/web`
Expected: `/entries/roas` renders its formula, worked example, related links.

**Step 2: Commit**

```bash
git add packages/web/src/pages/Entry.tsx packages/web/src/components/RelatedPanel.tsx
git commit -m "feat(web): add entry page with related graph panel"
```

---

### Task 15: Global search

**Files:**
- Create: `packages/web/src/components/SearchBox.tsx`
- Modify: `packages/web/src/App.tsx`

**Step 1: Verify**

Type `COG` → `cogs` appears. Type `roas` → `roas` appears first.

**Step 2: Commit**

```bash
git add packages/web/src/components/SearchBox.tsx
git commit -m "feat(web): add instant global search"
```

---

### Task 16: Map view

**Files:**
- Create: `packages/web/src/pages/Map.tsx`
- Create: `packages/web/src/components/MapView.tsx`

**Step 1: Verify**

Run: `npm run build -w packages/web`
Expected: builds. Five domain regions render; `related` edges draw on top.

**Step 2: Commit**

```bash
git add packages/web/src/pages/Map.tsx packages/web/src/components/MapView.tsx
git commit -m "feat(web): add domain-grouped map view"
```

---

### Task 17: Daily session UI

**Files:**
- Create: `packages/web/src/pages/Session.tsx`
- Create: `packages/web/src/components/ReviewCard.tsx`

**Step 1: Verify**

Run: `npm run build -w packages/web`
Expected: builds. Session page shows the generated list, review card flips,
answer reveal works.

**Step 2: Commit**

```bash
git add packages/web/src/pages/Session.tsx packages/web/src/components/ReviewCard.tsx
git commit -m "feat(web): add daily session and review card"
```

---

### Task 18: Playbooks

**Files:**
- Create: `packages/web/src/pages/Playbooks.tsx`
- Create: `packages/api/src/routes/playbooks.ts`

**Step 1: Verify**

Run: `npm run build:content && npm run build -w packages/web`
Expected: builds. Playbooks are searchable by `trigger`.

**Step 2: Commit**

```bash
git add packages/web/src/pages/Playbooks.tsx packages/api/src/routes/playbooks.ts
git commit -m "feat: add playbook library"
```

---

### Task 19: Progress page and import/export

**Files:**
- Create: `packages/web/src/pages/Progress.tsx`
- Create: `packages/api/src/routes/export.ts`

**Step 1: Verify**

Run: `npm run build -w packages/web`
Expected: builds. Export downloads a JSON file; import restores it.

**Step 2: Commit**

```bash
git add packages/web/src/pages/Progress.tsx packages/api/src/routes/export.ts
git commit -m "feat: add progress page and json import/export"
```

---

## Phase 4 — Content and deploy

### Task 20: Seed 25–30 entries

**Files:**
- Create: `content/entries/**/*.md` (bulk)

**Step 1: Verify**

Run: `npm run build:content`
Expected: 25–30 entries, 0 validator errors, every `related` symmetric.

**Step 2: Commit**

```bash
git add content
git commit -m "feat(content): seed 25 linked entries across five domains"
```

---

### Task 21: Deploy

**Files:**
- Create: `packages/api/vercel.json`, `packages/web/vercel.json`
- Modify: `docs/README.md`

**Step 1: Verify**

Run: `npm run build`
Expected: builds clean.

**Step 2: Commit**

```bash
git add packages/api/vercel.json packages/web/vercel.json docs
git commit -m "chore: add vercel config and update docs"
```

---

## Sequencing

Tasks 1–2 must come first. 3–6 are content and can run while 7–11 (API) is
being built. 12 depends on 7. 13–19 depend on 12. 20 can happen at any point.
21 is last.

## Risks

- **`related` symmetry is tedious to author by hand.** Consider a helper script
  that adds the back-link when you add a link, or accept the validator error as
  the prompt to fix it.
- **Seeding 25 entries is the real time cost.** Two or three a day alongside
  the study loop is the plan; do not try to write them all in one sitting.
- **Auth is copied from Northstar.** Do not redesign it — the point is that a
  working pattern exists and should be reused.

## Open questions

- Full graph view in v1, or only the per-entry related panel?
- Mobile layout target?
- Project name: `business-atlas` for now.
