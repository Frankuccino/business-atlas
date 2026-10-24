# Business Atlas — Docs Index

Status: design phase, not yet scaffolded
Last updated: 2026-10-24

Business Atlas is a personal map of business literacy: the vocabulary, the
frameworks, and the decision checklists a self-taught engineer needs to reason
like an operator. Sibling of Platform Atlas — same catalog + graph + spaced
repetition DNA, different corpus.

## Docs

| Doc | What it covers |
| --- | --- |
| [design.md](design.md) | The four decisions that shape everything, stack, enforcement points |
| [data-model.md](data-model.md) | Content (markdown, version-controlled) vs. user state (Postgres) |
| [scheduler.md](scheduler.md) | Rolling queue, daily cap, intervals, determinism |
| [features.md](features.md) | Confirmed v1 scope, deferred, non-goals |
| [brief.md](brief.md) | The brief, revised with the decisions taken |
| [plans/](plans/) | Implementation plans |

## Quick facts

- Content: Markdown + frontmatter in the repo, zod-validated at build time
- User state: Neon Postgres, Drizzle, refresh-cookie auth (mirrors Platform Atlas)
- Frontend: React + TypeScript + Vite
- v1 domains: Finance & Accounting, Unit Economics & Metrics, Marketing &
  Growth, Strategy, Entrepreneurship & Capital
- First source: The Personal MBA

## Rejected options and why

| Option | Why not |
| --- | --- |
| Static-first + localStorage | You chose Postgres + auth; multi-device and backup come free |
| Catalog in TypeScript modules | Long-form prose is miserable in template strings; markdown is the medium |
| JSON or YAML data files | Weakest validation story; frontmatter + zod gives the same portability |
| SM-2 | Opaque, hard to defend in an interview; a fixed ladder is predictable |
| Fixed calendar day + streaks | Breaks on one missed day; a rolling queue with a daily cap is the same habit |
