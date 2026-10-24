---
id: cohort-analysis
type: framework
title: Cohort Analysis
domain: unit-economics
one_line_definition: "Tracking groups of customers by when they arrived, and comparing how each group behaves over time."
why_it_matters: "It is the only way to see whether the business is actually improving. Aggregate metrics rise even when every group of customers is getting worse."
when_to_use: "Anytime a retention, revenue, or lifetime-value number looks wrong, or whenever you change pricing, onboarding, or targeting."
when_not_to_use: "When you have fewer than a few hundred customers per cohort — the percentages become noise."
steps: ["Group customers by acquisition month.", "Compute the metric for each group at each age (month 1, 2, 3...).", "Read down a column to see how one cohort ages.", "Read across a row to see how newer cohorts compare at the same age."]
limitations: "Cohorts need volume to be meaningful, and they describe the past. A cohort that looks healthy today tells you nothing about the cohort arriving next month."
related: [retention, churn]
sources: [the-personal-mba]
tags: [unit-economics, analysis, method]
difficulty: 3
layer: 3
status: draft
---

Cohort analysis groups customers by when they arrived and follows each group separately. It replaces a single average with a set of comparable histories.

The reason it matters is that aggregates lie. A company can show rising retention while every individual cohort is decaying, because a large new cohort lifts the average. Cohort analysis removes that illusion by comparing like with like.

## Worked example

    Retention by acquisition month

                  Month 1   Month 3   Month 6   Month 12
    Jan cohort      82%       58%       44%       38%
    Feb cohort      80%       55%       41%       35%
    Mar cohort      79%       57%       43%        -
    Apr cohort      81%       54%        -         -

Reading across month 3, every cohort sits at 54–58%. Reading down the January column, that cohort decayed steadily. The flatness across cohorts says the product's retention is stable; the slope down each column says it is not improving. Both facts matter, and neither appears in an aggregate retention number.

## Watch for

- **Compare at the same age.** A January cohort at month 12 and an April cohort at month 3 are not comparable. Align by age, not by calendar.
- **Small cohorts are noise.** Below a few hundred, a handful of customers swings the percentage wildly.
- **Cohort quality changes with acquisition.** If March came from a new channel, its cohort may differ for reasons that have nothing to do with the product.
