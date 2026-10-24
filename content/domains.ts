import type { Domain } from '../packages/api/src/content/schema';

/**
 * The taxonomy. Fourteen domains, ordered as the index presents them.
 *
 * Domains are labels, not containers: an entry belongs to exactly one, and the
 * `related` edges cross domains freely. The order here is display order, so it
 * is data, not a sort key derived from the ids.
 */
export const domains: Domain[] = [
  {
    id: 'foundations',
    name: 'Foundations',
    blurb: 'Value creation, value capture, markets, incentives, opportunity cost.',
    position: 1,
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    blurb: 'P&L, balance sheet, cash flow, margins, burn, runway, valuation.',
    position: 2,
  },
  {
    id: 'unit-economics',
    name: 'Unit Economics & Metrics',
    blurb: 'CAC, LTV, payback, churn, contribution margin, ROAS, cohorts.',
    position: 3,
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    blurb: 'Positioning, segmentation, funnel, channels, brand, pricing, PMF.',
    position: 4,
  },
  {
    id: 'sales',
    name: 'Sales',
    blurb: 'Pipeline, quota, ACV and ARR, sales cycle, enterprise vs self-serve.',
    position: 5,
  },
  {
    id: 'strategy',
    name: 'Strategy',
    blurb: 'Competitive advantage, moats, power, network effects, build or buy.',
    position: 6,
  },
  {
    id: 'operations',
    name: 'Operations & Supply Chain',
    blurb: 'Throughput, bottlenecks, inventory, lean, quality, logistics.',
    position: 7,
  },
  {
    id: 'product',
    name: 'Product & Innovation',
    blurb: 'Jobs to be done, lean startup, MVP, discovery versus delivery.',
    position: 8,
  },
  {
    id: 'people',
    name: 'People & Organization',
    blurb: 'Hiring, incentives, org design, culture, delegation, equity.',
    position: 9,
  },
  {
    id: 'leadership',
    name: 'Leadership & Decision Making',
    blurb: 'Mental models, second-order thinking, bias, expected value.',
    position: 10,
  },
  {
    id: 'legal',
    name: 'Legal, Risk & Governance',
    blurb: 'Entity types, contracts, IP, compliance, insurance, risk.',
    position: 11,
  },
  {
    id: 'capital',
    name: 'Entrepreneurship & Capital',
    blurb: 'Starting a venture, bootstrapping versus VC, cap tables, exits.',
    position: 12,
  },
  {
    id: 'economics',
    name: 'Economics & Macro',
    blurb: 'Inflation, interest rates, cycles, currency, trade.',
    position: 13,
  },
  {
    id: 'negotiation',
    name: 'Negotiation & Communication',
    blurb: 'Framing, persuasion, writing memos, presenting numbers.',
    position: 14,
  },
];
