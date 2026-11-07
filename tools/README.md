# tools/

Windows-first developer tooling for this app. Each PowerShell script
(`.ps1`) has a matching double-click wrapper (`.cmd`) that runs it with an
ExecutionPolicy bypass, so nothing here depends on the machine's script policy.

Every wrapper uses the same pattern. It forwards its arguments to the script,
prints `Script exited with code N.` when the script fails, and returns that
code. The window pauses at the end only after a double-click. A run from a
terminal or another script returns at once.

## Layout

Each tool group has its own folder. The `.cmd` wrappers sit in the group
folder, and the PowerShell scripts they run sit in its `ps/` subfolder.

| Folder      | `.cmd` wrappers                                                                         | Purpose                                                    |
| ----------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `launch/`   | `LaunchWeb`, `BuildAndRunIOSDevelopment`, `BuildAndDeployDevModeAndroid`                | Run the app in the browser or as a development build.      |
| `deploy/`   | `DeployiOSTestFlight`, `DeployAndroidPlayStore`, `VerifyExpoAccount`, `BumpBuildNumber` | Store builds and submissions, and their account checks.    |
| `quality/`  | `QualityGate`                                                                           | The quality gate. Its steps are in `quality/ps/steps/`.    |
| `shared/`   | none                                                                                    | `ps/Common.ps1`, the helpers the launch and deploy share.  |
| `release/`  | none                                                                                    | The Node release tools that the deploy scripts call.       |
| `__tests__` | none                                                                                    | Tests for the tooling, such as the PowerShell ASCII check. |

## Expo account

Cloud builds run under a specific Expo account. `deploy/ps/VerifyExpoAccount.ps1`
(`npm run verify:expo`, or double-click `deploy/VerifyExpoAccount.cmd`) reports the
configured `owner`, whether `EXPO_TOKEN` is loaded, and the logged-in EAS
account. The `DeployiOSTestFlight` / `DeployAndroidPlayStore` scripts run the
same check (`Assert-ExpoAccount` in `shared/ps/Common.ps1`) automatically before building.
See [`docs/expo-account.md`](../docs/expo-account.md) for the full setup.

## Windows checkout path length, for local Android builds

`launch/ps/BuildAndDeployDevModeAndroid.ps1` runs `expo run:android`. That
command prebuilds the native project and compiles it with Gradle, CMake and
ninja. On sibling Expo projects with the same Android toolchain
(CadenceReader, Refrain), this native build fails on Windows when the
checkout path is long. ninja reports `Filename longer than 260 characters`,
or `manifest 'build.ninja' still dirty after 100 tries`. Both errors have the
same cause. The codegen sources under
`node_modules/<library>/android/build/generated/source/codegen/jni/...` are
already deep, so a long checkout prefix leaves almost no room.

This template ships no custom native module. But `expo run:android` still
runs the same React Native and Expo module codegen. An agent worktree under
`.claude/worktrees/<branch>/` adds about 116 characters before the
repository path starts, which is the kind of path that fails. This failure
is not yet confirmed in this repository. It is a known risk, because the
mechanism is the same.

This template has no automatic short-checkout redirect yet. The sibling
projects have one: `LaunchAndroid.ps1` copies the tree into a short
directory on each machine with `robocopy /MIR` before it builds. See
CadenceReader's `ClaudeProject.md` ("The checkout has to be somewhere
shallow") and its `tools/README.md` ("Android build directory") for the full
recipe. Those pages also explain why `subst` and directory junctions do
**not** work. Until this template has the same tooling, use a short checkout
that is not under `.claude/worktrees/`, and build from there:

```powershell
git worktree add --detach C:\short\path HEAD
```

## Keep the EAS build archive small

The first step of an EAS build archives the checkout it runs from. This
includes untracked files that `.gitignore` does not exclude, not only the
files that git tracks. CadenceReader got a 1.4 GB archive from a 23 MB
tracked project, because `.gitignore` did not exclude `.claude/worktrees/`.
Each worktree there is a full checkout with its own `node_modules`
(`Subverting-complexity/CadenceReader#1745`).

