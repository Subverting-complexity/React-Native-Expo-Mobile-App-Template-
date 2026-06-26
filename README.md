# Expo Mobile App Template

A project-agnostic React Native / Expo starter with a Windows-first
toolchain. It ships an opinionated design-token system, a generic
`App*` component library, accessibility baked in to WCAG 2.1 AA, and
double-click PowerShell scripts for every build, deploy, and quality
task.

The whole app is re-skinnable by editing tokens in [`src/theme/`](src/theme) —
components never hardcode a color, size, or spacing value. See the
[theming guide](docs/theming.md) for the full story.

## Prerequisites

| Tool            | Version         | Notes                                                |
| --------------- | --------------- | ---------------------------------------------------- |
| **Node.js**     | 20 LTS or newer | Ships with `npm`. Expo SDK 56 needs Node ≥ 20.19.    |
| **npm**         | 10 or newer     | Bundled with Node.                                   |
| **Git**         | any recent      | —                                                    |
| **Expo Go** app | latest          | On a physical device, to run without a native build. |
| **PowerShell**  | 5.1+ (Windows)  | For the `scripts/` tooling and `.cmd` wrappers.      |

A simulator/emulator is optional — **Xcode** (iOS, macOS only) or
**Android Studio** (Android). You can also run everything in the
browser via `npm run web`.

