---
id: churn-spike
type: playbook
title: Churn Spike
domain: product
one_line_definition: "A checklist for diagnosing and responding to a sudden rise in churn."
why_it_matters: "Churn is the leak in the bucket. A spike is a signal, not a mystery, if you know where to look."
trigger: "Your churn rate has risen sharply, and you need to find the cause and decide the response."
questions:
  - "When did it start, and what changed?"
  - "Which cohort churned — new or established?"
  - "Is it voluntary or involuntary?"
  - "Did a competitor ship something?"
numbers_to_pull:
  - "Churn rate by cohort and acquisition month"
  - "Churn rate by plan and channel"
  - "Failed payment rate (involuntary churn)"
  - "NPS or support ticket volume, pre and post"
traps:
  - "Averaging churn across cohorts and missing the spike"
  - "Treating all churn as a product problem"
  - "Offering discounts before diagnosing"
  - "Ignoring involuntary churn, which is the cheapest to fix"
who_to_consult: [product, customer-success, finance]
related: []
sources: [the-personal-mba]
tags: [churn, retention, product]
difficulty: 3
layer: 3
status: reviewed
---

A churn spike is a question, not a verdict. The first move is to stop
panicking and start segmenting, because the cause is almost always visible in
the breakdown and invisible in the average.

## Segment first

Split churn by cohort, plan, channel, and tenure. A spike that hits only new
customers points to onboarding or acquisition quality. A spike that hits
established customers points to a product change, a competitor, or a pricing
shift. The answer is in the split; the aggregate tells you nothing.

## Separate voluntary from involuntary

Involuntary churn — failed payments, expired cards — is the cheapest to fix and
the most commonly ignored. Dunning, retry logic, and card-update prompts can
recover a meaningful share of it. Fix this before touching the product.

## The timeline

Plot churn against every change in the last 60 days: releases, price changes,
marketing campaigns, competitor launches. The spike usually lines up with one
of them. If it does not, look at seasonality and acquisition mix before
concluding it is mysterious.

## The response

Do not discount. A discount retains the customer you have and trains them to
threaten to leave. Fix the cause, communicate the fix, and let the data tell
you whether it worked.
