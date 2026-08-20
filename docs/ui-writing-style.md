# UI Writing Style

How the app talks to the user. This governs **every string the app puts on a
screen**: settings explanations, picker option descriptions, toasts, empty
states, dialog bodies, accessibility labels, error messages — and it extends
to the store listing copy in `fastlane/metadata/`.

It does not govern code comments, commit messages, or pull request bodies.
Those have their own audience and their own conventions.

## The one rule

**Say plainly what the thing does.** Name the options. Use the words that are
on the screen. Do not characterise, do not personify, do not be clever.

The user opening an explanation has a specific question and wants it answered
in one read. Writing that is enjoyable to compose is usually writing that
makes them read it twice.

## Golden examples

These are the reference. New copy should be indistinguishable from them.
(They describe an imaginary app; steal the shape, not the content.)

### A mode picker's explanation

> In list view, every item is shown in one scrolling column, newest first. In
> board view, items are grouped into columns by status, and you drag an item
> between columns to change its status.
>
> Both views show the same items; switching views never changes your data.

### A numeric setting's explanation

> Adds a delay before an item is archived, from 0 to 30 days.
>
> At 0 days, completed items are archived immediately. Longer delays keep
> completed items visible in the list, but the list grows accordingly.

## What each of those is doing

**Name every option, in the order the picker offers them.** "In list view …
In board view …". A user choosing between options needs each one named and
described, not a characterisation of the choice as a whole.

**Use the option's exact label.** If the picker says Board, the explanation
says Board. Never a synonym, never a description standing in for the name.

**Describe the mechanism, not the feeling.** "Items are grouped into columns
by status" is right. "Your work settles into neat lanes" is wrong, because
work does not settle, and the user now has to work out what settling means.

**Give numbers where numbers exist.** "From 0 to 30 days." A range the user
can see on the control should be stated in the same units the control uses.

**Second paragraph for the limits and the trade-off.** The first paragraph
says what the setting does. The second says what it does not apply to, what
happens at the extremes, what it costs, or what stays true regardless. Two
short paragraphs beat one dense one.

## Never write

**No personification.** Items do not want, arrive, travel, or settle.
Screens do not remember. The list scrolls, the item moves, the value is
saved.

**No em dashes.** Use a full stop, a comma, or a new sentence. An em dash
almost always joins two thoughts that read better apart.

**No metaphor or wordplay.** "Your inbox, tamed" is not an explanation of an
archiving setting.

**No inversion or literary word order.** "How far an item moves when
archived, in time rather than in position" reads as an essay. "How many days
a completed item stays in the list before archiving" reads as an answer.

**No restating the row's own label.** A row called Archive delay does not
open an explanation beginning "Archive delay adds …". The user can see the
label.

**No scope boilerplate.** If a setting exists at two levels (app-wide and
per-item), explain that model once, in one place, and mark the affected rows
with a consistent badge — never re-explain scope in each row's own text (see
below).

**No sentence fragments as headlines.** Write full sentences.

## Where scope is explained

When settings exist twice — once app-wide and once optionally on a single
item, where the item's own value wins — resist explaining that in every
description. It crowds out the explanation of what each setting actually
does. Say it in exactly two places:

1. **The settings home screen**, in one paragraph, once, on the way in.
2. **A consistent badge** on the rows the model applies to, produced by one
   shared function so every surface that draws it stays in agreement.

The single exception is a genuine second route to the same control ("you can
also change this from inside an item by …") — that earns a sentence because
it teaches a route nothing else advertises. It is about a route, not about
precedence.

## Platform differences

Where a setting behaves differently on one platform, split the string rather
than writing one string that covers both: a shared base sentence with a
per-platform tail appended. A user on a phone should not read a sentence
about browsers. And never build the platform list by hand where a module
already owns that decision — derive the wording from the same predicate the
feature itself uses, so copy and behaviour cannot drift.

## Verify before you write

Copy is a claim about behaviour, and a confident sentence about the wrong
behaviour is worse than no sentence. Before writing or editing a string,
read the module that owns the behaviour it describes — not a doc comment
about the module, which may predate the current behaviour. Where you cannot
confirm a claim, say less rather than guessing.

The same discipline applies doubled to store listings: a reviewer rejects a
claim they cannot reproduce, and a user one-stars a claim they cannot
reproduce. `fastlane/PUBLISHING.md` has the checklist.

## Accessibility labels follow the same rules

A screen reader label is copy. Build it from the same vocabulary the visible
text uses — ideally from the same shared constant or function — so the
spoken interface and the visual one cannot disagree. If a badge or icon
carries meaning visually, the accessible name spells that meaning out in
words.
