# Business Atlas — Design Doc

Status: proposed, not yet implemented
Last updated: 2026-10-24

## What this app is

Business Atlas is a personal map of business literacy plus a spaced-repetition
loop. Three jobs:

1. **Glossary** — what a term means, in one line and in plain language.
2. **Graph** — how concepts connect. ROAS links to CAC, LTV, contribution
   margin, attribution. The connections are the understanding.
3. **Judgment** — when you face a decision, which considerations matter.

Sibling of Platform Atlas: same catalog + graph + study-loop DNA, different
corpus. The corpus is business concepts instead of vendors.

## Decision 1: content and user state are separate aggregates

The brief listed `mastery_level` and `last_reviewed` as fields on the entry.
That conflates two things with different lifecycles.

- **Content** changes when you learn something or correct a mistake. It is
  version-controlled, reviewed, and shipped in the repo.
- **User state** changes every day you open the app. It is per-user, mutable,
  and lives in Postgres.

An entry has no mastery level until a user looks at it. Merging them means a
content edit is a migration over user data, and a state bug can corrupt the
catalog. Platform Atlas made this split; we keep it.

## Decision 2: markdown is the authoring format, the validator is the type system

Entries are long-form prose: `plain_explanation`, `worked_example`,
`common_mistakes`, `traps`. Writing those inside TypeScript template strings is
miserable and the escaping is a bug farm.

So content is Markdown + YAML frontmatter in the repo. The type safety comes
from a zod schema and a build-time validator, not from the language. The
validator is the enforcement point for every invariant: required fields,
resolvable ids, symmetric `related`, quote attribution.

The build emits a typed manifest the API serves. Same shape as Platform Atlas's
`extract-catalog.mjs` → `validate-catalog.ts` → typed module pipeline.

## Decision 3: the graph is the product, and it is laid out from structure

A force-layout graph of 200 concepts is a hairball. Platform Atlas reached the
same conclusion for 179 products: layout comes from the hierarchy, not a
simulation.

Here the hierarchy is `domain → entry`, and `related` edges are drawn on top.
Three zoom levels, one hierarchy — the Atlas map model, reused.

`related` is the most valuable and most dangerous field. A wrong link teaches
you something false. So:

- Entries hold **ids**, not titles. A rename updates one file.
- **The graph is the symmetric closure of declared links.** An entry declares
  the links it cares about; the loader adds the reverse direction at build time.
  Symmetry is a property of an undirected graph, and computing it is cheaper than
  asking every author to maintain it. The validator still checks that every link
  *resolves* — that is the error class an author can actually make.
- Capped at 6, flagged at 10. Sparse and curated beats dense and noisy.

## Decision 4: playbooks are v1, the decision journal is not

A playbook is a checklist: trigger, questions, numbers to pull, traps. It is
the highest value per authoring hour in the whole brief, and it is what makes
the app a decision tool rather than a glossary.

The decision journal needs a review loop — write a decision, revisit it in a
month — which is a second habit stacked on the first. Defer it. Same for the
coverage heatmap, which needs data volume you do not have yet.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Your primary study stack |
| Map | Canvas 2D + d3-zoom | Reused from Platform Atlas |
| Content | Markdown + frontmatter + zod | Authoring ergonomics for prose |
| Database | Neon Postgres (free) | No pausing, no time limit |
| ORM | Drizzle | You already use it in northstar-api |
| Auth | Refresh-cookie, httpOnly | You already built this for Northstar |
| Deployment | Vercel | Serverless, matches the DB decision |

## Enforcement points

| Invariant | Enforced where | Fails how |
| --- | --- | --- |
| Required fields per type | Build-time validator | Build fails |
| `related` ids resolve | Build-time validator | Build fails |
| `related` symmetry | Build-time validator | Build fails |
| `sources` ids resolve | Build-time validator | Build fails |
| Quote attribution + verification flag | Build-time validator | Build fails |
| Due-date math | Pure-function tests | Test fails |
| Session determinism | Pure-function tests | Test fails |
| Server date, never client date | API + tests | Test fails |

## Open items

- Project name (currently `business-atlas`)
- Does the map get a full graph view in v1, or only the per-entry related panel?
- The Personal MBA: how many of its concepts become entries, and who writes them?
- Mobile layout target
