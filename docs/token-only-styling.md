# Token-Only Styling

Every visual value in the app — colors, font sizes, spacing, and border
radii — is defined once in `src/theme` and consumed via `useTheme()`.
Two custom ESLint rules enforce this at lint time so hardcoded values
cannot slip into component or screen code.

## Rules

### `theme-tokens/no-hardcoded-colors`

Flags string literals that look like color values on style properties:

- Hex codes: `#fff`, `#FF5733`, `#00000080`
- Color functions: `rgb(...)`, `rgba(...)`, `hsl(...)`, `hsla(...)`
- Named CSS colors: `red`, `white`, `cornflowerblue`, etc.

The keyword `transparent` is allowed — it is a universal constant, not a
brand-specific value.

**Checked properties:** `color`, `backgroundColor`, `borderColor` (and
all directional variants), `tintColor`, `shadowColor`, `textShadowColor`,
`textDecorationColor`, `overlayColor`, `selectionColor`,
`placeholderTextColor`, `underlineColorAndroid`.

### `theme-tokens/no-hardcoded-styles`

Flags numeric literals on visual style properties that should come from
the theme's spacing, typography, or radii scales:

- **Typography:** `fontSize`, `lineHeight`, `letterSpacing`
- **Spacing:** `margin`, `padding` (and all directional variants), `gap`,
  `rowGap`, `columnGap`, `top`, `right`, `bottom`, `left`
- **Radii:** `borderRadius` (and all corner variants)

The value `0` is always allowed — it means "none/off" and is structural,
not a design decision.

**Not checked** (behavioral, not token-driven): `opacity`, `flex`,
`flexGrow`, `flexShrink`, `zIndex`, `elevation`, `aspectRatio`,
`borderWidth`, `width`, `height`, and dimension constraints.

## Where the rules apply

The rules run on `app/**/*.{ts,tsx}` and `src/**/*.{ts,tsx}`, with three
exclusions:

| Path | Why excluded |
|------|--------------|
| `src/theme/**` | Token definition files — raw values belong here |
| `**/__tests__/**` | Test files mock styles for assertions |
| `**/*.test.{ts,tsx}` | Same as above |

## Escape hatch

For the rare case where a hardcoded value is genuinely necessary (a
platform workaround, a third-party API requirement), suppress the rule
on that line with a standard ESLint disable comment:

```ts
// eslint-disable-next-line theme-tokens/no-hardcoded-colors
const overlay = { backgroundColor: '#000000' };

// eslint-disable-next-line theme-tokens/no-hardcoded-styles
const legacy = { fontSize: 13 };
```

Prefer this over disabling the rule for an entire file. If you find
yourself suppressing repeatedly, consider whether the value should be a
new token in `src/theme` instead.

## How to fix a violation

Replace the hardcoded value with its theme token equivalent:

```ts
// Before (fails lint)
const s = { color: '#4263EB', padding: 16, borderRadius: 8 };

// After (passes lint)
const { theme } = useTheme();
const s = {
  color: theme.colors.primary,
  padding: theme.spacing[4],
  borderRadius: theme.radii.md,
};
```
