# Building under the correct Expo account

Cloud builds and store submissions run through [EAS](https://docs.expo.dev/eas/)
against **one specific Expo account or organisation**. If you work across several
projects, each tied to a different Expo account, it's easy to accidentally build
under the wrong one. This template pins the account explicitly and verifies it
before every build.

> This template ships with **placeholder** account details. Replace them with
> your real organisation's information before your first build (see
> [Configure this project](#configure-this-project)).

## How the account is pinned

Two things decide which Expo account a build runs under, plus one check that
catches mistakes early:

| Layer                     | Where                                       | Role                                                                                                                            |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **`owner`**               | `app.config.ts`                             | The single source of truth for which Expo account/org owns this project. EAS uses it to route the build.                        |
| **`extra.eas.projectId`** | `app.config.ts`                             | Pins this project to a specific EAS project under `owner`. Written by `eas init`.                                               |
| **`EXPO_TOKEN`**          | `.env` (gitignored)                         | Authenticates EAS as a user with access to `owner`, **independent of your global `eas login`** — so other repos are unaffected. |
| **Account check**         | `scripts/Common.ps1` → `Assert-ExpoAccount` | Loads `.env`, confirms `owner` isn't still a placeholder, and reports who you're logged in as — before a build starts.          |

The key idea: `owner` lives in version control as the source of truth, and
`EXPO_TOKEN` lives in a local `.env` so this repo always talks to its own
account no matter what you're globally logged into elsewhere.

## Configure this project

One-time setup when you adopt this template for a real app:

1. **Set the owner.** In [`app.config.ts`](../app.config.ts), replace the
   placeholder `owner: 'your-expo-account'` with your Expo account or
   organisation slug (the name in your `https://expo.dev/accounts/<slug>` URL).

2. **Link the EAS project.** From the repo root:

   ```powershell
   npx eas-cli login          # if you aren't already logged in
   npx eas-cli init           # writes the real extra.eas.projectId into app.config.ts
   ```

3. **Add a per-repo token (recommended).** Create a personal access token at
   `https://expo.dev/accounts/<your-account>/settings/access-tokens`, then:

   ```powershell
   Copy-Item .env.example .env
   # open .env and paste the token after EXPO_TOKEN=
   ```

   `.env` is gitignored — the token never gets committed. With it set, EAS
   builds under this repo's account regardless of your global `eas login`.

4. **Verify.**

   ```powershell
   npm run verify:expo
   ```

   You should see the configured owner, that `EXPO_TOKEN` loaded, and the EAS
   account you're authenticated as — with no placeholder warnings.

## Verifying before a build

- **`npm run verify:expo`** — reports the owner, whether `EXPO_TOKEN` is set,
  and the logged-in EAS account. Fails if you aren't logged in.
- **Double-click `scripts/VerifyExpoAccount.cmd`** — same check, keeps the
  window open so you can read it.
- The deploy scripts (`npm run deploy:ios` / `npm run deploy:android`, or their
  `.cmd` wrappers) run this check automatically before building, so a
  misconfigured account stops the build early instead of producing an artifact
  under the wrong account.

## Why a per-repo `EXPO_TOKEN`

`eas login` is global to your machine — every repo shares it. If your default
login is a work or personal account but this project belongs to a different
organisation, an unguarded `eas build` would target the wrong account. Putting
`EXPO_TOKEN` in this repo's `.env` overrides the global session **for this repo
only**, so each project keeps building under its own account with no manual
account-switching.

## CI

In CI there's no interactive `eas login`. Provide the account by setting the
`EXPO_TOKEN` environment variable from a secret (e.g. a GitHub Actions secret)
to a token scoped to the `owner` account. The same `Assert-ExpoAccount` check
honours an already-set `EXPO_TOKEN`, so it works identically locally and in CI.

## Files involved

| File                                                             | Purpose                                                         |
| ---------------------------------------------------------------- | --------------------------------------------------------------- |
| `app.config.ts`                                                  | `owner` + `extra.eas.projectId` — the committed account pins.   |
| `.env.example`                                                   | Token-less template; copy to `.env` and add `EXPO_TOKEN`.       |
| `.env`                                                           | Your real token (gitignored).                                   |
| `scripts/Common.ps1`                                             | `Import-DotEnv`, `Get-ExpoOwner`, `Assert-ExpoAccount` helpers. |
| `scripts/VerifyExpoAccount.ps1`                                  | Standalone account check (`npm run verify:expo`).               |
| `scripts/DeployiOSTestFlight.ps1` / `DeployAndroidPlayStore.ps1` | Run the check before building.                                  |
