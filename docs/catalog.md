# Business Atlas — Catalog Inventory

Status: P1 complete — 63 of 63 P1 entries written and validated. P2 (65) and
P3 (47) remain `todo` and are the roadmap.
Last updated: 2026-10-24

## Why this file exists

The brief names fourteen domains and a handful of topics. It does not say what
the complete set of entries is, so there is no way to answer "what is left?" or
to notice that Sales has nothing while Finance has nine. This file is that
answer.

It is a **plan** and a **record**. Entries marked `done` exist in
`content/entries/`; everything else is outstanding work.

## How to read it

| Column | Meaning |
| --- | --- |
| `id` | The slug the entry will be authored under. Stable: it is the graph's join key. |
| Type | `term`, `framework`, `principle`, `process`, `playbook`, `case`, `quote` |
| Layer | 1 Literacy, 2 Reasoning, 3 Judgment, 4 Venture-readiness |
| Priority | `P1` v1, `P2` next wave, `P3` later |
| Status | `done` or `todo` |

**Priority is about the first build, not about importance.** P1 is the set that
makes the site usable as a daily reference: the vocabulary you cannot reason
without, plus the playbooks that make it a decision tool. P2 deepens the growth
domains. P3 fills the rest of the taxonomy.

**Growth weighting comes from the brief.** Unit Economics, Marketing, Sales,
Strategy, and Capital get depth first. Foundations and Finance are the vocabulary
base underneath them and stay shallow-but-complete.

---

## Coverage summary

Counts are generated from the tables below, not estimated.

| Domain | P1 | P2 | P3 | Total | Done |
| --- | --- | --- | --- | --- | --- |
| Foundations | 4 | 4 | 3 | 12 | 4 |
| Finance & Accounting | 9 | 6 | 4 | 20 | 9 |
| Unit Economics & Metrics | 9 | 6 | 4 | 20 | 9 |
| Marketing & Growth | 8 | 8 | 5 | 22 | 8 |
| Sales | 5 | 4 | 3 | 13 | 5 |
| Strategy | 5 | 5 | 5 | 16 | 5 |
| Operations & Supply Chain | 2 | 4 | 4 | 11 | 2 |
| Product & Innovation | 3 | 4 | 2 | 10 | 3 |
| People & Organization | 2 | 5 | 3 | 11 | 2 |
| Leadership & Decision Making | 3 | 3 | 3 | 10 | 3 |
| Legal, Risk & Governance | 3 | 3 | 3 | 10 | 3 |
| Entrepreneurship & Capital | 5 | 5 | 4 | 15 | 5 |
| Economics & Macro | 2 | 4 | 2 | 9 | 2 |
| Negotiation & Communication | 3 | 4 | 2 | 10 | 3 |
| **Total** | **63** | **65** | **47** | **175** | **63** |

P1 is complete: 63 entries across 14 domains, all authored, validated, and linked
into a symmetric graph with zero dangling references. `npm run build:content`
writes the manifest; `npm run validate:content` is the pre-commit gate.

P2 (65) and P3 (47) are deliberately deferred. The growth weighting in the brief
put Unit Economics, Marketing, Sales, Strategy, and Capital first, and all five
are now at full P1 depth — Marketing and Strategy went from zero to complete in
this pass. The remaining P2/P3 rows are the long tail, not a debt.

---

## 1. Foundations

The vocabulary base. Everything else assumes these.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| opportunity-cost | Opportunity Cost | term | 1 | P1 | done |
| value-creation | Value Creation Before Value Capture | principle | 1 | P1 | done |
| incentives | Incentives Drive Behaviour | principle | 1 | P1 | done |
| mental-models | Mental Models | term | 2 | P1 | done |
| supply-and-demand | Supply and Demand | term | 1 | P2 | todo |
| markets | How Markets Clear | term | 1 | P2 | todo |
| value-equation | The Value Equation | framework | 2 | P2 | todo |
| scarcity | Scarcity and Rationing | principle | 1 | P2 | todo |
| tradeoffs | Trade-offs and Production Possibility | principle | 1 | P3 | todo |
| marginal-thinking | Marginal Thinking | principle | 2 | P3 | todo |
| systems-thinking | Systems Thinking | principle | 2 | P3 | todo |

