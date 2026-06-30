# React Native / Expo Mobile App Template

A project-agnostic scaffold for React Native apps built on **Expo SDK 56**, **React 19**, and the **New Architecture**. Ships with a design-token theme system, WCAG 2.1 AA accessibility, a 20-component library, Zustand state management, and a Windows-first build toolchain.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Subverting-complexity/React-Native-Expo-Mobile-App-Template-.git my-app
cd my-app
npm ci

# 2. Configure your Expo account
#    Edit app.config.ts: set `owner` and `projectId` to your values.
#    See docs/expo-account.md for details.

# 3. Run
npm start          # Expo dev server (press i/a/w for platform)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Browser
```

## Start a New Project from This Template

1. Click **Use this template** on GitHub (or clone manually).
2. Find-and-replace the placeholder values:
   - `app.config.ts` &mdash; `owner`, `projectId`, `name`, `slug`, `scheme`, `bundleIdentifier`, `package`
   - `package.json` &mdash; `name`
3. Run `npm ci` to install dependencies.
4. Delete the example store (`src/state/exampleStore.ts`) and gallery sections you don't need.
5. Start building your screens in `app/`.

## Directory Layout

```
app/                    Expo Router file-based routing
  (tabs)/               Tab navigator group (Home, Settings)
  _layout.tsx           Root layout with providers

src/
  theme/                Design tokens (colors, spacing, radii, typography, shadows, z-index)
  components/           Reusable App* component library (barrel: index.ts)
  a11y/                 Accessibility context, provider, role constants
  state/                Zustand stores (injectable-deps factory pattern)
  storage/              Platform-aware persistence (AsyncStorage / localStorage)
  hooks/                Shared React hooks
  gallery/              Component showcase screen and demo sections
  build/                Build and EAS configuration helpers

scripts/                PowerShell (.ps1) + double-click .cmd wrappers
docs/                   Project and accessibility documentation
.decisions/             Locked architecture decisions
.github/workflows/      CI pipeline
```

## Component Library

All components use the `App` prefix and consume theme tokens via `useTheme()`. Import from the barrel:

```ts
import { AppButton, AppText, AppCard } from '@/components';
```

| Component                  | Purpose                                                  |
| -------------------------- | -------------------------------------------------------- |
| `AppButton`                | Primary action button with `variant`/`size`/`tone` props |
| `AppText`                  | Themed text with typography scale support                |
| `AppTextInput`             | Styled text input with label and error states            |
| `AppCard`                  | Content container with shadow and radius tokens          |
| `AppChip` / `AppChipGroup` | Selection chips (single and group)                       |
| `AppBadge`                 | Status/count indicator                                   |
| `AppIconButton`            | Icon-only pressable with a11y label                      |
| `AppLinkButton`            | Navigation link styled as a button                       |
| `AppBackButton`            | Navigation back action                                   |
| `AppPressable`             | Base pressable with 44x44 min touch target enforcement   |
| `AppListItem`              | List row with consistent padding and separators          |
| `AppSection`               | Grouped content section with header                      |
| `AppScreenContainer`       | Safe-area screen wrapper with scroll support             |
| `AppSpinner`               | Loading indicator                                        |
| `AppProgressBar`           | Determinate progress bar                                 |
| `AppLoadingScreen`         | Full-screen loading state                                |
| `AppEmptyState`            | Empty/zero-data placeholder                              |
| `AppToast`                 | Temporary notification banner                            |
| `AppErrorBoundary`         | Error boundary with fallback UI                          |

## Theming

All visual values are defined once in `src/theme/` and consumed via the `useTheme()` hook:

```ts
const { theme, mode, setMode } = useTheme();

// Access tokens
theme.colors.primary; // Color palette
theme.spacing.md; // Spacing scale
theme.radii.lg; // Border radii
theme.typography.body; // Font styles
theme.shadows.card; // Shadow definitions
```

- **Light and dark modes** with automatic system detection
- **Atkinson Hyperlegible** font for enhanced readability
- Automated **contrast ratio checks** tested against every foreground/background pairing
- Tokens: colors, spacing, radii, typography, shadows, z-index

Re-skinning the app means editing token files, not component files.

## Accessibility

WCAG 2.1 Level AA baseline:

- Automated contrast ratio verification in `src/theme/contrast.ts`
- 44x44 minimum touch targets enforced by `AppPressable`
- Roles and announcements via `A11yProvider` and `useA11y()`
- Font scaling with safe maximum to prevent layout breakage
- Reduce-motion support
- ESLint plugin (`eslint-plugin-react-native-a11y`) for static analysis

See [docs/accessibility-checklist.md](docs/accessibility-checklist.md) for the full checklist.

## State Management

- **React Context** for cross-cutting concerns: `ThemeProvider` (theme mode + tokens), `A11yProvider` (reduce-motion, font scale)
- **Zustand** for domain state using the injectable-deps factory pattern

```ts
// Stores declare their external dependencies and accept them via `deps`
const useMyStore = createMyStore({
  storage: asyncStorageAdapter,
});
```

Production wires real adapters; tests pass mocks. See `src/state/exampleStore.ts` for the reference implementation.

## Scripts

PowerShell scripts with `.cmd` double-click wrappers for Windows:

| Script                             | npm command              | Purpose                             |
| ---------------------------------- | ------------------------ | ----------------------------------- |
| `QualityGate.ps1`                  | `npm run check`          | Lint + typecheck + test + coverage  |
| `BumpBuildNumber.ps1`              | `npm run bump`           | Increment iOS/Android build numbers |
| `VerifyExpoAccount.ps1`            | `npm run verify:expo`    | Confirm EAS account configuration   |
| `DeployiOSTestFlight.ps1`          | `npm run deploy:ios`     | Build and submit to TestFlight      |
| `DeployAndroidPlayStore.ps1`       | `npm run deploy:android` | Build and submit to Play Store      |
| `BuildAndRunIOSDevelopment.ps1`    | &mdash;                  | Dev client build for iOS            |
| `BuildAndDeployDevModeAndroid.ps1` | &mdash;                  | Dev client build for Android        |
| `LaunchWeb.ps1`                    | &mdash;                  | Start web dev server                |

## CI Pipeline

GitHub Actions runs the quality gate on every push to `main` and on pull requests:

- **Type-check** (`tsc --noEmit`)
- **Lint** (ESLint with Expo + Prettier + a11y configs)
- **Format check** (Prettier)
- **Test with coverage** (Jest + React Native Testing Library, 70% global threshold)

## Build Profiles

EAS Build profiles in `eas.json`:

| Profile       | Purpose                                           |
| ------------- | ------------------------------------------------- |
| `development` | Dev client with internal distribution             |
| `preview`     | Internal testing builds                           |
| `production`  | Store-ready builds with auto-incrementing version |

## Tech Stack

| Layer      | Choice                                       |
| ---------- | -------------------------------------------- |
| Framework  | Expo SDK 56 (New Architecture)               |
| Language   | TypeScript 6 (strict mode)                   |
| Navigation | Expo Router (file-based, typed routes)       |
| UI         | Custom component library (20 components)     |
| Theming    | Design tokens + `useTheme()` hook            |
| State      | Zustand 5 (injectable-deps factory)          |
| Storage    | Platform-aware (AsyncStorage / localStorage) |
| Testing    | Jest + React Native Testing Library          |
| Linting    | ESLint 9 + Prettier + a11y plugin            |
| CI         | GitHub Actions                               |
| Build      | EAS Build + EAS Submit                       |
| Font       | Atkinson Hyperlegible (Google Fonts)         |

## License

MIT
