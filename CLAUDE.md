# Expo Mobile App Template

Project-agnostic React Native / Expo starter: Expo SDK 56, TypeScript
strict, expo-router, design tokens, an `App*` component library, WCAG 2.1 AA
accessibility, and a Windows-first PowerShell toolchain.

## Commands

- `npm start` / `npm run web|ios|android` — dev server (Metro).
- `npm run quality` — lint + typecheck + tests with coverage. Run before
  committing.
- `npm run check` — the full strict gate (what CI runs), via PowerShell.
- `npm test` / `npm run lint` / `npm run typecheck` / `npm run format` —
  the individual checks.
- `npm run deploy:ios` / `deploy:android` — EAS build + store submit, with an
  automatic version bump, a release branch, and an outcome tag recorded in
  git.
- `npm run version:bump` — move the release version on by one on its own
  (the deploy scripts already do this; running both bumps once, not twice).

## Project structure

- `app/` — expo-router screens (file-based routing); providers wire up in
  `app/_layout.tsx`.
- `src/theme/` — design tokens, the single source of truth for every visual
  value.
- `src/components/` — generic, prop-driven `App*` components.
- `src/a11y/` — accessibility context, roles, announcements.
- `src/state/` — Zustand stores (injectable-deps factory pattern).
- `src/storage/` — platform-aware persistence behind one `StorageAdapter`.
- `src/utils/` — small pure helpers (error coercion, formatting).
- `scripts/` — PowerShell tooling (+ `.cmd` double-click wrappers);
  `scripts/release/` holds the Node release tools (release records and the
  automatic version bump).
- `fastlane/` — store listing pipeline (metadata, screenshots, privacy).
- `eslint-plugin-theme-tokens/` — local lint rules banning raw visual values.

## Conventions

- **Never hardcode a visual value.** Colors, spacing, radii, type, shadows
  all come from `useTheme()`; the lint plugin enforces it. Translucent tiers
  derive via `withAlpha(token, alpha)`.
- **Every interactive element is accessible**: role + label (the `App*`
  components require them at the type level), 44pt minimum touch target
  (`theme.a11y.minTouchTarget`).
- **TypeScript strict; no `any`, no `@ts-ignore`.**
- **Stores are factories taking `deps`** so tests inject fakes and never
  share state (`src/state/exampleStore.ts` is the pattern).
- **Barrels**: import from a directory's `index.ts`, not deep paths.
- **User-facing strings** follow `docs/ui-writing-style.md`. Changelog
  entries are reader-facing prose (`CHANGELOG.md` header has the rules).
- **PowerShell scripts stay ASCII** (or UTF-8 with BOM) — a test enforces
  it; write `--` instead of an em dash.

## Quality gate

CI runs typecheck, lint (`--max-warnings` clean), Prettier check, Jest with
coverage (70% floor), a web-export bundle smoke test, and the PowerShell
gate on a Windows runner. The local gate (`scripts/QualityGate.cmd`)
auto-fixes formatting/lint first; ci mode fixes nothing.

## Supplementary files

Consult on demand — no need to read them all every session:

| File                                | When to consult                                        |
| ----------------------------------- | ------------------------------------------------------ |
| `docs/theming.md`                   | Adding tokens, building themed components, re-skinning |
| `docs/token-only-styling.md`        | The no-raw-values rule and its lint enforcement        |
| `docs/accessibility.md`             | A11y architecture, roles, announcements, font scale    |
| `docs/accessibility-checklist.md`   | Per-PR WCAG 2.1 AA checklist                           |
| `docs/ui-writing-style.md`          | Writing or editing any user-facing string              |
| `docs/releasing.md`                 | Cutting a release, EAS versioning, deploy failures     |
| `docs/release-branches.md`          | What deploys record in git, pruning, interruptions     |
| `fastlane/PUBLISHING.md`            | Store listings, screenshots, privacy declarations      |
| `docs/expo-account.md`              | EXPO_TOKEN setup, building under the right account     |
| `docs/new-project-from-template.md` | Turning the template into a real app                   |
| `docs/decision-records.md`          | Writing down design decisions from a discussion        |
| `scripts/README.md`                 | The PowerShell toolchain and quality gate              |