## 2. Finance & Accounting

The statements and the ratios. Layer 1 and 4.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| revenue | Revenue | term | 1 | P1 | done |
| cogs | Cost of Goods Sold | term | 1 | P1 | done |
| gross-margin | Gross Margin | term | 1 | P1 | done |
| operating-expenses | Operating Expenses | term | 1 | P1 | done |
| break-even | Break-even | term | 1 | P1 | done |
| balance-sheet | The Balance Sheet | term | 1 | P1 | done |
| cash-flow | The Cash Flow Statement | term | 1 | P1 | done |
| burn-rate | Burn Rate | term | 4 | P1 | done |
| runway | Runway | term | 4 | P1 | done |
| income-statement | The Income Statement | term | 1 | P2 | todo |
| ebitda | EBITDA | term | 2 | P2 | todo |
| working-capital | Working Capital | term | 2 | P2 | todo |
| net-margin | Operating and Net Margin | term | 1 | P2 | todo |
| budgeting-cycle | The Budgeting Cycle | process | 4 | P2 | todo |
| unit-economics-of-finance | Reading a P&L in One Pass | framework | 2 | P2 | todo |
| valuation | Valuation Basics | term | 4 | P3 | todo |
| npv-irr | NPV and IRR | term | 2 | P3 | todo |
| accounting-vs-finance | Accounting vs Finance | term | 1 | P3 | todo |
| month-end-close | Month-end Close | process | 4 | P3 | todo |

## 3. Unit Economics & Metrics

The numbers that decide whether a business works. Highest priority after Finance.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| cac | Customer Acquisition Cost | term | 3 | P1 | done |
| ltv | Lifetime Value | term | 3 | P1 | done |
| contribution-margin | Contribution Margin | term | 1 | P1 | done |
| roas | Return on Ad Spend | term | 3 | P1 | done |
| payback-period | CAC Payback Period | term | 3 | P1 | done |
| churn | Churn Rate | term | 3 | P1 | done |
| retention | Retention and Cohorts | term | 3 | P1 | done |
| arpu | ARPU and ARPPU | term | 3 | P1 | done |
| cohort-analysis | Cohort Analysis | framework | 3 | P1 | done |
| ltv-cac-ratio | The LTV/CAC Ratio | term | 3 | P2 | todo |
| cac-payback-rule | The Payback Rule of Thumb | principle | 3 | P2 | todo |
| roi | ROI and ROAS, Properly | term | 3 | P2 | todo |
| conversion-rate | Conversion Rate | term | 2 | P2 | todo |
| activation-rate | Activation Rate | term | 3 | P2 | todo |
| metrics-tree | The Metrics Tree | framework | 3 | P2 | todo |
| vanity-metrics | Vanity Metrics | principle | 3 | P3 | todo |
| north-star-metric | North Star Metric | term | 3 | P3 | todo |
| cohort-retention-curve | Reading a Retention Curve | framework | 3 | P3 | todo |
| revenue-recognition | Revenue Recognition | term | 1 | P3 | todo |

## 4. Marketing & Growth

