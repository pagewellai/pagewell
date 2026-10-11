---
title: Small pull requests are a scheduling decision
template: article
summary: Review latency, not review quality, is what large pull requests cost you.
---

:::lead
A big pull request is not harder to review. It is harder to *schedule* a review for,
and that difference is where the week goes.
:::

## The queue is the problem

A 40-file change does not take four times longer to review than a 10-file change.
It takes one uninterrupted hour that nobody has, so it waits for one. The waiting is
the cost, and it does not appear in any metric that teams usually watch.

:::highlight
Review time is roughly linear in size. Review *latency* is not - it is a step function
of whether the reviewer can find a slot big enough.
:::

## What the numbers look like

```stats
items:
  - { value: "6h", label: "Median wait", note: "changes under 200 lines" }
  - { value: "31h", label: "Median wait", note: "changes over 800 lines" }
  - { value: "3.9x", label: "Latency ratio" }
```

The size ratio is four to one. The latency ratio is nearly the same, which is the
coincidence that makes people think review effort is the driver. It is not: the
reviewers in the second group spent about ninety minutes reading. They just spent
thirty hours not starting.

## What to do instead

```steps
items:
  - title: Split by seam, not by size
    text: A 900-line change that is one refactor plus one feature is two pull requests. A 900-line change that is one coherent migration is one.
  - title: Land the boring half first
    text: Renames, moves and formatting go alone. They are unreviewable in aggregate and trivial alone.
  - title: Ask for the slot, not the review
    text: "\"Do you have 20 minutes today?\" gets answered. \"Can you review this?\" gets starred."
```

## The exception worth naming

Some changes genuinely cannot be split: a schema migration with its call sites, a
version bump that touches every lockfile. For those, say so in the description and
name the one file that actually needs thought.

:::summary Key points
- Large pull requests cost latency, not reviewer effort.
- Latency is a step function of calendar space, so it grows faster than size.
- Split by seam. Land mechanical changes on their own.
- Ask for a time slot rather than a review.
- Some changes cannot be split - say which file matters.
:::
