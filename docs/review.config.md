# Review Configuration — React Native Expo Mobile App Template

## Repository

- Org: Subverting-complexity
- Repo: React-Native-Expo-Mobile-App-Template-
- Default branch: main

## Labels

| Purpose             | Label                      | Type   | Meaning                                                              |
| ------------------- | -------------------------- | ------ | -------------------------------------------------------------------- |
| `needs-review`      | `review-needs-review`      | State  | Open PR awaiting its first review (entry state, applied at creation) |
| `reviewing`         | `review-reviewing`         | State  | Review in progress — prevents concurrent reviews                     |
| `approved`          | `review-approved`          | State  | No remaining issues, ready for human merge                           |
| `changes-requested` | `review-changes-requested` | State  | Concrete problems remain that a human must address                   |
| `needs-discussion`  | `review-needs-discussion`  | State  | Architectural or scope questions need human judgment                 |
| `needs-re-review`   | `review-needs-re-review`   | State  | New commits pushed since last review — re-review required            |
| `failed`            | `review-failed`            | State  | Review could not be completed                                        |
| `updating`          | `review-updating`          | State  | A builder agent is addressing review feedback                        |
| `fixes-applied`     | `review-fixes-applied`     | Action | Claude pushed fix commits to the PR branch (sticky)                  |

## Auto-Merge on Approval

| Setting                 | Value     |
| ----------------------- | --------- |
| auto-merge-on-approval  | `enabled` |
| require-ci-before-merge | `false`   |

## Hard Non-Compliance Gates

Any of these force a `Changes Requested` verdict regardless of all other findings.

- **TypeScript errors** — `tsc --noEmit` must pass clean. No `any`, no `// @ts-ignore` without documented justification.
- **Hardcoded visual values** — no magic numbers for colors, font sizes, spacing, radii, or shadows. All visual values must flow from `src/theme` tokens via `useTheme()`.
- **Missing tests** — every new public function/component must have at least one test. Coverage must not drop below 70%.
- **WCAG 2.2 AA violations** — `accessibilityLabel` on interactive elements, sufficient contrast, focus traps handled, no keyboard trap without escape.
- **`console.log` in production code** — use the project logger or remove. (Test files are exempt.)
- **Lint errors** — ESLint must report zero errors (warnings allowed).

## Tech Stack Review Rules

- **React Native / Expo (managed CNG)** — no bare `react-native` imports that bypass Expo's module system. Use `expo-*` equivalents.
- **Components** — must use `App*` prefix. Generic, prop-driven (`variant`/`size`/`tone`/`style`). No hardcoded strings or values.
- **Theme** — all token reads via `useTheme()` hook. Token names must match `src/theme` definitions exactly.
- **State** — React Context for theme/a11y globals; Zustand (injectable-deps pattern) for domain state. No Redux, no MobX.
- **Fonts** — Atkinson Hyperlegible loaded via `expo-font`. No other font families unless a story explicitly adds one.
- **Platform code** — `Platform.select` or `.ios.tsx`/`.android.tsx` suffixes only; never naked `Platform.OS === 'ios'` inline conditionals in component render.
- **Navigation** — Expo Router (file-based). No React Navigation configured separately.

## Architecture Rules

- Domain must not import from infrastructure. Strict layer boundaries: `src/domain` → no imports from `src/services`, `src/api`, etc.
- Every module must be unit-testable in isolation — inject dependencies; no hidden singletons.
- `src/theme` is the single source of truth for all visual values. Components are re-skinnable by changing tokens only.
- PowerShell scripts (`.ps1`) must have a matching `.cmd` double-click wrapper.
- TypeScript strict mode is non-negotiable. `tsconfig.json` must keep `"strict": true`.

## Security Specifics

- No API keys, secrets, or credentials in source code or committed files.
- No hardcoded URLs that should be environment variables.
- `SecureStore` (via `expo-secure-store`) for any sensitive local persistence; never `AsyncStorage` for secrets.

## Test Expectations

- Test runner: jest-expo + React Native Testing Library (RNTL).
- Coverage gate: ~70% (enforced by `npm run quality`).
- Every new component must have a render test + at least one interaction/state test.
- Every new utility function must have unit tests covering the happy path and edge cases.
- Snapshot tests are discouraged — prefer explicit assertions.
- Tests live alongside source files (`*.test.tsx` / `*.test.ts`).

## Review Comment Footer

```
---
Reviewed at <SHA>
🤖 Reviewed with Claude Code
```
