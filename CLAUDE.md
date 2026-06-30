# Project Rules

## General Rules

Code implementation only. Do not provision accounts, configure
third-party services, set up DNS, or perform manual infrastructure
steps. Flag those as requiring human action.

The **GitHub issue** is the source of truth for every story. Read the
issue body first. Only consult reference docs for cross-cutting
concerns not covered in the issue.

## Project Context

React Native / Expo mobile app template — project-agnostic scaffold consolidating
patterns from CadenceReader, Refrain, and VantagePoint. Windows-first toolchain
(PowerShell scripts + `.cmd` wrappers). See `.decisions/` for locked decisions.

**Non-negotiable:** Single source of truth + seams. Every visual value
(colors, font sizes, spacing, radii, shadows) is defined ONCE in `src/theme`.
Components are generic and prop-driven (`variant`/`size`/`tone`/`style`),
read tokens via `useTheme()`, and **never hardcode values**.
Re-skinning = token edit, not component edit.

## Project Conventions

### Directory Layout

| Directory         | Purpose                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `app/`            | Expo Router file-based routing (`(tabs)/` group, `_layout.tsx` wrappers)           |
| `src/theme/`      | Design tokens — colors, spacing, radii, typography, shadows, z-index, a11y         |
| `src/components/` | Reusable `App*` component library with barrel re-export (`index.ts`)               |
| `src/a11y/`       | Accessibility context, provider, role constants, announcements                     |
| `src/state/`      | Zustand stores (dependency-injection factory pattern)                              |
| `src/storage/`    | Platform-aware persistence (web `localStorage` / native `AsyncStorage`)            |
| `src/hooks/`      | Shared React hooks                                                                 |
| `src/gallery/`    | Component showcase screen and per-category demo sections                           |
| `src/build/`      | Build and EAS configuration helpers                                                |
| `scripts/`        | PowerShell (`.ps1`) + double-click `.cmd` wrappers for build, deploy, quality gate |
| `docs/`           | Project and accessibility documentation                                            |

Most `src/` subdirectories have a barrel `index.ts` — import from the
barrel, not from individual files. (`src/hooks/` and `src/build/` do not
have barrels yet.)

### Naming

- **Components** use the `App` prefix: `AppButton`, `AppText`,
  `AppScreenContainer`. Each lives in its own file under
  `src/components/` and is re-exported alphabetically from the barrel.
- **Zustand stores** follow the factory pattern: a `createXStore(deps)`
  function and a default `useXStore` hook export. See
  `src/state/exampleStore.ts` for the canonical shape.
- **Scripts** are PowerShell `.ps1` files with a matching `.cmd` wrapper
  for double-click execution. Shared logic lives in `Common.ps1`.

### Theming & Tokens

All visual values — colors, spacing, radii, typography scales, shadows,
z-index — are defined once in `src/theme/`. Components consume them
through `useTheme()`:

```ts
const { theme } = useTheme();
// theme.colors, theme.spacing, theme.radii, theme.typography, ...
```