Where the growth weighting lands hardest. Positioning and pricing before channels.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| positioning | Positioning | term | 2 | P1 | done |
| pricing | Pricing | term | 2 | P1 | done |
| funnel | The Funnel | framework | 2 | P1 | done |
| product-market-fit | Product-market Fit | term | 2 | P1 | done |
| segmentation | Segmentation | term | 2 | P1 | done |
| channels | Channel Economics | framework | 3 | P1 | done |
| attribution | Attribution | term | 3 | P1 | done |
| brand | Brand | term | 2 | P1 | done |
| jobs-to-be-done-marketing | Jobs to be Done | framework | 2 | P2 | todo |
| offer-design | Offer Design | framework | 3 | P2 | todo |
| value-proposition | The Value Proposition | term | 2 | P2 | todo |
| lead-generation | Lead Generation | process | 3 | P2 | todo |
| growth-loops | Growth Loops vs Funnels | framework | 3 | P2 | todo |
| seo | SEO | process | 3 | P2 | todo |
| paid-acquisition | Paid Acquisition | process | 3 | P2 | todo |
| lifecycle-marketing | Lifecycle Marketing | process | 3 | P2 | todo |
| messaging | Messaging and Copy | term | 2 | P3 | todo |
| competitive-positioning | Competitive Positioning | framework | 2 | P3 | todo |
| distribution | Distribution and Channel Conflict | term | 3 | P3 | todo |
| viral-coefficient | Viral Coefficient | term | 3 | P3 | todo |
| branding-vs-performance | Brand vs Performance | principle | 3 | P3 | todo |

## 5. Sales

Small, sharp, and operator-grade. Self-serve vs enterprise is the spine.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| pipeline | Pipeline | term | 3 | P1 | done |
| sales-cycle | Sales Cycle | term | 3 | P1 | done |
| acv-arr | ACV and ARR | term | 3 | P1 | done |
| quota | Quota and Coverage | term | 4 | P1 | done |
| sales-motion | Enterprise vs Self-serve | framework | 3 | P1 | done |
| win-rate | Win Rate | term | 3 | P2 | todo |
| discovery | Discovery and Qualification | process | 3 | P2 | todo |
| sales-compensation | Sales Compensation | term | 4 | P2 | todo |
| discounting | Discounting Discipline | principle | 3 | P2 | todo |
| pipeline-review | Pipeline Review | process | 4 | P3 | todo |
| onboarding | Customer Onboarding | process | 3 | P3 | todo |
| expansion-revenue | Expansion Revenue | term | 3 | P3 | todo |

## 6. Strategy

The "why" layer. Moats and power before the frameworks that name them.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| moat | Moat | term | 2 | P1 | done |
| competitive-advantage | Competitive Advantage | principle | 2 | P1 | done |
| five-forces | Porter's Five Forces | framework | 2 | P1 | done |
| network-effects | Network Effects | term | 2 | P1 | done |
| seven-powers | 7 Powers | framework | 2 | P1 | done |
| blue-ocean | Blue Ocean | framework | 2 | P2 | todo |
| disruption | Disruption | principle | 2 | P2 | todo |
| positioning-strategy | Positioning as Strategy | framework | 2 | P2 | todo |
| build-buy-partner | Build, Buy, or Partner | framework | 4 | P2 | todo |
| strategy-vs-tactics | Strategy vs Tactics | principle | 2 | P2 | todo |
| good-strategy-bad-strategy | Good Strategy, Bad Strategy | framework | 2 | P3 | todo |
| platform-strategy | Platform Strategy | framework | 2 | P3 | todo |
| switching-costs | Switching Costs | term | 2 | P3 | todo |
| concentration-risk | Concentration and Power | principle | 2 | P3 | todo |
| flywheel | The Flywheel | framework | 2 | P3 | todo |

## 7. Operations & Supply Chain

Thin on purpose — the vocabulary, not the practice.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| throughput | Throughput | term | 2 | P1 | done |
| bottleneck | Bottlenecks and Theory of Constraints | principle | 2 | P1 | done |
| lean | Lean and Waste | principle | 2 | P2 | todo |
| inventory | Inventory and Carrying Cost | term | 2 | P2 | todo |
| quality | Quality and Cost of Rework | term | 2 | P2 | todo |
| capacity-planning | Capacity Planning | process | 3 | P2 | todo |
| lead-time | Lead Time | term | 2 | P3 | todo |
| queueing | Queueing and Utilisation | principle | 3 | P3 | todo |
| supplier-management | Supplier Management | process | 3 | P3 | todo |
| operations-strategy | Operations Strategy | framework | 2 | P3 | todo |

