# Accessibility checklist

This template targets **WCAG 2.1 Level AA**. Accessibility is built into the
shared theme and component contracts so that screens inherit it by default
rather than re-implementing it. This document records the colour-contrast
audit and gives a reusable checklist to run before shipping any new screen.

## Colour contrast — AA audit

Every colour in the theme is defined once in `src/theme/colors.ts`. The audit
below verifies that each foreground/background pairing the theme actually
promises meets the relevant WCAG 2.1 threshold:

- **Normal text — 4.5:1** (WCAG 1.4.3)
- **Large text (≥18pt, or ≥14pt bold) and non-text UI — 3:1** (WCAG 1.4.3 /
  1.4.11)

These ratios are enforced automatically by
`src/theme/__tests__/contrast.test.ts`, which recomputes them from the live
palettes on every test run. Editing a token to a value that breaks AA fails
the suite, so the audit can never silently drift out of date.

### Pairings verified (light + dark palettes)

| Pairing                                                                                                         | Threshold | Use                                                                                                 |
| --------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `textPrimary` / `textSecondary` on `background`, `surface`, `surfaceVariant`                                    | 4.5:1     | Body and secondary text, and placeholder text, on every surface                                     |
| `onPrimary` / `onSecondary` on their base + variant                                                             | 4.5:1     | Filled primary/secondary button, chip and badge labels                                              |
| `onSuccess` / `onWarning` / `onError` / `onInfo` on their base                                                  | 4.5:1     | Filled status button, toast and badge labels                                                        |
| `textInverse` on `textSecondary`                                                                                | 4.5:1     | The solid neutral badge label                                                                       |
| `primary` / `secondary` / `success` / `warning` / `error` / `info` on `background`, `surface`, `surfaceVariant` | 4.5:1     | Intent colours drawn as text: text tones, links, outline and ghost buttons, soft and outline badges |

The intent colours are the `base` colours in `INTENT_COLORS`. They are held to
the text bar, not only the 3:1 bar for icons and fills, because the components
also draw them as text. A value that clears 4.5:1 also clears 3:1.

Every theme in `THEMES`, in light and dark mode, passes all of the above.

### Adjustments made during the audits

The initial audit changed four tokens in the light palette. The dark palette
already passed.

| Token           | Before    | After     | Reason                                                                                                |
| --------------- | --------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `textSecondary` | `#6C757D` | `#5C636A` | Failed 4.5:1 on `surface` (4.45:1) and `surfaceVariant` (4.22:1)                                      |
| `success`       | `#2F9E44` | `#1E7E34` | White label only reached 3.45:1; now 5.14:1                                                           |
| `warning`       | `#E67700` | `#D9760A` | Allows a readable dark label and clears 3:1 as an accent                                              |
| `onWarning`     | `#FFFFFF` | `#1A1200` | White on amber tops out near 3:1; dark ink on amber is the legible pairing (matches the dark palette) |

A later audit held the intent colours to 4.5:1 as text. It changed four more
tokens in the Standard light palette.

| Token            | Before    | After     | Reason                                                                                               |
| ---------------- | --------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `warning`        | `#D9760A` | `#A85700` | As text it reached only 3.21:1 on `background` and 2.88:1 on `surfaceVariant`; now 5.21:1 and 4.69:1 |
| `onWarning`      | `#1A1200` | `#FFFFFF` | Dark ink is not readable on the darker amber; white on it is 5.21:1                                  |
| `primary`        | `#4263EB` | `#3B5BDB` | As text it reached 4.48:1 on `surfaceVariant` (the soft badge); now 5.10:1                           |
| `primaryVariant` | `#3B5BDB` | `#364FC7` | Keeps the variant one step darker than `primary`                                                     |

### Intentional exemptions

Two groups of tokens are deliberately **not** held to the contrast bars
above, in line with WCAG:

- **`textDisabled`** — WCAG 1.4.3 exempts text and images of text that are
  part of an inactive (disabled) UI component. Disabled controls must still be
  visually distinguishable, but are not required to meet 4.5:1. Placeholder
  text is not exempt, so `AppTextInput` draws it in `textSecondary`.
- **`border` / `borderSubtle`** — these are subtle, decorative dividers and
  container outlines. WCAG 1.4.11 exempts purely decorative elements. A border
  must never be the _sole_ means of identifying or operating a control; the
  App\* components convey state through label, role, background, and focus
  treatment, not the border alone. When a control needs a perceivable boundary
  (for example a focused input), it uses a higher-contrast accent token, not
  `border`.

## Automated accessibility linting

Accessibility mistakes that are visible in the source are caught by ESLint
before review. The `eslint-plugin-react-native-a11y` rules run as part of
`npm run lint`, which `npm run quality` and CI both invoke — so a violation
fails the gate and blocks merge, not just a local check.

The gated rules (configured in `eslint.config.js`, scoped to `app/` and `src/`
UI source, test files excluded) are:

- **Valid accessibility props when present** — an `accessibilityRole`,
  `accessibilityState`, `accessibilityValue`, `accessibilityActions`,
  `accessibilityLiveRegion`, `accessibilityIgnoresInvertColors`, or
  `importantForAccessibility` prop must use a value the platform understands.
  These fire only when the prop is present, so they add no noise to elements
  that omit it.
- **Announceable interactive elements** — every touchable / `TextInput` must
  carry at least one descriptor (a role, a label plus hint, or accessibility
  actions) so assistive tech can describe it.
- **No nested touchables** — a clickable element inside an `accessible`
  container is rejected, because the container swallows one of the targets.

The "require an accessibility prop on everything" rules are intentionally left
off: the `App*` components already force `accessibilityLabel` and
`accessibilityRole` at the type level, and demanding a hint on every labelled
element is noisy without improving the experience. The gate is verified by
`src/__tests__/a11yLint.test.ts`, which lints fixtures through the real config.

## Per-screen accessibility checklist

Run through this before merging any screen or feature:

### Colour & contrast

- [ ] Text uses theme `text*` tokens on a theme surface — never a hardcoded
      colour. (Re-skinning is a token edit, not a component edit.)
- [ ] Information is never conveyed by colour alone (pair colour with text,
      an icon, or a shape).
- [ ] Any new colour pairing not covered by the audit table is checked with
      `contrastRatio` / `meetsAA` from `src/theme/contrast.ts`.

### Touch targets

- [ ] Interactive elements are at least 44×44 px (use `AppPressable`).

### Screen readers

- [ ] Every interactive element has an `accessibilityLabel` and an
      appropriate `accessibilityRole`.
- [ ] Decorative images are hidden from assistive tech
      (`accessibilityElementsHidden` / `importantForAccessibility="no"` /
      `aria-hidden`).
- [ ] Status messages and toasts announce with `role="alert"` / live regions.
- [ ] Focus order is logical and grouping reflects on-screen structure.

### Dynamic type & motion

- [ ] Text scales with the OS font-size setting (within the capped
      multiplier) and the layout stays legible.
- [ ] Animations respect the OS _reduce motion_ setting.

### Verification

- [ ] `npm run quality` passes (includes the contrast test and the a11y lint
      rules described above).
- [ ] Spot-checked with a screen reader (VoiceOver / TalkBack) on at least one
      flow.
