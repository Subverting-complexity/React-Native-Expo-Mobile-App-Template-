# Releasing

How a build gets from this repo to TestFlight and the Play Store, who owns
each version number, and how to diagnose the failures that actually happen.
Store **listing** content (text, screenshots, privacy declarations) is a
separate, build-free pipeline — see [`fastlane/PUBLISHING.md`](../fastlane/PUBLISHING.md).

## The division of labour

| Concern                             | Owner                             | Where                                             |
| ----------------------------------- | --------------------------------- | ------------------------------------------------- |
| Building the binary                 | EAS cloud builds                  | `eas.json` build profiles                         |
| Submitting the binary to the stores | EAS submit                        | `eas.json` submit profile                         |
| Marketing version (`1.2.0`)         | The deploy scripts, automatically | `version` in `app.config.ts`                      |
| Build number / versionCode          | EAS, automatically                | remote (`appVersionSource: "remote"`)             |
| Store listing (text, screenshots)   | fastlane                          | `fastlane/`                                       |
| Deploy history                      | release branches + tags           | [`docs/release-branches.md`](release-branches.md) |

## Authenticating with EAS

Builds run under the Expo account named as `owner` in `app.config.ts`,
authenticated by a repo-scoped `EXPO_TOKEN` in the gitignored `.env` — not by
your global `eas login` session, so other repos on the machine keep using
whatever account you are logged into globally. Full setup:
[`docs/expo-account.md`](expo-account.md).

Two Windows-specific traps worth knowing:

- **direnv does not hook PowerShell.** If you rely on `.envrc` to load
  `.env`, that only works in bash/zsh. The deploy scripts in `scripts/` load
  `.env` themselves, so `npm run deploy:ios` needs nothing extra — but if you
  run `eas` commands by hand in PowerShell, load the token first:

  ```powershell
  Get-Content .env | Where-Object { $_ -match '^\s*EXPO_TOKEN=(.+)$' } |
    ForEach-Object { $env:EXPO_TOKEN = $Matches[1].Trim() }
  ```

- **Confirm the account before anything expensive.** `npx eas-cli whoami`
  must print the same account as `owner` in `app.config.ts`. The deploy
  scripts assert this and refuse to build on a mismatch; do the same for
  manual runs.

The token only needs the **Developer** role on the account — never use an
Admin token for routine builds.

## Version management

Two numbers exist and they are owned by different parties:

