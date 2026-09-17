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

## Windows checkout path length, for local Android builds

`BuildAndDeployDevModeAndroid.ps1` runs `expo run:android`, which prebuilds
the native project and compiles it with Gradle/CMake/ninja. On the sibling
projects this template is drawn from (CadenceReader, Refrain — both Expo
apps with the same Android toolchain), that native build fails on Windows
once the checkout path is long: ninja reports `Filename longer than 260
characters`, or the more confusing `manifest 'build.ninja' still dirty after
100 tries`. Both come from the same cause — the codegen sources under
`node_modules/<library>/android/build/generated/source/codegen/jni/...` are
deep enough on their own that a long checkout prefix leaves almost no room.
This template ships no custom native module, so it sits closer to the limit
than those two projects, but `expo run:android` still triggers the same
react-native/Expo module codegen, and an agent worktree under
`.claude/worktrees/<branch>/` (about 116 characters before the repository
even starts) is exactly the kind of path this breaks on. Not yet confirmed
as an actual failure in this repository, only carried over as a known risk
because the mechanism is identical.

There is no automated short-checkout redirect here yet (the sibling projects
have one: `LaunchAndroid.ps1` mirrors the tree into a short, per-machine
directory with `robocopy /MIR` before building — see CadenceReader's
`ClaudeProject.md` → "The checkout has to be somewhere shallow" and
`tools/README.md` → "Android build directory" for the full recipe, including
the two workarounds that do **not** work, `subst` and directory junctions).
Until this template gets the same tooling, the manual fix is a short,
non-worktree checkout: `git worktree add --detach C:\short\path HEAD`, then
build from there.

## Keep the EAS build archive small

EAS Build's first step archives the whole checkout it runs from, not just
what git tracks. CadenceReader hit a 1.4 GB archive from a 23 MB tracked
project because `.claude/worktrees/` — each a full checkout with its own
`node_modules` — was not anchored in `.gitignore`
(`Subverting-complexity/CadenceReader#1745`). Checked here: this template's
`.gitignore` already has a blanket `.claude/` rule (`.claude/worktrees/`
included), so this specific gap does not apply — confirmed by `git ls-files`
returning nothing under `.claude/worktrees/` despite ~500 MB sitting there
untracked. If that `.gitignore` line ever moves or narrows, re-check this.

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

## Version bump

Before either deploy script cuts its release branch, it moves `version` in
`app.config.ts` on by one (minor by default, `-Level patch|major` to choose),
commits that to `main` and pushes. Running both platforms back to back still
bumps once: the tool stops when `HEAD` is already a commit it wrote, so both
stores ship the same version. That check is the whole mechanism -- there is
no skip flag, because the one that has to be remembered is the one that gets
forgotten.

It commits to a shared branch, so it has no overrides: it refuses anywhere
but `main`, refuses a dirty tree, refuses a `main` that has drifted from
`origin/main`, and refuses to clobber a leftover `version-bump/*` branch.
`-AllowDirty` on a deploy therefore skips the bump rather than forcing it.
Run it on its own with `npm run version:bump`. Full story:
[`docs/releasing.md`](../docs/releasing.md#automatic-version-bump).

## Encoding rule

Every `.ps1` here must be pure ASCII (or carry a UTF-8 BOM) — Windows
PowerShell 5.1 reads BOM-less files as Windows-1252, which can turn one em
dash into a parse error a hundred lines away. Write `--` instead. A Jest
test (`scripts/__tests__/powershellScriptsAscii.test.js`) enforces this.
