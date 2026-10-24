---
id: roadmap
type: process
title: Roadmapping
domain: product
one_line_definition: "Deciding the order in which you will build, and communicating that order so the rest of the company can plan around it."
why_it_matters: "It converts a backlog into a commitment. Without it, every stakeholder prioritises their own request and nothing ships in a coherent order."
inputs: [customer evidence, strategy, engineering capacity, dependencies]
outputs: [a sequenced set of bets with rationale]
cadence: "reviewed quarterly, revisited monthly"
steps: ["State the outcome you are aiming for, not the features.", "List candidate bets against that outcome.", "Rank by evidence and by dependency, not by loudness.", "Commit to an order and publish it with the reasoning.", "Revisit monthly against what you learned."]
related: [mvp, delegation]
sources: [the-personal-mba]
tags: [product, planning, process]
difficulty: 3
layer: 4
status: draft
---

Roadmapping is the discipline of choosing an order and defending it. Its value is not the document — it is the decision about what you will not do, and the communication of that decision.

A roadmap fails in one of two ways: it lists features with no outcome, so it cannot be argued with; or it is treated as a promise, so learning cannot change it.

## Worked example

A team has six candidate items and capacity for three:

    1. Automated reminders      — directly addresses churn in the largest cohort
    2. Reporting dashboard      — requested by sales, no evidence it changes retention
    3. Mobile app               — strategic, but no evidence mobile users retain better
    4. Export to accountant      — cited in 3 of the last 5 churn interviews
    5. New onboarding flow      — activation is 40% against a 60% target
    6. Dark mode                — requested often, unrelated to any outcome

Ranked by evidence against the stated outcome (retention and activation): 5, 1, 4. Item 3 waits for evidence. Item 2 and 6 are explicitly deferred with the reason stated, which is what makes the roadmap credible.

## Watch for

- **Outcomes before outputs.** "Increase activation to 60%" can be argued with. "Ship onboarding flow" cannot.
- **A roadmap is a hypothesis.** If evidence changes, the order should change. A roadmap nobody is allowed to revise becomes a fiction.
- **Silence is not agreement.** Publishing a roadmap and hearing nothing usually means people did not believe it, not that they accepted it.
