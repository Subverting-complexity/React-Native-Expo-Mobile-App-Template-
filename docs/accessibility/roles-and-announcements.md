# Accessibility: semantic roles & screen-reader announcements

Two small primitives in `src/a11y` keep screen-reader behaviour consistent and
free of magic strings. This page documents the conventions; the broader
theming + a11y guide is tracked separately.

## Semantic role conventions (`A11Y_ROLES`)

React Native's `accessibilityRole` takes a wide union of string literals.
Rather than scatter those raw strings across components, every `App*`
component references a named token from `A11Y_ROLES` — the single source of
truth for which role we use where, the same way colours and spacing come from
the theme.

```ts
import { A11Y_ROLES } from '@/a11y';

<AppPressable accessibilityRole={A11Y_ROLES.button} accessibilityLabel="Save" … />
```

| Token               | Role value | Use it for                                                                     |
| ------------------- | ---------- | ------------------------------------------------------------------------------ |
| `A11Y_ROLES.header` | `header`   | A screen or section title users can jump between with heading navigation.      |
| `A11Y_ROLES.button` | `button`   | Anything that performs an action on activation (submit, toggle, open).         |
| `A11Y_ROLES.link`   | `link`     | Navigation to another route or an external URL. In-place actions stay buttons. |
| `A11Y_ROLES.alert`  | `alert`    | A message that demands attention as soon as it appears (toast, inline error).  |

`AppButton` already consumes `A11Y_ROLES.button`; new interactive components
should follow the same pattern instead of inlining the role string.

## Announcements (`announceForAccessibility`)

`announceForAccessibility(message, options?)` is the single entry point for
programmatic screen-reader speech (VoiceOver / TalkBack). Use it for events
that change state **without moving focus** — a toast appearing, a filter
applied, a row removed, an async action finishing.

```ts
import { announceForAccessibility } from '@/a11y';

announceForAccessibility('Item deleted');
announceForAccessibility('Draft saved', { queue: true }); // iOS: don't interrupt
```

- Blank or whitespace-only messages are ignored, so a missing string never
  produces a spurious or silent announcement.
- `{ queue: true }` is honoured on iOS (queues behind current speech) and falls
  back to an immediate announcement where the queued API is unavailable.

## Toasts as alerts

A toast is the canonical `alert`: render it with `accessibilityRole`
`A11Y_ROLES.alert` **and** announce its text so it is spoken without the user
having to find and focus it. On Android, also set
`accessibilityLiveRegion="assertive"`.

```tsx
// Pattern for the toast component and screen flows:
<View accessibilityRole={A11Y_ROLES.alert} accessibilityLiveRegion="assertive">
  <AppText>{message}</AppText>
</View>;
// on show:
announceForAccessibility(message);
```
