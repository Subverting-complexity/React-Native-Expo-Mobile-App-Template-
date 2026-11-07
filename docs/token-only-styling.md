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
`placeholderTextColor`, `underlineColorAndroid`. The rule also finds a
color inside the shorthand strings `boxShadow`, `textShadow`, `filter`,
`background`, `backgroundImage`, `outline` and `border` (and its sides).

The rule also checks the `color` prop on any JSX element, such as an icon:
`<Ionicons color="#fff" />` fails.

### `theme-tokens/no-hardcoded-styles`

Flags numeric literals on visual style properties that should come from
the theme's spacing, typography, radii, shadow, or z-index scales:

- **Typography:** `fontSize`, `lineHeight`, `letterSpacing`
- **Spacing:** `margin`, `padding` (and all directional variants), `gap`,
  `rowGap`, `columnGap`, `top`, `right`, `bottom`, `left`, `start`, `end`
- **Radii:** `borderRadius` (and all corner variants)
- **Shadows:** `shadowRadius`, and the `width` and `height` of `shadowOffset`
- **Layering:** `zIndex` (tokens in `src/theme/zIndex.ts`)
- **Borders:** `borderWidth` and each side's width (tokens in
  `src/theme/borderWidths.ts`)
- **Opacity:** `opacity` (tokens in `src/theme/opacity.ts`)

The value `0` is always allowed. It means "none/off" and is structural,
not a design decision. An `opacity` of `1` is also allowed, because it
means "fully visible".

`fontWeight` fails with any literal, string or number, because weights
come from the type variants in `theme.typography.variants`.

The rule also checks a numeric `size` prop on any JSX element, such as
`<Ionicons size={24} />`. A string size, such as `size="large"`, is a
named variant and passes.

**Not checked** (behavioral, not token-driven): `flex`, `flexGrow`,
`flexShrink`, `elevation`, `aspectRatio`, `width`, `height`, and dimension
constraints.

### What counts as a literal

Both rules look through an expression to the literal values it can
produce:

- Both branches of a conditional: `active ? '#fff' : '#000'`
- Both sides of `||`, `&&` and `??`: `custom ?? 12`
- A template literal with no expressions: `` `#abc` ``
- A negative number: `-8`

## Where the rules apply

The rules run on `app/**/*.{ts,tsx}` and `src/**/*.{ts,tsx}`, with four
exclusions:

| Path                 | Why excluded                                                     |
| -------------------- | ---------------------------------------------------------------- |
| `src/theme/**`       | Token definition files. Raw values belong here                   |
| `src/api/**`         | API payloads use keys such as `start`, `end` and `color` as data |
| `**/__tests__/**`    | Test files mock styles for assertions                            |
| `**/*.test.{ts,tsx}` | Same as above                                                    |

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
