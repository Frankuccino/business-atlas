---
id: bottleneck
type: principle
title: Bottlenecks and Theory of Constraints
domain: operations
one_line_definition: "A system's output is limited by its single slowest step, so improving anything else does not increase output."
why_it_matters: "It redirects effort from the work that feels productive to the work that actually moves the number. Most improvement programmes optimise the wrong step."
statement: "Every system has exactly one constraint at a time. Improve it and the constraint moves. Improve anything else and nothing changes."
evidence: "In every observed production and service system, raising capacity at a non-constraining step increased work-in-progress and cost without increasing completed output."
failure_mode: "Spreading improvement effort evenly across all steps because it feels fair, and being surprised that throughput does not move."
related: [throughput]
sources: [the-personal-mba]
tags: [operations, constraints, bottlenecks]
difficulty: 3
layer: 2
status: draft
---

The Theory of Constraints says a system's throughput is capped by one step. Everything upstream of it produces faster than it can consume; everything downstream starves.

The discipline is a loop: find the constraint, exploit it, subordinate everything else to it, then elevate it. When the constraint moves, start again. The mistake is trying to optimise all steps at once, which improves cost and local efficiency while leaving output unchanged.

## Worked example

A software release pipeline:

    Commit       200/day
    Build        180/day
    Test          40/day   ← constraint
    Deploy       100/day

The constraint is testing. The team hires two more developers, and commit rate rises to 260/day. Test still does 40/day, so the backlog grows, and releases per day do not change. The hire added cost and queue.

Elevating testing to 80/day by adding a test engineer doubles output. Now build at 180 becomes the constraint, and the loop restarts.

## Watch for

- **The constraint is not always where the backlog is largest.** Look for the step with the least spare capacity relative to demand.
- **Subordinating is the hard part.** It means deliberately leaving other steps under-utilised, which feels wrong to every manager.
- **Constraints move.** An improvement that does not move the constraint did not improve the system, even if it improved a metric.
