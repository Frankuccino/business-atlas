---
id: throughput
type: term
title: Throughput
domain: operations
one_line_definition: "The rate at which a system produces what it is for, measured in units of value per unit of time."
why_it_matters: "It is the honest measure of capacity. A team busy at 100% utilisation often produces less than one at 70%, because there is no slack to absorb variation."
formula: "Throughput = units of value completed per unit of time"
how_to_read: "Read it as a rate, not a total. Two systems with the same output can have very different throughputs, and only one can grow."
commonly_confused_with: [bottleneck]
who_uses: [operations, engineering-lead, founder]
related: [bottleneck]
sources: [the-personal-mba]
tags: [operations, throughput, capacity]
difficulty: 2
layer: 2
status: draft
---

Throughput is how much a system delivers per unit of time. It applies to factories, support queues, and software teams alike, because all of them are systems with a limiting step.

The counter-intuitive part is that maximising individual utilisation reduces throughput. A station running at 100% has no capacity to absorb a surge, so work piles up in front of it and the whole system slows.

## Worked example

A support team handles tickets in three steps:

    Step         Capacity
    Triage       40 tickets/hour
    Resolution   12 tickets/hour
    Follow-up    30 tickets/hour

The system's throughput is 12 tickets/hour — the resolution step. Triage at 40 and follow-up at 30 are irrelevant to output; they are idle waiting for work.

Now triage is staffed to 100% utilisation. When a surge arrives, tickets queue, nothing reaches resolution faster, and the queue grows without any increase in completed work. The team feels busier and delivers less.

## Watch for

- **Throughput is set by the slowest step.** Improving any other step adds cost, not output.
- **Utilisation and throughput are different.** High utilisation with a queue is a warning sign, not a success.
- **Measure in value, not activity.** Tickets touched, commits merged, and meetings held are not throughput. Completed, usable work is.
