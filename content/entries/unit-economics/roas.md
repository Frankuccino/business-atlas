---
id: roas
type: term
title: Return on Ad Spend
domain: unit-economics
one_line_definition: "Revenue earned for every dollar spent on advertising."
why_it_matters: "It is the fastest honest read on whether a paid channel is pulling its weight, and the number people lie with most."
formula: "ROAS = revenue attributed to ads / ad spend"
how_to_read: "Read it against contribution margin, never against itself. A 4x ROAS can still be a money loser."
commonly_confused_with: [cac]
who_uses: [founder, marketer, media-buyer]
related: [cac, contribution-margin]
sources: [the-personal-mba]
tags: [advertising, attribution, unit-economics]
difficulty: 2
layer: 3
status: reviewed
---

Return on ad spend is revenue divided by ad spend. It looks like the answer to
"is this channel working", and because it is a single number, it is frequently
the wrong answer.

The reason: ROAS has no costs in it. It tells you how much revenue a dollar of
ads produced, not how much money the business kept. A channel can return 4x and
lose money if the product's contribution margin is 20%, because $4 of revenue
carries only $0.80 of contribution and you spent $1.00 to get it.

The correct pairing is ROAS against contribution margin. Work out the break-even
ROAS for your margin, then judge the channel against that.

## Worked example

A product sells for $100 with a contribution margin of $45 after all variable
costs including processing and fulfilment.

    Break-even ROAS = 1 / 0.45 = 2.22x

Anything above 2.22x makes money on the first purchase; anything below loses
money. Now the channels:

    Paid search:   $3,000 spend → $12,000 revenue  = 4.0x   (profitable)
    Paid social:   $3,000 spend → $ 8,400 revenue  = 2.8x   (profitable, thin)
    Display:       $3,000 spend → $ 6,000 revenue  = 2.0x   (losing money)

Display looks like it "returns 2x", which sounds fine until you see it is below
the 2.22x break-even. It is losing $0.20 on every dollar spent.

## Watch for

- **Attribution is the whole game.** A 4x ROAS from last-click is not the same
  as 4x from a geo holdout. State the model or do not quote the number.
- **Revenue is not profit.** See the break-even calculation above; without it,
  ROAS is a vanity metric.
- **First-purchase ROAS ignores repeat buying.** A customer who buys once at a
  loss and returns three times is good business. Compute ROAS on the cohort's
  lifetime value, not the single order.
