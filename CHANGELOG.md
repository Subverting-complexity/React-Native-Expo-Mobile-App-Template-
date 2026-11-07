# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

House rules for entries, learned from sibling projects:

- **Write for the reader, not the reviewer.** Entries are full sentences in
  user-facing language ("The app now remembers your color mode across
  restarts"), several sentences where the change deserves it, and they name
  the limits ("on web this applies only after the first reload"). No bare
  identifiers, no PR numbers in the body.
- New work lands under `[Unreleased]` in the matching category (`Added`,
  `Changed`, `Fixed`, `Removed`, `Tooling`); a release moves the block under
  a version heading with the date, in the same commit that bumps `version`
  in `app.config.ts`.

## [Unreleased]

### Added

- A data layer for a backend API. Screens read an `ApiClient` from
  `useApi()` and never call `fetch` themselves, so tests and a demo mode can
  swap the client. The HTTP client sends JSON, times out after 30 seconds,
  can be cancelled, and turns every failure into an `ApiError` that says
  whether the API refused the request, answered with something that is not
  JSON, could not be reached, or did not answer in time. The base URL comes
  from `API_BASE_URL` at build time, never from a user setting. A release
  build accepts only `https://`, and an EAS build with no URL fails at once.
- Themes. `THEMES` is the one list of themes, each with a light and a dark
  version, and Settings lets the user choose one. The template ships
  Standard and a new High contrast theme. The choice is saved with the
  light or dark mode, and every theme must pass the contrast audit.
- `TABS` is the one list of bottom tabs: order, titles, short labels and
  icons. Each tab has an icon, filled when active. A test fails when the
  tab list and the route files in `app/(tabs)/` disagree.
- A "Coming soon" page (`FeaturePlaceholder`) for a tab whose feature is not
  built yet. The new Explore tab shows it.
- Theme tokens for opacity, border widths and icon sizes, and one shared
  map from each colour intent to its colours. Badges, toasts, buttons,
  spinners, progress bars and text all read that map.
- A guide to the app artwork (`docs/app-artwork.md`): every file, its size,
  and the platform rules for adaptive icons, themed icons and the splash
  screen.

- A complete store-publishing layer under `fastlane/`: the ios/android
  `listing` lanes push metadata, screenshots, and privacy declarations while
  EAS keeps owning the binaries, and a Pillow-based generator composes
  on-brand store screenshots from raw device captures. Everything ships as a
  guided placeholder skeleton — see `fastlane/PUBLISHING.md`.
- Every store deploy now leaves a permanent record in git: a
  `release/{platform}/{stamp}` branch cut before the build and an annotated
  outcome tag written after it. Failed and unfinished branches prune after
  30 days; tags and successful branches are kept for good. See
  `docs/release-branches.md`.
- Store deploys now set the release version themselves. Before the build
  starts, the deploy script moves `version` in `app.config.ts` on by one
  (minor by default, `-Level patch` or `-Level major` to choose), commits
  that to `main` and pushes it, so the release branch carries the version
  that is actually being built. Shipping iOS and Android back to back bumps
  once, not twice: the tool recognises its own last commit and stops, and it
  starts bumping again on its own as soon as any real commit lands on
  `main`. It refuses to run anywhere but `main`, from a dirty tree, or when
  `main` has drifted from its remote. See `docs/releasing.md`.
- New guides: releasing (`docs/releasing.md`), UI writing style
  (`docs/ui-writing-style.md`), decision records
  (`docs/decision-records.md`), and a hostable privacy-policy template
  (`docs/privacy-policy-template.md`).
- Generic utilities with tests: `toError`, `userFacingErrorMessage`,
  `formatDuration`, and the `withAlpha` theme helper for deriving
  translucent tiers from solid palette tokens.

### Changed

- The app keeps the native splash screen up until the fonts and the saved
  theme are ready, so the first screen already uses the saved theme. The
  splash background follows the dark mode of the device, and a test keeps
  it equal to the theme background.
- Line heights grow with the device text size, so large text no longer
  clips. Toasts stay above the tab bar and the safe area, a screen reader
  can reach their buttons, and a toast with an action stays for 10
  seconds. Chip groups that must always have a value (such as the colour
  mode) are radio groups for screen readers.
- The status bar follows the app's light or dark mode, not the device's.
- If a screen throws while it renders, the app shows the error screen in
  its place.

- The quality gate verifies that every image `app.config.ts` references
  exists and is non-empty, so a missing icon fails in seconds locally
  instead of minutes into an EAS cloud build.
- EAS build profiles are explicit per platform (internal APKs for
  development/preview, `m-medium` iOS builders), and Apple's
  export-compliance question is pre-answered in `app.config.ts`.

### Fixed

- Warning text, and warning badges with a soft or outline style, are now
  readable in the Standard light theme. The warning colour is a darker
  amber, and a filled warning label is white. The primary colour is one
  step darker, so a soft primary badge, such as "Coming soon", also meets
  the contrast that WCAG asks for text. The contrast test now checks every
  status and brand colour as text on every surface, so a new palette that
  is too light for text fails the test.
- Placeholder text in a text field uses the secondary text colour. Before,
  it used the disabled colour, which was too faint to read.
- Tab labels and the error screen no longer clip at large device text
  sizes. Their line height now grows with the text, and the error screen
  uses the same text size limit as the rest of the app.
- The app no longer claims a global text size limit that it did not have.
  The old limit set a default on React Native's text component, which React
  19 ignores. The limit comes from `AppText` and `AppTextInput`, and lint
  now rejects raw `Text` and `TextInput` in screens and components.
  `applyGlobalFontScaleCap` is removed.

### Tooling

- The developer tools moved from `scripts/` to `tools/`, with one folder
  for each group: `launch/`, `deploy/`, `quality/`, `shared/` and
  `release/`. The two store deploy scripts now share one implementation.
  `tools/README.md` explains how to add a quality gate step.
- The quality gate reads the image paths from the evaluated app config, so
  a new image in `app.config.ts` is checked with no list to keep in step.
- CI runs the same PowerShell quality gate as `npm run check`, under
  PowerShell 7 on Linux and Windows PowerShell 5.1 on Windows, with the
  Node version from `.nvmrc`.
- Lint fails on any warning. Type checking also covers the test files.
- The token lint rules now also catch raw opacity, border widths, shadow
  values, font weights and negative numbers, both branches of a condition,
  and the `color` and `size` props of any element, such as an icon.
- Tests for the `app/` routes moved to `tests/app/`, because Expo Router
  loads every file in `app/` as a route. A test fails if a test file is
  added under `app/` again.
- `eas-cli` is a pinned development dependency, so every machine builds
  with the same version.

- PowerShell scripts are guarded by a test that keeps them pure ASCII (or
  UTF-8 with BOM), which Windows PowerShell 5.1 requires to parse them
  reliably.
- Jest makes `Animated.timing` synchronous, eliminating a CI-only worker
  crash caused by animation frames firing after environment teardown.