> Cloud builds and store submissions go through **EAS** and require an
> Expo account. That is a separate, human setup step — see
> [`docs/expo-account.md`](docs/expo-account.md). You do **not** need it
> to run the app locally.

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (Metro + Expo)
npm start
```

Then open the app one of these ways:

- **Physical device** — scan the QR code in the terminal with the
  **Expo Go** app (Android) or the Camera app (iOS).
- **iOS simulator** — press `i` in the terminal, or run `npm run ios`.
- **Android emulator** — press `a` in the terminal, or run `npm run android`.
- **Web browser** — press `w`, or run `npm run web`.

That is enough to boot the app. The home screen lives in
[`app/(tabs)/index.tsx`](<app/(tabs)/index.tsx>); a full component
showcase is on the **Gallery** route ([`app/gallery.tsx`](app/gallery.tsx)).

### Optional: environment variables

Only needed for EAS cloud builds. Copy the example file and fill in a
token:

```bash
cp .env.example .env   # then set EXPO_TOKEN
```

`.env` is gitignored. The deploy/verify scripts load it automatically.
See [`.env.example`](.env.example) and [`docs/expo-account.md`](docs/expo-account.md).

## Scripts

### npm scripts (cross-platform)

| Command                  | What it does                                                 |
| ------------------------ | ------------------------------------------------------------ |
| `npm start`              | Start the Expo dev server (Metro).                           |
| `npm run android`        | Start and open on an Android emulator/device.                |
| `npm run ios`            | Start and open on an iOS simulator/device.                   |
| `npm run web`            | Start and open in the browser.                               |
| `npm run lint`           | ESLint over the whole project.                               |
| `npm run format`         | Prettier — rewrite all files.                                |
| `npm run format:check`   | Prettier — check only, no writes.                            |
| `npm run typecheck`      | TypeScript `tsc --noEmit` (strict).                          |
| `npm test`               | Jest test suite.                                             |
| `npm run quality`        | Lint + typecheck + tests with coverage. The pre-commit gate. |
| `npm run check`          | Full **strict** quality gate via PowerShell (what CI runs).  |
| `npm run build:dev`      | EAS build, `development` profile.                            |
| `npm run build:preview`  | EAS build, `preview` profile.                                |
| `npm run build:prod`     | EAS build, `production` profile.                             |
| `npm run submit:ios`     | EAS submit to App Store Connect.                             |
| `npm run submit:android` | EAS submit to Google Play.                                   |
| `npm run verify:expo`    | Report the configured Expo account and token state.          |
| `npm run deploy:ios`     | Build + submit to TestFlight (PowerShell).                   |
| `npm run deploy:android` | Build + submit to Play Store (PowerShell).                   |
| `npm run bump`           | Increment the build number (PowerShell).                     |

### PowerShell scripts (`scripts/`, Windows-first)

Every `.ps1` has a matching `.cmd` wrapper you can **double-click** — it
runs with an ExecutionPolicy bypass, so nothing depends on the machine's
script policy. See [`scripts/README.md`](scripts/README.md) for full
detail; the highlights:

| Script (`.ps1` / `.cmd`)       | Purpose                                                                |
| ------------------------------ | ---------------------------------------------------------------------- |
| `QualityGate`                  | Single orchestrator: format, lint, typecheck, test, bundle smoke test. |
| `LaunchWeb`                    | Start the app in the browser.                                          |
| `VerifyExpoAccount`            | Confirm you are building under the correct Expo account.               |
| `BumpBuildNumber`              | Increment iOS `buildNumber` / Android `versionCode`.                   |
| `BuildAndRunIOSDevelopment`    | Local iOS development build + run.                                     |
| `BuildAndDeployDevModeAndroid` | Android development build + deploy to a device.                        |
| `DeployiOSTestFlight`          | Production build + submit to TestFlight.                               |
| `DeployAndroidPlayStore`       | Production build + submit to the Play Store.                           |

The quality gate has two modes: **local** (default, auto-fixes
formatting/lint then verifies) and **ci** (strict, no fixes). Run the
strict gate with `npm run check`, or the auto-fixing one by
double-clicking `scripts/QualityGate.cmd`.

## Project structure

```
.
├── app/                  Expo Router screens (file-based routing)
│   ├── (tabs)/           Tab group: index (home) + settings
│   ├── gallery.tsx       Component showcase route
│   └── _layout.tsx       Root layout (providers wired here)
├── assets/               Placeholder icon, adaptive icon, splash, favicon
├── src/
│   ├── theme/            Design tokens — the single source of truth
│   ├── components/       Generic, prop-driven App* component library
│   ├── a11y/             Accessibility context, roles, announcements
│   ├── state/            Zustand stores (injectable-deps factory pattern)
│   ├── storage/          Platform-aware persistence (web / native)
│   ├── hooks/            Shared React hooks
│   ├── gallery/          Showcase screen + per-category demo sections
│   └── test/             Test utilities and helpers
├── scripts/              PowerShell (.ps1) + double-click .cmd wrappers
│   └── steps/            Single-purpose steps the QualityGate runs
├── docs/                 Theming, accessibility, EAS, and template guides
├── eslint-plugin-theme-tokens/   Local lint rule banning raw visual values
├── app.config.ts         Expo app config (name, owner, EAS projectId)
└── eas.json              EAS build/submit profiles
```

Most `src/` subdirectories expose a barrel `index.ts` — import from the
barrel, not from individual files.

### Conventions worth knowing

- **Components** use the `App` prefix (`AppButton`, `AppText`, …), read
  tokens via `useTheme()`, and never hardcode visual values.
- **Theme** is the single source of truth for every color, spacing,
  radius, font size, and shadow. Re-skinning = a token edit.
- **State**: React Context for theme/a11y; Zustand (injectable-deps
  factory) for domain state.
- **TypeScript strict mode** — no `any`, no `@ts-ignore`.

The full rules live in [`CLAUDE.md`](CLAUDE.md).

## Documentation

| Doc                                                            | Covers                                               |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| [Theming](docs/theming.md)                                     | Token system, `useTheme()`, building new components. |
| [Token-only styling](docs/token-only-styling.md)               | The no-raw-values rule and its lint enforcement.     |
| [Accessibility](docs/accessibility.md)                         | A11y architecture, roles, announcements, font scale. |
| [Accessibility checklist](docs/accessibility-checklist.md)     | Per-PR WCAG 2.1 AA checklist.                        |
| [New project from template](docs/new-project-from-template.md) | Rename, re-skin, and ship a fresh app from this.     |
| [Expo account & EAS](docs/expo-account.md)                     | Account setup for cloud builds and submissions.      |

## License

See [`LICENSE`](LICENSE).