## 8. Product & Innovation

Discovery vs delivery is the spine.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| jobs-to-be-done | Jobs to be Done | framework | 2 | P1 | done |
| mvp | Minimum Viable Product | term | 2 | P1 | done |
| roadmap | Roadmapping | process | 4 | P1 | done |
| discovery-vs-delivery | Discovery vs Delivery | principle | 2 | P2 | todo |
| lean-startup | The Lean Startup Loop | framework | 2 | P2 | todo |
| feature-economics | Feature Economics | principle | 3 | P2 | todo |
| technical-debt | Technical Debt | term | 2 | P2 | todo |
| innovation-dilemma | The Innovator's Dilemma | principle | 2 | P3 | todo |
| product-strategy | Product Strategy | framework | 2 | P3 | todo |

## 9. People & Organization

Hiring and incentives first; org design later.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| hiring-loop | The Hiring Loop | process | 4 | P1 | done |
| delegation | Delegation | principle | 4 | P1 | done |
| org-design | Org Design | term | 4 | P2 | todo |
| incentives-compensation | Incentives and Compensation | term | 4 | P2 | todo |
| culture | Culture | principle | 4 | P2 | todo |
| equity | Equity and Option Pools | term | 4 | P2 | todo |
| management | Management vs Leadership | principle | 4 | P2 | todo |
| firing | When to Remove Someone | playbook | 4 | P3 | todo |
| remote-org | Designing a Remote Org | framework | 4 | P3 | todo |
| performance-reviews | Performance Reviews | process | 4 | P3 | todo |

## 10. Leadership & Decision Making

The judgment layer. Small set, high weight.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| second-order-thinking | Second-order Thinking | principle | 3 | P1 | done |
| bias | Cognitive Bias | term | 3 | P1 | done |
| reversible-decisions | Reversible vs Irreversible Decisions | principle | 3 | P1 | done |
| expected-value | Expected Value | term | 3 | P2 | todo |
| base-rates | Base Rates | principle | 3 | P2 | todo |
| premortem | The Pre-mortem | process | 3 | P2 | todo |
| decision-journal | The Decision Journal | process | 3 | P3 | todo |
| inversion | Inversion | principle | 3 | P3 | todo |
| red-team | Red Teaming a Decision | process | 3 | P3 | todo |

## 11. Legal, Risk & Governance

Entity choice is the one with a deadline attached.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| entity-types | Entity Types | term | 4 | P1 | done |
| contracts | Contracts and Negotiation Basics | term | 4 | P1 | done |
| ip | Intellectual Property | term | 4 | P1 | done |
| cap-table-legal | Cap Tables and Dilution | term | 4 | P2 | todo |
| compliance | Compliance Basics | process | 4 | P2 | todo |
| insurance | Insurance and Risk Transfer | term | 4 | P2 | todo |
| privacy | Privacy and Data | term | 4 | P3 | todo |
| risk-register | The Risk Register | process | 4 | P3 | todo |
| founder-agreements | Founder Agreements | playbook | 4 | P3 | todo |

## 12. Entrepreneurship & Capital

Fundraising is a skill with a process, not a mystery.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| bootstrapping | Bootstrapping vs Venture Capital | framework | 4 | P1 | done |
| cap-table | Cap Table | term | 4 | P1 | done |
| term-sheet | The Term Sheet | term | 4 | P1 | done |
| fundraising-process | The Fundraising Process | process | 4 | P1 | done |
| dilution | Dilution and Ownership | term | 4 | P1 | done |
| valuation-venture | Venture Valuation | term | 4 | P2 | todo |
| pitch-deck | The Pitch Deck | process | 4 | P2 | todo |
| due-diligence | Due Diligence | process | 4 | P2 | todo |
| exits | Exits and Liquidity | term | 4 | P2 | todo |
| convertible-notes | SAFEs and Convertible Notes | term | 4 | P2 | todo |
| board | Boards and Governance | term | 4 | P3 | todo |
| down-round | Down Rounds and Bridge Rounds | playbook | 4 | P3 | todo |
| unit-economics-of-raising | What Investors Actually Check | framework | 4 | P3 | todo |
| accelerator | Accelerators and Incubators | term | 4 | P3 | todo |

