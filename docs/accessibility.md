# Accessibility

This template targets **WCAG 2.1 Level AA**. Rather than treating
accessibility as a per-screen concern, it builds the foundations into the
shared theme and component contracts so that screens inherit them by
default. This document explains how those foundations work. For the
contrast audit, lint rules, and a per-screen review checklist, see the
[Accessibility checklist](accessibility-checklist.md).

## Architecture overview

Accessibility is handled by two cooperating systems:

1. **Theme tokens** (`src/theme/`) define the visual floor — color
   contrast, minimum touch-target size, and font scaling limits. These are
   static, color-mode-independent values that components read through
   `useTheme()`.

2. **A11y context** (`src/a11y/`) tracks runtime accessibility state — the
   user's reduce-motion preference and the global font-scale cap. It
   provides this state through `useA11y()` and `useReduceMotion()`.

Both are mounted at the app root (`<A11yProvider>` alongside
`<ThemeProvider>`) so every component in the tree has access.

## A11yProvider

`A11yProvider` (in `src/a11y/A11yProvider.tsx`) does two things when it
mounts:

1. **Installs the global font-scale cap.** It calls
   `applyGlobalFontScaleCap()`, which sets
   `maxFontSizeMultiplier` on React Native's `Text` and `TextInput` as a
   default prop. The cap is 1.5 — large enough to honour meaningful
   accessibility scaling, small enough to prevent layout breakage. A
   component can override this per-instance if it needs to opt out.

2. **Tracks the OS reduce-motion preference.** It subscribes to the
   `reduceMotionChanged` event and exposes the current value through
   context.

Components consume the context through two hooks:

- **`useA11y()`** — returns the full context value:
  `{ reduceMotion: boolean, maxFontSizeMultiplier: number }`.
- **`useReduceMotion()`** — a convenience wrapper that returns just the
  boolean. Use it to skip or shorten animations when the user has asked
  for reduced motion.

```ts
import { useReduceMotion } from '@/a11y';

function FadeIn({ children }) {
  const reduceMotion = useReduceMotion();
  // Skip the animation entirely when reduce-motion is on:
  const duration = reduceMotion ? 0 : 300;
  // ...
}
```

## Font scaling

The template supports Dynamic Type (iOS) and font scaling (Android) up to
a multiplier of 1.5. This is applied globally through `maxFontScale.ts`,
which patches `Text.defaultProps.maxFontSizeMultiplier` so every text
element in the app respects the cap without any per-component wiring.

The cap value (`MAX_FONT_SIZE_MULTIPLIER = 1.5`) is the single source of
truth — it is both applied as the global default and exposed through the
a11y context so components that need to know the cap can read it without
importing the constant directly.

A component that needs uncapped scaling (rare — an accessibility-focused
settings screen, for example) can set `maxFontSizeMultiplier={null}` on
its own `Text` element to override the global default.

## Touch targets

Every interactive element must be at least 44 by 44 points — the
WCAG 2.5.5 (AAA) and Apple HIG minimum. This floor is defined as a theme
token (`theme.a11y.minTouchTarget`) and enforced by `AppPressable`, the
base pressable component that all interactive `App*` components build on.

`AppPressable` enforces two things at the type level:

- A `minWidth` and `minHeight` of 44 points (from the token).
- A required `accessibilityLabel` prop — a pressable element cannot be
  created without a screen-reader name.

Components like `AppButton`, `AppIconButton`, and `AppLinkButton` extend
`AppPressable`, so they inherit the touch-target floor and the label
requirement automatically.

## Semantic roles

React Native's `accessibilityRole` accepts a wide set of string literals.
Rather than scattering those strings across the codebase, the template
defines a set of named role constants in `src/a11y/roles.ts`:

| Constant                  | Value         | Use it for                              |
| ------------------------- | ------------- | --------------------------------------- |
| `A11Y_ROLES.header`       | `header`      | Screen or section titles                |
| `A11Y_ROLES.button`       | `button`      | Actions (submit, toggle, open)          |
| `A11Y_ROLES.link`         | `link`        | Navigation to another route or URL      |
| `A11Y_ROLES.alert`        | `alert`       | Messages needing immediate attention    |
| `A11Y_ROLES.progressbar`  | `progressbar` | Loading or progress indicators          |

Components reference these constants (`A11Y_ROLES.button`) rather than
inline strings (`'button'`), so a typo is caught by the compiler instead
of silently shipping an unannounced control.

For detailed conventions and code examples, see
[Roles and announcements](accessibility/roles-and-announcements.md).

## Programmatic announcements

`announceForAccessibility` (in `src/a11y/announce.ts`) is the single entry
point for speaking a message through VoiceOver or TalkBack. Use it for
state changes that happen without moving focus — a toast appearing, a
filter applied, a row deleted, an async operation completing.

```ts
import { announceForAccessibility } from '@/a11y';

announceForAccessibility('Item saved');
announceForAccessibility('3 results found', { queue: true });
```

The function guards against blank messages (no-op on empty or
whitespace-only input) and supports an iOS-specific `queue` option that
queues the message behind current speech rather than interrupting it.

For the toast pattern and more examples, see
[Roles and announcements](accessibility/roles-and-announcements.md).

## Color contrast

Every foreground/background pairing the theme promises is verified against
WCAG 2.1 thresholds:

- **4.5:1** for normal body text (WCAG 1.4.3).
- **3:1** for large text and non-text UI elements like icons and focus
  rings (WCAG 1.4.3 / 1.4.11).

The utilities that compute these ratios (`hexToRgb`, `relativeLuminance`,
`contrastRatio`, `meetsAA`) live in `src/theme/contrast.ts` and are
exported for runtime use. They also power the automated contrast test
(`src/theme/__tests__/contrast.test.ts`), which runs on every `npm run
quality` invocation — editing a color token to a value that breaks AA
contrast fails the test suite.

For the full list of verified pairings, the adjustments made to meet the
thresholds, and the intentional exemptions (disabled text, decorative
borders), see the [Accessibility checklist](accessibility-checklist.md).

## ESLint accessibility rules

The `eslint-plugin-react-native-a11y` plugin runs as part of `npm run
lint` (and therefore `npm run quality` and CI). It catches common
accessibility mistakes in source code:

- Invalid values for accessibility props.
- Interactive elements missing a screen-reader descriptor (role, label, or
  actions).
- Nested touchables (where the outer container swallows one of the tap
  targets).

Rules that require an accessibility prop on every element are intentionally
off — the `App*` components already enforce labels and roles at the type
level, so a blanket "add a label to everything" rule would add noise
without improving the experience.

## Putting it together

When building a new screen or component:

1. Use `App*` components (`AppButton`, `AppText`, `AppPressable`, etc.)
   for interactive and text elements — they inherit the touch-target floor,
   roles, and labels.
2. Read all visual values from `useTheme()` — never hardcode a color,
   spacing value, or font size.
3. Check `useReduceMotion()` before running animations, and skip or
   shorten them when it returns `true`.
4. Use `announceForAccessibility()` for state changes that do not move
   focus.
5. Run `npm run quality` to verify contrast, lint rules, and type safety.
6. Walk through the [per-screen checklist](accessibility-checklist.md) for
   anything the automated checks cannot catch (focus order, screen-reader
   spot check).
