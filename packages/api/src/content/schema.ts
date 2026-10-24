import { z } from 'zod';

/**
 * Content types. This file is the single source of truth for the shape of the
 * catalog. It is imported by the API (which serves the manifest) and by the
 * build scripts (which generate it), so a schema change shows up in both.
 */

export const ENTRY_TYPES = [
  'term',
  'framework',
  'principle',
  'process',
  'playbook',
  'case',
  'quote',
] as const;

export type EntryType = (typeof ENTRY_TYPES)[number];

export const ENTRY_STATUSES = ['draft', 'reviewed'] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const QUOTE_VERIFICATIONS = ['verified', 'unverified', 'misattributed-risk'] as const;
export type QuoteVerification = (typeof QUOTE_VERIFICATIONS)[number];

export const SOURCE_KINDS = ['book', 'author', 'figure'] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

/** Fields every entry shares. `body` is the markdown, injected by the loader. */
const baseEntry = {
  id: z.string().min(1),
  title: z.string().min(1),
  domain: z.string().min(1),
  one_line_definition: z.string().min(1),
  why_it_matters: z.string().min(1),
  body: z.string().default(''),
  related: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  difficulty: z.number().int().min(1).max(4),
  layer: z.number().int().min(1).max(4),
  status: z.enum(ENTRY_STATUSES),
};

const termSchema = z.object({
  ...baseEntry,
  type: z.literal('term'),
  formula: z.string().optional(),
  how_to_read: z.string().optional(),
  commonly_confused_with: z.array(z.string()).default([]),
  who_uses: z.array(z.string()).default([]),
});

const frameworkSchema = z.object({
  ...baseEntry,
  type: z.literal('framework'),
  when_to_use: z.string().optional(),
  when_not_to_use: z.string().optional(),
  steps: z.array(z.string()).default([]),
  limitations: z.string().optional(),
});

const principleSchema = z.object({
  ...baseEntry,
  type: z.literal('principle'),
  statement: z.string().optional(),
  evidence: z.string().optional(),
  failure_mode: z.string().optional(),
});

const processSchema = z.object({
  ...baseEntry,
  type: z.literal('process'),
  steps: z.array(z.string()).default([]),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  cadence: z.string().optional(),
});

const playbookSchema = z.object({
  ...baseEntry,
  type: z.literal('playbook'),
  trigger: z.string().min(1),
  questions: z.array(z.string()).default([]),
  numbers_to_pull: z.array(z.string()).default([]),
  traps: z.array(z.string()).default([]),
  who_to_consult: z.array(z.string()).default([]),
});

const caseSchema = z.object({
  ...baseEntry,
  type: z.literal('case'),
  company: z.string().min(1),
  situation: z.string().min(1),
  decision: z.string().min(1),
  outcome: z.string().min(1),
  lesson: z.string().min(1),
  framework_ids: z.array(z.string()).default([]),
});

const quoteSchema = z.object({
  ...baseEntry,
  type: z.literal('quote'),
  text: z.string().min(1),
  speaker: z.string().min(1),
  work: z.string().min(1),
  year: z.number().int().optional(),
  verification: z.enum(QUOTE_VERIFICATIONS),
  takeaway: z.string().min(1),
});

export const entrySchema = z.discriminatedUnion('type', [
  termSchema,
  frameworkSchema,
  principleSchema,
  processSchema,
  playbookSchema,
  caseSchema,
  quoteSchema,
]);

export type Entry = z.infer<typeof entrySchema>;

export const sourceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(SOURCE_KINDS),
  title: z.string().min(1),
  author: z.string().optional(),
  year: z.number().int().optional(),
  core_idea: z.string().optional(),
  frameworks: z.array(z.string()).default([]),
  entries: z.array(z.string()).default([]),
});

export type Source = z.infer<typeof sourceSchema>;

export const domainSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  blurb: z.string().min(1),
  position: z.number().int().min(1),
});

export type Domain = z.infer<typeof domainSchema>;

export const catalogSchema = z.object({
  entries: z.array(entrySchema),
  sources: z.array(sourceSchema),
  domains: z.array(domainSchema),
});

export type Catalog = z.infer<typeof catalogSchema>;