Raw color strings, pixel literals, and hardcoded spacing are not
permitted outside the token files. A lint rule to machine-enforce this
ban is planned (#46); until then, code review is the enforcement
mechanism.

### Accessibility

WCAG 2.1 Level AA is the baseline:

- **Contrast** — automated ratio checks in `src/theme/contrast.ts`
  (tested against every foreground/background pairing).
- **Touch targets** — `AppPressable` enforces a 44x44 minimum and
  requires an `accessibilityLabel` prop.
- **Roles & announcements** — managed through `src/a11y/` (`A11yProvider`,
  `useA11y`, `announce`). Role constants live in `roles.ts`.
- **Font scaling** — capped at a safe maximum via `maxFontScale.ts` to
  prevent layout breakage while still allowing user scaling.

### State Management

- **React Context** for cross-cutting concerns: `ThemeProvider` (theme
  mode + tokens) and `A11yProvider` (reduce-motion, font scale).
- **Zustand** for domain state, using the injectable-deps factory
  pattern. Each store declares an interface for its external
  dependencies (typically a `StorageAdapter`) and accepts them via a
  `deps` parameter. Production wires real adapters; tests pass mocks.
  `src/state/exampleStore.ts` is the reference implementation.

### Reusability & Seams

**Single source of truth.** Every visual value lives once in
`src/theme/`. Changing a color, spacing step, or font size means editing
one token file — nothing else should need to change.

**Seam contract.** Components are generic and prop-driven (`variant` /
`size` / `tone` / `style`). They read tokens through `useTheme()` and
never hardcode visual values. Variant-to-token mappings are declared as
lookup tables (see `VARIANTS` and `SIZE_SPEC` in `AppButton.tsx` for the
pattern). Re-skinning the app means editing tokens, not editing
components.

**New-component recipe:**

1. Create `src/components/AppFoo.tsx` — consume tokens via `useTheme()`,
   accept a `style` prop for caller overrides.
2. Add a test in `src/components/__tests__/AppFoo.test.tsx`.
3. Re-export from the barrel (`src/components/index.ts`, alphabetical).
4. Add a demo entry in the appropriate `src/gallery/sections/` file.

**Lint escape-hatch.** The planned lint rule (#46) will provide a
suppression comment for the rare justified raw value (a one-off pixel
offset for platform alignment, for example). Until that rule ships,
review catches violations.

For the full rationale behind these rules, see the Design Principles
section of `.decisions/mobile-template-2026-06-06.md`.

## Autonomous Execution

Execute the full story workflow end-to-end without pausing for
confirmation. Skills are planning aids — consume their output and
continue to implementation. Never stop to ask "Ready to implement?"

## Story Execution

Work on **one story at a time** in a **fresh session per story**.
Complete it (PR created) or mark it blocked before starting the next.

### Build Principles

- One responsibility per file.
- Domain must not import from infrastructure. Strict layer boundaries.
- Every module unit-testable in isolation. Inject dependencies.
- Search for existing utilities before creating new ones.
- Write tests alongside the code, not after.
- Components use `App*` prefix (AppButton, AppText, AppIcon, …).
- State: React Context for theme/a11y; Zustand (injectable-deps pattern) for domain state.
- TypeScript strict mode — no `any`, no `// @ts-ignore`.
- Scripts: PowerShell (`.ps1`) with a matching double-click `.cmd` wrapper.

### Chaining Stories

When a story depends on another unmerged story:

1. Build the dependency on its own branch from the default branch.
2. Branch the dependent story off the dependency branch.
3. Set the dependent PR's base to the dependency branch.
4. After merge, rebase onto the default branch and update the PR base.

## Bug, Security, and Maintenance Workflow

When a bug, security issue, architecture violation, or tech debt is found during
development:

- **Trivial and same scope**: Fix in the current PR.
- **Everything else**: Run `/github-workflow:report-issue` to create
  a GitHub issue. Never silently skip problems.
- **Blocks current story**: Fix it first on its own branch.

## Session Hygiene

- Start a **new session** for each story.
- Target **~100k tokens per session**. One story, one session. Commit
  and push progress early so work survives session boundaries.
- If a story is too large for one session, implement the most important
  slice, open a PR for it, and create follow-up issues for the rest.

## Supplementary Files

| File                                       | When to consult                                                                                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ClaudeProject.md`                         | Project identity, labels, quality gate, branch convention, board config. Read at the start of any workflow command.                                               |
| `docs/review.config.md`                    | Review label definitions, non-compliance gates, tech-stack review rules. Read when performing or preparing for code review.                                       |
| `.decisions/mobile-template-2026-06-06.md` | Architecture decisions: Expo SDK version, theme system, a11y requirements, build toolchain, state management. Consult before making cross-cutting design choices. |
| `.claude/ecosystem.md`                     | Installed Claude Code companion tool cheat-sheet — graphify queries, cost tracking, security scanning, and codebase intelligence.                                 |
