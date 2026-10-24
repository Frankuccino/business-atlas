---
id: churn
type: term
title: Churn Rate
domain: unit-economics
one_line_definition: "The share of customers who stop using the product in a period."
why_it_matters: "It is the leak in the bucket. Growth fills the bucket; churn empties it. A leak you cannot measure is a leak you cannot fix."
formula: "Churn = customers lost in period / customers at start of period"
how_to_read: "Read it as a rate per month for subscriptions and per period for one-time products. Compare it to your growth rate, not to an industry average."
commonly_confused_with: [retention, ltv]
who_uses: [founder, cfo]
related: [retention, ltv]
sources: [the-personal-mba]
tags: [unit-economics, retention, saas]
difficulty: 2
layer: 3
status: draft
---

Churn is the percentage of customers who leave in a period. It is the single most important retention metric because it compounds: a small monthly rate removes a large share of the base over a year.

Its power is in combination with growth. A company growing 10% a month with 5% churn is adding 5% net. The same company at 2% churn is adding 8% net — a 60% faster compounding rate from a change most founders treat as a support problem.

## Worked example

A company starts the month with 1,000 customers and loses 40:

    Monthly churn = 40 / 1,000 = 4%

Over a year, 4% monthly churn removes a startling share of the base. The average customer lifetime is roughly 1 / 0.04 = 25 months. Now suppose churn falls to 2%:

    Average lifetime = 1 / 0.02 = 50 months

The lifetime doubled. With a contribution margin of $35 a month, LTV goes from $875 to $1,750 — without acquiring a single new customer.

## Watch for

- **Gross vs net churn.** Gross churn ignores the customers who upgrade. Net churn counts expansion revenue as a reduction, which can make a bad retention picture look stable.
- **Revenue churn is not customer churn.** Losing one large customer can exceed losing many small ones. Track both.
- **Churn has causes that differ.** Involuntary churn (failed payments) is a fixable operational problem; voluntary churn is a product problem. Treat them separately.
