---
id: retention
type: term
title: Retention and Cohorts
domain: unit-economics
one_line_definition: "The share of customers who are still using the product after a given period."
why_it_matters: "Retention is the compounding engine. It determines whether growth accumulates or leaks, and it is the input to every lifetime-value calculation."
formula: "Retention = customers still active / customers at start"
how_to_read: "Read it as a curve over time, not a single number. The shape of the curve tells you more than its level."
commonly_confused_with: [churn, ltv]
who_uses: [founder, cfo]
related: [churn, cohort-analysis]
sources: [the-personal-mba]
tags: [unit-economics, retention, cohorts]
difficulty: 2
layer: 3
status: draft
---

Retention is the complement of churn: the customers who stay. But it is more useful than churn as a lens, because it can be read over time and because its shape is diagnostic.

A retention curve that drops steeply and then flattens is healthy — it means the customers who remain are the ones who genuinely need the product. A curve that declines linearly is unhealthy — it means the product never becomes part of the customer's routine.

## Worked example

    Cohort of 1,000 customers acquired in January
      Month 1:  800 active  (80%)
      Month 3:  560 active  (56%)
      Month 6:  430 active  (43%)
      Month 12: 390 active  (39%)

The curve flattens after month 6. The 390 who remain are the durable base, and the business can plan around them. Compare a second cohort that declines linearly to 15% by month 12: the product is attracting a different kind of customer, or the onboarding is worse.

## Watch for

- **Aggregate retention hides everything.** It mixes new and old cohorts and rises as the base grows even when each cohort is getting worse.
- **Cohort by acquisition date, not by activity.** Group customers by when they arrived; that is the only grouping that reveals a trend.
- **Retention is not engagement.** A customer who logs in daily and still cancels is a churn risk. Retention measures whether they stay, not whether they are happy.
