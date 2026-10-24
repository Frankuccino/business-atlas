---
id: acv-arr
type: term
title: ACV and ARR
domain: sales
one_line_definition: "Average contract value per deal, and the annual recurring revenue the base produces."
why_it_matters: "They are the two numbers that describe the shape of a subscription business. ACV says what a customer is worth per deal; ARR says what the base is worth per year."
formula: "ARR = sum of all active contracts normalised to a year"
how_to_read: "Read them together with churn. A high ARR with high churn is a leak; a modest ARR with near-zero churn is a compounding asset."
commonly_confused_with: [pipeline, quota]
who_uses: [founder, cfo, investor]
related: [pipeline, quota]
sources: [the-personal-mba]
tags: [sales, revenue, contracts]
difficulty: 2
layer: 3
status: draft
---

ACV is the average size of a single contract. ARR is the revenue the whole customer base produces in a year, treating everything as recurring.

Together they separate two growth stories that look identical from the outside. A company growing by adding large contracts is buying growth; one growing by compounding a stable base is building an asset.

## Worked example

A company has 200 customers:

    150 at $10,000/year   = 1,500,000
     40 at $40,000/year   = 1,600,000
     10 at $150,000/year  = 1,500,000
    ARR                   = 4,600,000
    ACV                   = 4,600,000 / 200 = 23,000

The ACV of $23,000 hides a base that is really three businesses. Ten customers produce a third of the revenue, so losing one is a $150,000 event. A company that does not know this will not notice the concentration risk until it bites.

## Watch for

- **ARR excludes one-time fees.** Setup, implementation, and services should be reported separately, or the recurring base looks healthier than it is.
- **Net new ARR is the growth number.** Total ARR rises even when existing customers downgrade, if new business is large enough to mask it.
- **ACV is a blend.** Report it by segment, because the average across segments is not a price anyone pays.
