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

| Tool            | Version        | Notes                                                |
| --------------- | -------------- | ---------------------------------------------------- |
| **Node.js**     | 22 (`.nvmrc`)  | Ships with `npm`. CI uses the version in `.nvmrc`.   |
| **npm**         | 10 or newer    | Bundled with Node.                                   |
| **Git**         | any recent     | —                                                    |
| **Expo Go** app | latest         | On a physical device, to run without a native build. |
| **PowerShell**  | 5.1+ (Windows) | For the `tools/` tooling and `.cmd` wrappers.        |

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

That is enough to boot the app. The Home tab lives in
[`app/(tabs)/index.tsx`](<app/(tabs)/index.tsx>); a full component
showcase is on the **Gallery** route ([`app/gallery.tsx`](app/gallery.tsx)).
To turn the template into your own app, follow
[New project from template](docs/new-project-from-template.md).

### Environment variables

`API_BASE_URL` sets the backend API that the build calls. The app starts
without it, but every API call fails until it is set. `EXPO_TOKEN` is
only needed for EAS cloud builds. Copy the example file and fill in the
values:

```bash
cp .env.example .env   # then set API_BASE_URL and EXPO_TOKEN
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
| `npm run lint`           | ESLint over the whole project, with no warnings allowed.     |
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
| `npm run version:bump`   | Move the release version on by one (the deploys do this).    |

### PowerShell scripts (`tools/`, Windows-first)

Every `.ps1` has a matching `.cmd` wrapper you can **double-click** — it
runs with an ExecutionPolicy bypass, so nothing depends on the machine's
script policy. See [`tools/README.md`](tools/README.md) for full
detail; the highlights:

Each tool group has its own folder under `tools/`. The `.cmd` wrappers sit
in the group folder, and their PowerShell scripts sit in its `ps/` subfolder.

| Folder           | Script (`.cmd` / `ps/*.ps1`)   | Purpose                                                             |
| ---------------- | ------------------------------ | ------------------------------------------------------------------- |
| `tools/quality/` | `QualityGate`                  | Single orchestrator: assets, format, lint, typecheck, test, bundle. |
| `tools/launch/`  | `LaunchWeb`                    | Start the app in the browser.                                       |
| `tools/launch/`  | `BuildAndRunIOSDevelopment`    | Local iOS development build + run.                                  |
| `tools/launch/`  | `BuildAndDeployDevModeAndroid` | Android development build + deploy to a device.                     |
| `tools/deploy/`  | `VerifyExpoAccount`            | Confirm you are building under the correct Expo account.            |
| `tools/deploy/`  | `BumpBuildNumber`              | Increment iOS `buildNumber` / Android `versionCode`.                |
| `tools/deploy/`  | `DeployiOSTestFlight`          | Production build + submit to TestFlight.                            |
| `tools/deploy/`  | `DeployAndroidPlayStore`       | Production build + submit to the Play Store.                        |

The quality gate has two modes: **local** (default, auto-fixes
formatting/lint then verifies) and **ci** (strict, no fixes). Run the
strict gate with `npm run check`, or the auto-fixing one by
double-clicking `tools/quality/QualityGate.cmd`.

## Project structure

```
.
├── app/                  Expo Router screens (file-based routing)
│   ├── (tabs)/           Tabs: Home (index), Explore (a placeholder), Settings
│   ├── gallery.tsx       Component showcase route
│   └── _layout.tsx       Root layout (providers wired here)
├── assets/               Placeholder icon, adaptive icon, splash, favicon
├── src/
│   ├── theme/            Design tokens — the single source of truth
│   ├── components/       Generic, prop-driven App* component library
│   ├── a11y/             Accessibility context, roles, announcements
│   ├── api/              The data layer: every API call goes through here
│   ├── navigation/       TABS, the one list of bottom tabs
│   ├── placeholders/     The "Coming soon" page for an unbuilt tab
│   ├── state/            Zustand stores (injectable-deps factory pattern)
│   ├── storage/          Platform-aware persistence (web / native)
│   ├── hooks/            Shared React hooks
│   ├── utils/            Small pure helpers (error coercion, formatting)
│   ├── gallery/          Showcase screen + per-category demo sections
│   └── test/             Test utilities and helpers
├── tests/                Tests for the app/ routes (expo-router reads every file in app/ as a route)
├── tools/                Developer tooling, 1 folder per tool group
│   ├── launch/           Run the app: .cmd wrappers, PowerShell in ps/
│   ├── deploy/           Store deploys and account checks: .cmd, ps/
│   ├── quality/          Quality gate: .cmd, ps/, and ps/steps/
│   ├── shared/ps/        Common.ps1 for the launch and deploy scripts
│   └── release/          Release records and the automatic version bump
├── fastlane/             Store listing pipeline: metadata, screenshots,
│                         privacy declarations (see fastlane/PUBLISHING.md)
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
- **State**: React Context for theme, accessibility and the API client;
  Zustand (injectable-deps factory) for domain state.
- **Data**: screens call the API only through `useApi()`. The base URL
  comes from the build (`API_BASE_URL`), never from a user setting.
- **TypeScript strict mode** — no `any`, no `@ts-ignore`.

## Releasing & store publishing

Two separate pipelines, so a copy edit never requires a build:

- **Binaries** — EAS builds and submits them (`npm run deploy:ios` /
  `deploy:android`). The deploy scripts move the marketing version in
  `app.config.ts` on by one and push that commit to `main`; build numbers
  live remotely and auto-increment. Every
  deploy leaves a `release/{platform}/{stamp}` branch and an annotated
  outcome tag in git — `git tag -n20 -l "release/*"` is the deployment
  history. See [releasing](docs/releasing.md) and
  [release branches](docs/release-branches.md).
- **Listings** — fastlane pushes store text, keywords, screenshots, and
  privacy declarations from `fastlane/metadata/`, and
  `fastlane/creative/render.py` composes on-brand store screenshots from raw
  device captures. See [store publishing](fastlane/PUBLISHING.md).

## Documentation

| Doc                                                            | Covers                                                |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| [Theming](docs/theming.md)                                     | Token system, `useTheme()`, building new components.  |
| [Token-only styling](docs/token-only-styling.md)               | The no-raw-values rule and its lint enforcement.      |
| [Accessibility](docs/accessibility.md)                         | A11y architecture, roles, announcements, font scale.  |
| [Accessibility checklist](docs/accessibility-checklist.md)     | Per-PR WCAG 2.1 AA checklist.                         |
| [New project from template](docs/new-project-from-template.md) | Rename, re-skin, and ship a fresh app from this.      |
| [App artwork](docs/app-artwork.md)                             | Icon, splash and store icon files and their rules.    |
| [Expo account & EAS](docs/expo-account.md)                     | Account setup for cloud builds and submissions.       |
| [Releasing](docs/releasing.md)                                 | Version ownership, release flow, EAS troubleshooting. |
| [Release branches](docs/release-branches.md)                   | The git record every store deploy leaves behind.      |
| [Store publishing](fastlane/PUBLISHING.md)                     | Listings, screenshots, privacy declarations.          |
| [UI writing style](docs/ui-writing-style.md)                   | House rules for every user-facing string.             |
| [Decision records](docs/decision-records.md)                   | Writing down design decisions from discussions.       |
| [Privacy policy template](docs/privacy-policy-template.md)     | Hostable starting point for the required policy URL.  |

## License

See [`LICENSE`](LICENSE).
