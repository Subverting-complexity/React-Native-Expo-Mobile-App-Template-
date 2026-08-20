# scripts/

Windows-first developer tooling for this template. Each PowerShell script
(`.ps1`) has a matching double-click wrapper (`.cmd`) that runs it with an
ExecutionPolicy bypass, so nothing here depends on the machine's script policy.

## Expo account

Cloud builds run under a specific Expo account. `VerifyExpoAccount.ps1`
(`npm run verify:expo`, or double-click `VerifyExpoAccount.cmd`) reports the
configured `owner`, whether `EXPO_TOKEN` is loaded, and the logged-in EAS
account. The `DeployiOSTestFlight` / `DeployAndroidPlayStore` scripts run the
same check (`Assert-ExpoAccount` in `Common.ps1`) automatically before building.
See [`docs/expo-account.md`](../docs/expo-account.md) for the full setup.

## Quality gate

`QualityGate.ps1` is the single orchestrator that runs every check the
project cares about. It calls the small, single-purpose steps in
[`steps/`](steps) in order and prints a pass/fail summary:

| Step                | What it does                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `CheckHealth`       | Verifies Node, npm, and `node_modules` are present.                                                                        |
| `VerifyAssets`      | Every image `app.config.ts` references exists and is non-empty (a missing icon otherwise fails minutes into an EAS build). |
| `VerifyFormatting`  | Prettier (rewrites in local mode, checks in ci).                                                                           |
| `RunStaticAnalysis` | ESLint (`--fix` in local mode, strict in ci).                                                                              |
| `ValidateQuality`   | TypeScript `tsc --noEmit` against the strict config.                                                                       |
| `ExecuteTests`      | Jest with coverage.                                                                                                        |
| `TestBuild`         | Expo web bundle smoke test (heaviest; runs last).                                                                          |

### Two modes

- **local** (default) — auto-fixes what it can (Prettier rewrite, ESLint
  `--fix`) then verifies. This is the developer's full local gate.
- **ci** — strict: no fixes, fails on any formatting drift, and always runs
  the bundle smoke test.

### How to run it

- **`npm run check`** — runs the full strict (ci) gate. This is what a CI
  pipeline runs.
- **Double-click `scripts/QualityGate.cmd`** — runs the full local
  (auto-fixing) gate, then pauses so the window stays readable.
- **From a terminal** — for more control:

  ```powershell
  # Full local gate (auto-fix), skipping the slow bundle smoke test
  .\scripts\QualityGate.ps1 -SkipBuild

  # Strict gate, same as `npm run check`
  .\scripts\QualityGate.ps1 -Mode ci

  # Just one step
  .\scripts\QualityGate.ps1 -Only ValidateQuality
  ```

The script exits non-zero if any step fails, so it can gate a commit or a
pipeline. `CheckHealth` is a hard prerequisite: if the toolchain is missing,
the gate stops there with one clear message instead of a cascade of errors.

> The 70% coverage **threshold** is enforced separately (jest
> `coverageThreshold`); this gate runs coverage but does not set that limit.

## Release records

The two deploy scripts (`DeployiOSTestFlight`, `DeployAndroidPlayStore`)
record every store deploy in git: a `release/{platform}/{stamp}` branch cut
before the build, an annotated outcome tag written after it, and automatic
pruning of stale failed branches. The rules live in the unit-tested Node
tool at [`release/`](release); PowerShell only calls `start` and `finish`.
A dirty working tree refuses the deploy (`-AllowDirty` overrides, and the
tag records it). Full story: [`docs/release-branches.md`](../docs/release-branches.md).

## Encoding rule

Every `.ps1` here must be pure ASCII (or carry a UTF-8 BOM) — Windows
PowerShell 5.1 reads BOM-less files as Windows-1252, which can turn one em
dash into a parse error a hundred lines away. Write `--` instead. A Jest
test (`scripts/__tests__/powershellScriptsAscii.test.js`) enforces this.
