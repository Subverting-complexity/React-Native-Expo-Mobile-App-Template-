# Theming

This template uses a token-based theme system. Every visual value in the
app — colors, spacing, corner radii, typography, shadows, z-index layers,
and accessibility minimums — is defined once in `src/theme/` and consumed
by components through a React context hook. Changing the look of the app
means editing token files, not editing components.

## How it works

The theme is built from seven token modules, each in its own file under
`src/theme/`:

| Module         | File            | What it defines                                                                                                                                                           |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Colors**     | `colors.ts`     | Two palettes (`lightColors`, `darkColors`) sharing one `ColorPalette` interface — semantic names like `primary`, `textPrimary`, `surface`, not raw hex values.            |
| **Spacing**    | `spacing.ts`    | A numeric scale from `0.5` (2 px) to `24` (96 px).                                                                                                                        |
| **Radii**      | `radii.ts`      | Corner radius steps from `none` (0) to `full` (9999, pill shape).                                                                                                         |
| **Typography** | `typography.ts` | Font families, weight names, a size scale (`xs`–`4xl`), and semantic text variants (`body`, `heading`, `caption`, etc.) that map each role to a size, family, and weight. |
| **Shadows**    | `shadows.ts`    | Platform-aware shadow tokens (`none`–`xl`). iOS uses `shadowOffset` + `shadowOpacity`, Android uses `elevation`, and web uses `boxShadow`.                                |
| **Z-index**    | `zIndex.ts`     | Named stacking layers (`base`, `raised`, `dropdown`, `sticky`, `overlay`, `modal`, `toast`).                                                                              |
| **A11y**       | `a11y.ts`       | Accessibility design tokens (currently `minTouchTarget: 44`).                                                                                                             |

All seven modules are assembled into a single `ThemeTokens` object by the
`buildTheme` function in `src/theme/themes.ts`. Two pre-built instances —
`lightTheme` and `darkTheme` — are exported from there (and re-exported by
the `src/theme` barrel) for the provider to switch between. Keeping the
assembly in its own module lets `ThemeProvider` and `ThemeContext` import
the themes directly, so the barrel only re-exports and stays free of an
import cycle.

### Provider and hook

`ThemeProvider` (in `src/theme/ThemeProvider.tsx`) wraps the app root and
makes the current theme available to every descendant. It:

1. Reads the user's saved color-mode preference from storage (defaults to
   `'system'`).
2. Resolves `'system'` to the OS color scheme (`useColorScheme`).
3. Selects `lightTheme` or `darkTheme` accordingly.
4. Exposes `{ theme, colorMode, setColorMode }` through React context.

Components read the theme with the `useTheme` hook:

```ts
import { useTheme } from '@/theme';

function MyComponent() {
  const { theme, colorMode, setColorMode } = useTheme();
  // theme.colors.primary, theme.spacing[4], theme.radii.md, etc.
}
```

`useTheme` throws if called outside `<ThemeProvider>`, which catches
wiring mistakes immediately rather than producing silent undefined values.

### Color modes

There are three color-mode values: `'light'`, `'dark'`, and `'system'`.
The provider persists the choice under the key `@theme/colorMode` using
the injected `StorageAdapter` (async-storage on native, localStorage on
web). When the mode is `'system'`, the resolved scheme tracks the OS
preference and updates automatically if the user changes it in their
device settings.

On web, the template injects a pre-hydration `<style>` block (built by
`preHydrationTheme.ts`) that sets the page background to the dark or light
token before React mounts. This prevents the white flash that would
otherwise appear between the browser's default background and the first
themed render.

## Token reference

### Colors

The `ColorPalette` interface defines semantic slots, not raw values.
Components reference slots like `primary`, `textPrimary`, `surface`,
`onPrimary` — never hex strings. Each slot appears in both the light and
dark palette objects.

Semantic groups:

- **Surfaces** — `background`, `surface`, `surfaceVariant`
- **Text** — `textPrimary`, `textSecondary`, `textDisabled`, `textInverse`
- **Brand** — `primary` / `primaryVariant` / `onPrimary`, and the same
  triplet for `secondary`