- **Marketing version** (`version: '1.0.0'` in `app.config.ts`) — what users
  see in the store. The deploy scripts move it on for you, once per release
  cycle; see [Automatic version bump](#automatic-version-bump) below. It is
  the only version number in the repo.
- **Build number** (iOS `buildNumber` / Android `versionCode`) — a
  monotonically increasing counter the stores use to order uploads. It is
  deliberately **absent from the repo**: `eas.json` sets
  `cli.appVersionSource: "remote"` and `build.production.autoIncrement`, so
  EAS stores and increments it server-side on every production build. Read
  the current value with:

  ```bash
  npx eas-cli build:version:get
  ```

Keeping the counter out of the repo means release builds never generate a
"bump build number" commit, and two branches can never fight over it. The
version bump described below never touches it, for the same reason: a local
copy of a number a remote system owns is either ignored or fought with.

## Automatic version bump

Before a deploy cuts its release branch, it moves `version` in
`app.config.ts` on by one, commits that to `main` and pushes:

```
chore(release): bump version to 1.1.0
```

Default is a **minor** bump. Ask for another level with `-Level`:

```powershell
./scripts/DeployiOSTestFlight.ps1 -Level patch   # 1.0.3 -> 1.0.4
./scripts/DeployiOSTestFlight.ps1 -Level major   # 1.0.3 -> 2.0.0
```

You can also run it on its own, without deploying:

```bash
npm run version:bump                 # minor
node scripts/release/version-bump.js bump --level patch
```

### Why running both deploys does not bump twice

Shipping iOS and Android back to back is two deploy scripts, and a naive
"bump every time" would put them on different versions. Before it does
anything else, the tool reads the subject of `HEAD`. If that is already a
bump commit it wrote, it prints `Already at 1.1.0. Nothing to bump.`, exits
successfully, and the deploy carries on at that version.

That is the whole mechanism, and it is deliberately not a flag:

- It reads a fact already in shared git history, so it works whichever order
  the two deploys run in, on one machine or two, minutes or days apart.
- It resets itself. The moment any real commit lands on `main`, `HEAD` is no
  longer a bump commit and the next deploy bumps again.
- Nothing has to be remembered. A `--skip-bump` flag on the second deploy
  would work right up until the day somebody forgot it.

### What it refuses

The bump commits to `main` automatically, so unlike the release-branch tool
it has no overrides at all:

| Refusal                                 | Fix                                                           |
| --------------------------------------- | ------------------------------------------------------------- |
| Not on `main`                           | `git switch main`                                             |
| Dirty working tree                      | Commit or stash first — there is no `--allow-dirty` here      |
| `main` differs from `origin/main`       | `git pull --ff-only origin main`, or push what is local       |
| A leftover `version-bump/<next>` branch | Check what it holds, then `git branch -D version-bump/<next>` |

The dirty-tree refusal has no escape hatch on purpose. Cutting a release
branch only points at a commit that already exists; a bump _creates_ one, and
an override would sweep unrelated local edits into an automatic commit on a
shared branch. Passing `-AllowDirty` to a deploy script therefore **skips the
bump entirely** rather than forcing it, and the script says so.

If `origin` cannot be reached at all, the out-of-sync check warns and lets
the bump through. It is a safety check, not a network dependency.

Adding a second file that has to carry the same version (a `package.json`, a
constants file) is one entry in `VERSION_FILES` in
[`scripts/release/lib/version.js`](../scripts/release/lib/version.js); both
files then move in the same commit and cannot drift.

## Normal release flow

1. Make sure you are on `main`, it is green, in sync with `origin/main`, and
   the working tree is clean. The deploy scripts commit the version bump to
   `main` and cut a [release branch](release-branches.md) from exactly what
   is checked out, and refuse a dirty tree by default.
2. Move the `[Unreleased]` notes in `CHANGELOG.md` under the version this
   release will carry. The deploy script writes the version number itself.
3. Run the deploy script for the platform:

   ```bash
   npm run deploy:ios        # build + submit to TestFlight
   npm run deploy:android    # build + submit to Play Store
   ```

   Each script verifies the Expo account, bumps the version and pushes that
   commit to `main`, cuts a `release/{platform}/{stamp}` branch, runs the EAS
   build and submit, and records the outcome as an annotated git tag — see
   [`docs/release-branches.md`](release-branches.md). Running the second
   platform straight afterwards reuses the same version rather than bumping
   again.

4. Update the store listing if the copy or screenshots changed:
   `bundle exec fastlane ios listing` / `android listing`.

Two prompts to watch on first runs:

- EAS may offer to log in to Apple with a **prefilled Apple ID from your
  local keychain** — which may be the wrong account. The correct values
  belong pinned in `eas.json` under `submit.production.ios` (`appleId`,
  `ascAppId`, `appleTeamId`); fill those in during project setup
  (see [`docs/new-project-from-template.md`](new-project-from-template.md)).
- Apple's export-compliance question is pre-answered by
  `ITSAppUsesNonExemptEncryption: false` in `app.config.ts` — appropriate
  for apps using only standard OS-level encryption (HTTPS, at-rest). If you
  add your own cryptography, revisit that answer.

## Troubleshooting

Real failures, with the diagnosis that was not obvious at the time.

### `Entity not authorized: AppEntity[...] action = READ`

Reads like a permissions problem on the Expo account. It almost never is —
it means the CLI is running **without your token** (or with the wrong one),
so EAS resolved you as an anonymous or different user who indeed cannot read
the project. Check `npx eas-cli whoami`, then check that `EXPO_TOKEN` is
actually set in the current shell (see the PowerShell note above). Only
after those two pass is it worth looking at account permissions.

### `The bundle version must be higher than the previously uploaded version: N`

Apple already has a build numbered `N` (often from a previous EAS project,
or a build submitted outside EAS), and EAS's remote counter is behind it.
Resubmitting the same IPA can never work: the build number is **baked into
the archive at build time**. Fix the counter, then rebuild:

```bash
npx eas-cli build:version:set   # set it above N
npm run deploy:ios              # new build, new number
```

### The build succeeded but submission hangs or asks questions in CI

Run submissions with `--non-interactive` (the deploy scripts already do).
Anything EAS would ask interactively — Apple credentials, missing metadata —
must be pre-answered in `eas.json` or App Store Connect; the error text
names the missing piece.