This template does not have that problem. Its `.gitignore` excludes all of
`.claude/`, which includes `.claude/worktrees/`, and `git ls-files .claude`
returns nothing. If that `.gitignore` line moves or becomes narrower, check
this again.

## Quality gate

`quality/ps/QualityGate.ps1` is the single orchestrator that runs every check the
project cares about. It calls the small, single-purpose steps in
[`quality/ps/steps/`](quality/ps/steps) in order and prints a pass/fail summary:

| Step                | What it does                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `CheckHealth`       | Verifies Node, npm, and `node_modules` are present.                                                                           |
| `VerifyAssets`      | Every local image in `expo config --json` exists and is non-empty (a missing icon otherwise fails minutes into an EAS build). |
| `VerifyFormatting`  | Prettier (rewrites in local mode, checks in ci).                                                                              |
| `RunStaticAnalysis` | ESLint with `--max-warnings 0`, as `npm run lint` (`--fix` in local mode, strict in ci).                                      |
| `ValidateQuality`   | TypeScript `tsc --noEmit` against the strict config.                                                                          |
| `ExecuteTests`      | Jest with coverage.                                                                                                           |
| `TestBuild`         | Expo web bundle smoke test (heaviest; runs last).                                                                             |

### Two modes

- **local** (default) — auto-fixes what it can (Prettier rewrite, ESLint
  `--fix`) then verifies. This is the developer's full local gate.
- **ci** — strict: no fixes, fails on any formatting drift, and always runs
  the bundle smoke test.

### How to run it

- **`npm run check`** — runs the full strict (ci) gate. This is what a CI
  pipeline runs.
- **Double-click `tools/quality/QualityGate.cmd`** — runs the full local
  (auto-fixing) gate, then pauses so the window stays readable.
- **From a terminal** — for more control:

  ```powershell
  # Full local gate (auto-fix), skipping the slow bundle smoke test
  .\tools\quality\ps\QualityGate.ps1 -SkipBuild

  # Strict gate, same as `npm run check`
  .\tools\quality\ps\QualityGate.ps1 -Mode ci

  # Just one step
  .\tools\quality\ps\QualityGate.ps1 -Only ValidateQuality
  ```

CI runs the same strict gate twice. The Linux job runs `QualityGate.ps1 -Mode ci`
under PowerShell 7 (`pwsh`). The Windows job runs `npm run check`, which uses
Windows PowerShell 5.1.

The script exits non-zero if any step fails, so it can gate a commit or a
pipeline. `CheckHealth` is a hard prerequisite: if the toolchain is missing,
the gate stops there with one clear message instead of a cascade of errors.

### Adding a step

1. Add `quality/ps/steps/<Name>.ps1`. It dot-sources `Common.ps1` and
   declares `Invoke-<Name> -Mode`, which returns a `New-StepResult`. A step
   that runs 1 tool can return `Invoke-ToolStep` (see `ValidateQuality.ps1`).
2. Add `<Name>` to `$StepNames` in `quality/ps/QualityGate.ps1`, at its place
   in the order. `-Only` accepts it from then on.
3. Add a row to the table above.

> The 70% coverage **threshold** is enforced separately (jest
> `coverageThreshold`); this gate runs coverage but does not set that limit.

## Release records

The two deploy scripts (`DeployiOSTestFlight`, `DeployAndroidPlayStore`)
share 1 flow, `Invoke-StoreDeploy` in `deploy/ps/StoreDeploy.ps1`. Each
script only passes its platform and store name. The flow records every
store deploy in git: a `release/{platform}/{stamp}` branch cut
before the build, an annotated outcome tag written after it, and automatic
pruning of stale failed branches. The rules live in the unit-tested Node
tool at [`release/`](release); PowerShell only calls `start` and `finish`.
A dirty working tree refuses the deploy (`-AllowDirty` overrides, and the
tag records it). The tag records the real `eas-cli` exit code when a build
or a submit fails. Full story: [`docs/release-branches.md`](../docs/release-branches.md).

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
test (`tools/__tests__/powershellScriptsAscii.test.js`) enforces this.