- **Status** — `success`, `warning`, `error`, `info`, each with a matching
  `on*` foreground
- **Borders** — `border`, `borderSubtle`
- **Overlays** — `overlay` (tinted background), `scrim` (modal backdrop)

The `on*` tokens are the foreground colors that sit on top of their
corresponding fill. `onPrimary` is the text/icon color for a
`primary`-filled button, for example.

### Spacing

A multiplier-based scale where the key is the multiplier and the value is
the pixel count:

| Key   | Pixels |
| ----- | ------ |
| `0.5` | 2      |
| `1`   | 4      |
| `2`   | 8      |
| `3`   | 12     |
| `4`   | 16     |
| `5`   | 20     |
| `6`   | 24     |
| `8`   | 32     |
| `10`  | 40     |
| `12`  | 48     |
| `16`  | 64     |
| `20`  | 80     |
| `24`  | 96     |

Use `theme.spacing[4]` (16 px) rather than the number `16`.

### Radii

| Key    | Pixels |
| ------ | ------ |
| `none` | 0      |
| `xs`   | 2      |
| `sm`   | 4      |
| `md`   | 8      |
| `lg`   | 12     |
| `xl`   | 16     |
| `2xl`  | 24     |
| `full` | 9999   |

### Typography

The typography token has three layers:

1. **`families`** — font-family strings (`sans`, `mono`). The default sans
   is Atkinson Hyperlegible, loaded by `useAppFonts` in `src/hooks/`.
2. **`weights`** — named weights (`thin` through `extrabold`), each
   mapping to a numeric string (`'100'`–`'800'`).
3. **`sizes`** — a scale from `xs` (12 px) to `4xl` (36 px), each with
   `fontSize`, `lineHeight`, and `letterSpacing`.
4. **`variants`** — semantic text roles that combine a size, family, and
   weight into one token. Components reference a variant name rather than
   assembling font properties by hand.

| Variant      | Size  | Weight  | Typical use                       |
| ------------ | ----- | ------- | --------------------------------- |
| `display`    | `4xl` | bold    | Hero or splash text               |
| `title`      | `3xl` | bold    | Screen title                      |
| `heading`    | `2xl` | bold    | Section heading                   |
| `subheading` | `xl`  | bold    | Sub-section heading               |
| `body`       | `md`  | regular | Default paragraph text            |
| `bodySmall`  | `sm`  | regular | Secondary or supporting text      |
| `label`      | `sm`  | bold    | Button labels, form field labels  |
| `caption`    | `xs`  | regular | Timestamps, footnotes, fine print |

### Shadows

Shadow tokens are platform-specific. `theme.shadows.md` resolves to the
correct iOS, Android, or web shadow style for the current platform.
Levels run from `none` (no shadow) through `xs`, `sm`, `md`, `lg`, to
`xl` (deepest shadow).

### Z-index

Named stacking layers to prevent magic-number z-index wars:

| Key        | Value |
| ---------- | ----- |
| `base`     | 0     |
| `raised`   | 10    |
| `dropdown` | 100   |
| `sticky`   | 200   |
| `overlay`  | 300   |
| `modal`    | 400   |
| `toast`    | 500   |

## How components consume tokens

The `App*` components follow a consistent pattern: they accept props like
`variant`, `size`, and `tone`, and use lookup tables to map those props
to token keys. The component never contains a hardcoded color or pixel
value.

`AppButton` is the reference example. It defines two lookup tables:

- **`VARIANTS`** maps each variant name (`primary`, `secondary`, `outline`,
  `ghost`, `danger`) to the color-token keys for background, foreground,
  and border.
- **`SIZE_SPEC`** maps each size (`sm`, `md`, `lg`) to spacing-token keys
  for vertical padding, horizontal padding, and a typography-size key for
  the label.

At render time, the component reads the current theme via `useTheme()`,
looks up the token keys from the tables, and resolves them to concrete
values:

