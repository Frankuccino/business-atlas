# Business Atlas — Data Model

Status: proposed, not yet implemented

## Two aggregates

```
content/                 <- repo, version-controlled, build-time validated
  entries/<domain>/<slug>.md
  sources/<slug>.md
  domains.ts

Postgres                 <- per-user, mutable, append-only where noted
  user_entry
  review
  session
```

## Content: Markdown + frontmatter

Frontmatter holds everything structured and short. The body holds prose.

    ---
    id: cogs
    type: term
    title: Cost of Goods Sold
    domain: finance
    one_line_definition: What you spend to produce the goods you sold.
    why_it_matters: It is the difference between revenue and gross margin.
    formula: COGS = beginning inventory + purchases - ending inventory
    how_to_read: "Lower is not always better — a rising COGS with flat pricing is margin compression."
    commonly_confused_with: [cogs-vs-opex]
    who_uses: [cfo, founder]
    related: [gross-margin, contribution-margin, inventory]
    sources: [the-personal-mba]
    tags: [accounting, inventory]
    difficulty: 2
    layer: 1
    status: reviewed
    ---

    Cost of goods sold is the cost of producing what you sold, and nothing else...

### Common fields (every type)

`id, type, title, domain, one_line_definition, why_it_matters, related[],
sources[], tags[], difficulty, layer, status`

### Type-specific fields

| Type | Extra frontmatter |
| --- | --- |
| `term` | `formula`, `how_to_read`, `commonly_confused_with[]`, `who_uses[]` |
| `framework` | `when_to_use`, `when_not_to_use`, `steps[]`, `limitations` |
| `principle` | `statement`, `evidence`, `failure_mode` |
| `process` | `steps[]`, `inputs[]`, `outputs[]`, `cadence` |
| `playbook` | `trigger`, `questions[]`, `numbers_to_pull[]`, `traps[]`, `who_to_consult[]` |
| `case` | `company`, `situation`, `decision`, `outcome`, `lesson`, `framework_ids[]` |
| `quote` | `text`, `speaker`, `work`, `year`, `verification`, `takeaway` |

Structured lists (`steps`, `questions`, `traps`) stay in frontmatter because the
UI renders them as checklists. Prose stays in the body.

### Sources

    ---
    id: the-personal-mba
    kind: book
    title: The Personal MBA
    author: Josh Kaufman
    year: 2010
    core_idea: Business is value creation plus value capture.
    frameworks: [value-equation, mental-models, focus]
    entries: [cogs, gross-margin, contribution-margin]
    ---

### Domains

`domains.ts` is the taxonomy: 14 domains, each with `id, name, blurb, position`.
Domains are labels and groupings, not containers — an entry belongs to exactly
one, and the `related` edges cross domains freely.

## User state

```sql
-- One row per user, per entry. The unit of scheduling.
create table user_entry (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  entry_id         text not null,
  mastery          text not null default 'unseen', -- unseen|seen|can_explain|can_apply
  interval_days    smallint not null default 1,
  due_at           timestamptz not null,
  last_reviewed_at timestamptz,
  notes            text not null default '',
  created_at       timestamptz not null default now(),
  unique (user_id, entry_id)
);

-- Append-only. Never update a row; insert a new one.
create table review (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  entry_id     text not null,
  kind         text not null,       -- recall | apply | explain_back
  quality      smallint not null,   -- 0..5
  prompt       text not null,
  answer       text,
  reviewed_at  timestamptz not null default now()
);

create index on review (user_id, reviewed_at desc);

-- A generated session. What was queued, and whether it was finished.
create table session (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  entry_ids    text[] not null,
  quote_id     text,
  completed_at timestamptz
);
```

## Why `review` is append-only

A spaced-repetition algorithm is only debuggable if you can replay your own
history. Mutating rows destroys the evidence. Same rule as Platform Atlas.

## Why `session` has no unique date

The daily cap is a property of the generator — how many items it may contain —
not a constraint on how many sessions you can run. A unique `(user_id, date)`
would make a second session in one day impossible, which is not something you
want to forbid.

## Why `mastery` is text, not a Postgres enum

The set is small and stable. A `text` column validated in the application layer
means adding a value is a code change, not a migration. If the set ever grows,
promote it to an enum then.

## Layers

`layer` (1–4) is a field on the entry, not a table. A layer is an ordered
checklist of entries; the order comes from the layer number plus the entry's
position within its domain. If layers ever need per-user state, that becomes a
table — nothing in v1 needs it.

## What is deliberately not here

- No `mastery_level` on the entry. That is user state.
- No `last_reviewed` on the entry. Same.
- No `author` on the entry. Attribution lives on the source.
- No `created_at` on the entry. Git history is the timestamp.