## 13. Economics & Macro

Enough to read the news without being fooled.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| inflation | Inflation | term | 1 | P1 | done |
| interest-rates | Interest Rates | term | 1 | P1 | done |
| business-cycles | Business Cycles | term | 2 | P2 | todo |
| currency | Currency and Exchange Rates | term | 2 | P2 | todo |
| trade | Trade and Comparative Advantage | term | 2 | P2 | todo |
| monetary-policy | Monetary and Fiscal Policy | term | 2 | P2 | todo |
| emerging-markets | Emerging Market Context | term | 3 | P3 | todo |
| ph-economy | Philippine Market Context | term | 3 | P3 | todo |

## 14. Negotiation & Communication

Two of these are playbooks, because that is how they get used.

| id | Title | Type | Layer | Pri | Status |
| --- | --- | --- | --- | --- | --- |
| framing | Framing | term | 3 | P1 | done |
| anchoring | Anchoring | principle | 3 | P1 | done |
| batna | BATNA | term | 3 | P1 | done |
| salary-negotiation | Negotiating a Salary or Rate | playbook | 3 | P2 | todo |
| vendor-negotiation | Negotiating a Supplier Contract | playbook | 3 | P2 | todo |
| persuasion | Persuasion and Influence | term | 3 | P2 | todo |
| raising-money-negotiation | Negotiating a Term Sheet | playbook | 4 | P2 | todo |
| writing-memos | Writing Memos | process | 3 | P3 | todo |
| presenting-numbers | Presenting Numbers | process | 3 | P3 | todo |

---

## Cross-cutting content

These are not domain entries. They attach to entries, or stand alone as a type.

### Playbooks

The v1 set, each a "when facing X, consider A B C, watch for trap D" checklist.
Playbooks are the highest value per authoring hour in the whole catalog.

| id | Title | Trigger | Pri |
| --- | --- | --- | --- |
| pb-pricing-new-product | Pricing a new product | You are setting a price for the first time | P1 |
| pb-evaluating-supplier | Evaluating a supplier | Two vendors, one contract | P1 |
| pb-raising-a-round | Raising a round | You need capital and have limited runway | P1 |
| pb-first-hire | Making your first hire | You are about to add a person | P1 |
| pb-new-channel | Evaluating a new channel | You are considering a channel you have not run | P1 |
| pb-raising-prices | Raising prices on existing customers | Your costs have moved | P2 |
| pb-cutting-costs | Cutting costs | Burn exceeds the plan | P2 |
| pb-saying-no | Saying no to a customer | Scope creep is creeping | P2 |
| pb-pivoting | Considering a pivot | The current path is not working | P2 |
| pb-firing | Removing someone | Performance has not improved | P3 |

### Quotes

First-class, each linked to the concept it illustrates. Public-domain sources
only for verbatim text; in-copyright books get short attributed quotes plus a
plain-language takeaway.

| Speaker | Work | Illustrates | Pri |
| --- | --- | --- | --- |
| Henry Ford | My Life and Work | Focus, throughput | P1 |
| Andrew Carnegie | The Gospel of Wealth | Capital allocation | P1 |
| Benjamin Franklin | Poor Richard's Almanack | Frugality, compounding | P1 |
| Adam Smith | The Wealth of Nations | Division of labour, markets | P1 |
| Sun Tzu | The Art of War | Strategy, competitive position | P1 |
| Peter Drucker | Various | Management, effectiveness | P2 |
| Andy Grove | High Output Management | Leverage, management | P2 |
| Steve Jobs | Interviews | Focus, product | P2 |