```ts
const { theme } = useTheme();
const spec = SIZE_SPEC[size];           // e.g. { paddingV: 3, paddingH: 5, text: 'md' }
const colors = resolveColors(theme, VARIANTS[variant]);

// Build styles from resolved tokens:
paddingVertical: theme.spacing[spec.paddingV],   // spacing key → pixel value
paddingHorizontal: theme.spacing[spec.paddingH],
borderRadius: theme.radii.md,
backgroundColor: colors.background,              // color key → hex value
```

This pattern means:

- Changing a token value in `src/theme/` automatically changes every
  component that uses it.
- Adding a new variant means adding a row to the lookup table, not
  modifying rendering logic.
- No raw values leak into component code.

## Extending the theme

### Add a new color token

1. Add the property to the `ColorPalette` interface in `colors.ts`.
2. Add a value for it in both `lightColors` and `darkColors`.
3. Run `npm run quality` — the contrast test in
   `src/theme/__tests__/contrast.test.ts` will verify that any new
   foreground/background pairing meets WCAG AA. If you add a new
   foreground-on-background combination, add a test case for it.

### Add a new spacing step

Add the key-value pair to both the `SpacingScale` interface and the
`spacing` object in `spacing.ts`. The key is the multiplier, the value
is the pixel count. Keep the scale ordered.

### Add a new typography variant

1. Add the variant name to the `TextVariantName` union in `typography.ts`.
2. Add its entry in the `variants` object, specifying a `size` (from
   `TextScale`), a `family` (from `FONT_FAMILIES`), and a `weight`.
3. The variant is now available through `theme.typography.variants` and
   through `AppText`'s `variant` prop.

### Add a new shadow level

Add the level name to the `ShadowLevel` type and add an entry in each of
the three platform-specific shadow objects (`iosShadows`,
`androidShadows`, `webShadows`) in `shadows.ts`.

### Swap the font family

The default font is Atkinson Hyperlegible, loaded by `useAppFonts` in
`src/hooks/useAppFonts.ts`. To switch to a different Google Font:

1. Install the new `@expo-google-fonts/*` package.
2. Update `useAppFonts.ts` to import and load the new font variants.
3. Update `FONT_FAMILIES` in `typography.ts` to reference the new font
   family strings.
4. If the new font supports different weights than regular (400) and bold
   (700), update the `variants` object to use the available weights.

See [New project from template](new-project-from-template.md) for a
walkthrough that includes font swapping as part of initial setup.

### Change the color palette

Edit the hex values in `lightColors` and/or `darkColors` in `colors.ts`.
The `ColorPalette` interface ensures both palettes stay in sync — the
compiler will flag any missing slot. After editing, run `npm run quality`
to confirm that every foreground/background pairing still meets WCAG AA
contrast ratios.

### Add a third color mode

The current system supports `light`, `dark`, and `system` (which resolves
to one of the first two based on the OS preference). To add a third
distinct palette (for example, a high-contrast mode):

1. Create a new `ColorPalette` object in `colors.ts`.
2. Extend the `ColorMode` type in `ThemeContext.ts` to include the new
   mode name.
3. Update `ThemeProvider.tsx` to select the new palette when the new mode
   is active.
4. Update the pre-hydration CSS builder in `preHydrationTheme.ts` if the
   new mode should have its own web background.

## Contrast verification

The theme includes built-in contrast checking to prevent accessibility
regressions. The utilities in `src/theme/contrast.ts` compute WCAG 2.1
contrast ratios between any two hex colors:

```ts
import { contrastRatio, meetsAA } from '@/theme';

contrastRatio('#212529', '#FFFFFF'); // 16.75
meetsAA('#212529', '#FFFFFF'); // true (≥ 4.5:1)
meetsAA('#4263EB', '#F8F9FA', 3); // true (≥ 3:1, for large text/icons)
```

The test suite (`src/theme/__tests__/contrast.test.ts`) runs these checks
against every foreground/background pairing the theme promises, so a token
edit that breaks contrast fails CI automatically. See
[Accessibility checklist](accessibility-checklist.md) for the full list of
verified pairings and the WCAG thresholds they are held to.
