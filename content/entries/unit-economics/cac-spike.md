---
id: cac-spike
type: playbook
title: CAC Spike
domain: unit-economics
one_line_definition: "A checklist for diagnosing and fixing a sudden rise in customer acquisition cost."
why_it_matters: "CAC is the price you pay for growth. A spike means the market got more expensive or you got less efficient, and the difference matters."
trigger: "Your customer acquisition cost has risen sharply, and you need to find the cause and decide the response."
questions:
  - "Which channel got more expensive?"
  - "Did conversion drop, or did traffic cost more?"
  - "Is the spike in one segment or across the board?"
  - "Did a competitor enter the auction?"
numbers_to_pull:
  - "CAC by channel, trailing 90 days"
  - "Cost per click and conversion rate by channel"
  - "CAC by segment and cohort"
  - "LTV by channel to check whether the economics still hold"
traps:
  - "Blaming the channel when the landing page broke"
  - "Cutting spend before diagnosing"
  - "Averaging CAC across channels and missing the one that moved"
  - "Ignoring that LTV may have moved too"
who_to_consult: [marketing, finance, product]
related: [cac, roas, contribution-margin]
sources: [the-personal-mba]
tags: [cac, acquisition, marketing]
difficulty: 3
layer: 3
status: reviewed
---

A CAC spike is a symptom with several possible diseases. The first move is to
split it, because the split tells you which one you have and the aggregate tells
you nothing.

## Split by channel

CAC is an average, and averages hide. If one channel spiked while the others
held, the problem is that channel. If every channel moved together, the problem
is your conversion rate, your pricing, or your market, and no channel fix will
solve it.

## Split conversion from cost

A rising CAC can come from traffic getting more expensive, conversion getting
worse, or both. They have different causes and different fixes. Pull cost per
click and conversion rate separately before you decide what to do.

## The timeline

Plot CAC against every change in the last 60 days: creative refreshes, landing
page changes, bid strategy changes, competitor launches. The spike usually lines
up with one of them. If it does not, check seasonality and auction dynamics
before concluding it is mysterious.

## The response

Do not cut spend across the board. Cut the channel that moved, fix the
conversion problem, and re-measure. Cutting everything treats a local problem
as a global one and loses the channels that were working.