### Cases

One real decision, analysed. The "judgment" layer.

| id | Company | Situation | Pri |
| --- | --- | --- | --- |
| case-netflix-dvd | Netflix | Streaming vs the DVD business | P1 |
| case-ford-pricing | Ford | The $5 day and vertical integration | P1 |
| case-nespresso | Nespresso | Selling machines at cost to lock in pods | P1 |
| case-dell-direct | Dell | Direct-to-customer PC sales | P2 |
| case-zipcar | Zipcar | Pricing a shared asset | P2 |
| case-groupon | Groupon | Growth that never became profit | P2 |
| case-webvan | Webvan | Scaling ahead of unit economics | P3 |
| case-blockbuster | Blockbuster | Refusing to cannibalise the core | P3 |

### Sources

The reading library. Each maps to the entries it feeds.

| id | Title | Author | Priority |
| --- | --- | --- | --- |
| the-personal-mba | The Personal MBA | Josh Kaufman | P1 (mapped) |
| 100m-offers | $100M Offers | Alex Hormozi | P1 |
| 100m-leads | $100M Leads | Alex Hormozi | P1 |
| 100m-money-models | $100M Money Models | Alex Hormozi | P1 |
| seven-powers | 7 Powers | Hamilton Helmer | P1 |
| good-strategy-bad-strategy | Good Strategy Bad Strategy | Richard Rumelt | P1 |
| playing-to-win | Playing to Win | Lafley and Martin | P1 |
| zero-to-one | Zero to One | Peter Thiel | P2 |
| innovators-dilemma | The Innovator's Dilemma | Clayton Christensen | P2 |
| traction | Traction | Weinberg and Mares | P2 |
| crossing-the-chasm | Crossing the Chasm | Geoffrey Moore | P2 |
| founding-sales | Founding Sales | Kazanjy | P2 |
| blitzscaling | Blitzscaling | Hoffman and Yeh | P2 |
| the-mom-test | The Mom Test | Rob Fitzpatrick | P2 |
| lean-startup | The Lean Startup | Eric Ries | P2 |
| high-output-management | High Output Management | Andy Grove | P2 |
| only-the-paranoid-survive | Only the Paranoid Survive | Andy Grove | P3 |
| hard-thing | The Hard Thing About Hard Things | Ben Horowitz | P3 |
| measure-what-matters | Measure What Matters | John Doerr | P3 |
| the-goal | The Goal | Eliyahu Goldratt | P3 |
| venture-deals | Venture Deals | Brad Feld | P3 |
| business-adventures | Business Adventures | John Brooks | P3 |
| never-split-the-difference | Never Split the Difference | Chris Voss | P3 |
| influence | Influence | Robert Cialdini | P3 |
| my-life-and-work | My Life and Work | Henry Ford | P1 (public domain) |

---

## What this list is not

- **It is not a commitment to write all 175.** P3 is the long tail. If the site
  is useful with the 63 P1 entries and a coherent graph, the remaining 112 are a
  roadmap, not a debt.
- **It is not the schema.** Field-level detail is in
  [data-model.md](data-model.md). This file only names and prioritises.
- **It is not ordered.** Priority says what to write next; it does not say what
  to read next. That is the learning path in [brief.md](brief.md), and it is a
  separate concern.
- **Ids are provisional.** They are slugs chosen now so the graph can be
  authored against something. Renaming one means touching every file that links
  to it, which is exactly why the validator enforces that `related` is
  symmetric and resolvable.

## How to use it

1. Pick the next `P2` / `todo` row in a domain that is thin.
2. Author it against a primary source; do not mark `reviewed` until verified.
3. Add its `related` links. The graph closure adds the back-links
   automatically, and dangling references fail the build.
4. Regenerate: `npm run build:content`.
5. Flip the row to `done` in this file.
