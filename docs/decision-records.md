# Decision records

When a discussion settles a design question — in a review, a planning
session, or a conversation with an AI assistant — the decision evaporates
unless it is written down at the moment it is made. A decision record is
that write-down: cheap, dated, and kept in the repo next to the code it
governs, so the next person (or the same person, months later) does not
re-litigate a question that was already answered.

## When to write one

Write a record when a discussion produced decisions that are **not visible
in the code it led to** — trade-offs weighed, alternatives rejected, bugs
reclassified as intended behaviour, scope split across PRs. One record per
discussion, not per decision: the value is the set of decisions in context.

Do not write one for decisions the code states plainly on its own, or that a
doc already owns (those get edited instead).

## Where they live

`.decisions/` at the repo root, named `{kebab-topic}-{YYYY-MM-DD}.md`:

```
.decisions/reading-view-paging-2026-08-15.md
```

The date is the day the discussion happened, so records sort chronologically
and a stale record announces its own age.

## The format

```markdown
# <Topic> — Decision Record

_Generated: YYYY-MM-DD_

## Summary

Two or three sentences: what prompted the discussion and what came out of
it. If some reported "bugs" turned out to be design decisions to revisit
rather than defects, say so here — that reclassification is exactly the
kind of knowledge that evaporates.

## Decisions

### <The question, phrased as a noun phrase>

**Decision** — what was decided, in one or two sentences.

**Rationale** — why, including the constraint or observation that settled it.

**Alternatives considered** — what else was on the table and why it lost.
"None" is a legitimate answer, and worth writing, because it says the
question had one defensible answer rather than an unexamined one.

### <Next question>

…

## Open issues

Questions the discussion raised but did not settle, each with what would
settle it.

## Assumptions

What the decisions assume to be true. If an assumption later fails, this
section says which decisions need revisiting.
```

Two habits worth keeping from the projects this convention comes from:

- If the discussion decided **how the work splits into PRs**, record that as
  a decision too, with its rationale — the split is a design choice that is
  invisible once the PRs are merged.
- Link the record from the PR(s) that implement it, so the review has the
  reasoning in reach.
