# Business Atlas — Project Brief (v0.2)

Status: iterated once, 2026-10-24

## 1. Purpose

A personal, daily-use website that takes a self-taught engineer to MBA-level
business literacy: fluent in the vocabulary, able to reason with the standard
frameworks, and able to make decisions by knowing which considerations matter.
Sibling of Platform Atlas — same catalog + graph DNA, different corpus.

Success looks like:

- Hearing "ROAS dropped but CAC is flat and contribution margin improved" and
  knowing exactly what is being said and what to ask next.
- Facing a decision (pricing, hiring, a new channel, raising money) and pulling
  up the right checklist of considerations.
- Doing a 15–20 minute daily session that measurably compounds.

Non-goals: a public product, a course marketplace, social features.

## 2. Terminology

- **Term** — a single vocabulary item (ROAS, COGS, EBITDA, moat).
- **Framework** — a named structured way of thinking (Five Forces, JTBD).
- **Principle** — a durable rule of thumb (Pareto, Goodhart's Law).
- **Process** — a repeatable baseline procedure (budgeting, hiring loop).
- **Playbook** — a "when facing X, consider A, B, C, watch for trap D" checklist.
- **Domain** — a top-level area of business.
- **Source** — a book, author, or figure an entry or quote comes from.

## 3. Content model

Everything is an **Entry** with a type: `term | framework | principle | process |
playbook | case | quote`.

Frontmatter holds the structured fields; the markdown body holds prose. The
full schema is in [data-model.md](data-model.md).

Relationships matter more than pages: ROAS links to CAC, LTV, contribution
margin, attribution. The site makes this graph navigable.

## 4. Domain map

1. Foundations
2. Finance & Accounting
3. Unit Economics & Metrics
4. Marketing & Growth
5. Sales
6. Strategy
7. Operations & Supply Chain
8. Product & Innovation
9. People & Organization
10. Leadership & Decision Making
11. Legal, Risk & Governance
12. Entrepreneurship & Capital
13. Economics & Macro
14. Negotiation & Communication

**Growth weighting.** Built for high-growth ventures, so Unit Economics &
Metrics, Marketing & Growth, Sales, Strategy, and Entrepreneurship & Capital
get depth first. Foundations and Finance stay as the vocabulary base underneath.

## 5. Core features

- **Browse** — domain pages, A–Z glossary, type/difficulty filters, tag search,
  instant global search with acronyms.
- **Daily session** — 1 new term, 1 framework/principle, spaced-repetition
  review set, 1 quote tied to today's topic.
- **Spaced repetition** — flashcards and "explain it back" prompts, fixed ladder.
- **Apply-it drills** — short scenarios you answer before the explanation.
- **Decision playbooks** — searchable by situation.
- **Reading library** — per-book pages with chapters mapped to entries.
- **Progress** — mastery per entry, streak, weak-spot list.
- **Notebook** — notes attached to any entry, "my own examples".

## 6. Quotes, books, and figures

Quotes are first-class and linked to the concept they illustrate.

Content rules:

- Public-domain and clearly attributed sources are safest for verbatim text.
  Verify each work's status.
- For in-copyright books, store short attributed quotes only; the real value is
  your own-words summary.
- Every quote requires speaker, work, year, and a verification flag
  (`verified | unverified | misattributed-risk`).
- Each quote gets a plain-language takeaway you write yourself.

**Selection bar: high-growth and operator-grade only.**

Seed reading list:

- Offers, leads, money models (Hormozi) — $100M Offers, $100M Leads, $100M
  Money Models
- Foundations (anchor) — The Personal MBA (Kaufman)
- Strategy and moats — 7 Powers, Good Strategy Bad Strategy, Playing to Win,
  Competitive Strategy, Zero to One, The Innovator's Dilemma
- Growth and GTM — Traction, Crossing the Chasm, Founding Sales, Blitzscaling,
  The Mom Test, The Lean Startup
- Operating and scaling — High Output Management, Only the Paranoid Survive,
  The Hard Thing About Hard Things, Measure What Matters, The Goal
- Capital and deals — Venture Deals, Business Adventures
- Negotiation and persuasion — Never Split the Difference, Influence
- Founder-era primary sources (public domain) — My Life and Work (Ford),
  Carnegie and Franklin writings

## 7. Learning path

1. **Layer 1: Literacy** — P&L, balance sheet, cash flow, core metrics, funnel,
   unit economics.
2. **Layer 2: Reasoning** — strategy, pricing, positioning, operations,
   incentives.
3. **Layer 3: Judgment** — playbooks, cases, decision journal.
4. **Layer 4: Venture-readiness** — fundraising, cap tables, legal, hiring.

## 8. Technical direction

- Content as structured files in the repo, validated at build time.
- React + TypeScript + Vite frontend; Express + Drizzle + Neon Postgres API.
- Refresh-cookie auth, httpOnly, server-side session.
- Graph view from the `related[]` links.
- Import/export progress as JSON.
- Content validation script: broken links, missing fields, unverified quotes.
- Start with 25–30 high-quality entries, not 1000 shallow ones.

## 9. MVP scope (v1)

- Content schema and loader
- Glossary, domain browsing, search
- Entry pages with related links
- Daily session (1 term, 1 framework, review cards, 1 quote)
- Spaced repetition and mastery tracking
- 5 domains seeded first
- The Personal MBA mapped as the first source
- Playbooks library

Later: case-of-the-week, decision journal, sources and authors, coverage
heatmap, domain gate quizzes.

## 10. Authoring workflow

- Draft entries with an AI assistant, then verify each against a primary or
  authoritative source before marking `reviewed`.
- Every formula gets a worked numeric example.
- Mark entries `draft | reviewed` so you know what to trust.
- A few entries per day alongside the daily study loop.

## 11. Decisions taken (2026-10-24)

| Question | Decision |
| --- | --- |
| Where does study state live? | Neon Postgres + refresh-cookie auth, mirroring Platform Atlas |
| Content format? | Markdown + frontmatter, zod-validated |
| v1 scope? | Playbooks in; decision journal and heatmap deferred |
| Public later? | Design as if public, ship single-user |
| Pace? | Rolling queue with a daily cap, no fixed calendar day |
