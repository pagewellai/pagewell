---
title: The quiet part of an incident review
template: article
summary: The timeline is the easy half. The hard half is what people believed at each step.
---

```cover
kicker: Postmortem
title: The quiet part of an incident review
subtitle: Everyone agrees on the timeline. Nobody agrees on what it meant.
author: Operations
date: March 2026
read_time: 6 min
```

:::lead
Reconstructing what happened takes an afternoon. Reconstructing what people *thought*
was happening takes a week, and it is the only part that changes anything.
:::

## Timelines are cheap

Logs, deploy records and chat history give you a minute-by-minute account almost for
free. That is why every review has one, and why every review that stops there produces
the same three action items: add an alert, add a runbook, add a dashboard.

## Belief is the missing column

At 02:14 the on-call engineer saw error rates climb and restarted the ingest workers.
The timeline records a restart. What it does not record is that she had seen the same
shape three weeks earlier, when a restart had in fact fixed it.

```quote
text: The question is never why someone did the wrong thing. It is what made it the right thing at the time.
by: Richard Cook
role: Complex systems researcher
```

## What the numbers hid

```stats
items:
  - { value: "11m", label: "To first action" }
  - { value: "94m", label: "To correct diagnosis" }
  - { value: "6", label: "Restarts before escalation" }
```

Eleven minutes to act is good. Ninety-four minutes to understand is not, and no alert
would have shortened it, because the alert fired correctly at minute nine.

## The interview that works

```steps
items:
  - title: Ask what they expected to see
    text: Before asking what they did. Expectation explains action; action alone does not.
  - title: Ask when they stopped believing it
    text: The moment a mental model breaks is the moment the incident actually turns.
  - title: Ask who they would have called
    text: And why they did not. This finds the escalation friction that no dashboard shows.
```

## What changed afterwards

Not an alert. The team added one line to the restart runbook: *if a restart has been
tried twice, the hypothesis is wrong.* Mean time to correct diagnosis fell by half over
the next quarter.

:::summary What to take away
- A timeline is necessary and almost never sufficient.
- Record what people believed, not only what they did.
- Repeated identical actions are the signal that a model has failed.
- Fixes aimed at belief beat fixes aimed at detection.
:::

```profile
name: Operations
title: Reliability team
bio: We publish every review that changed something.
links:
  - { label: All reviews, url: "https://example.com/reviews" }
```
