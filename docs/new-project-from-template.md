# New project from template

This guide walks through adopting the template for a real app. By the end
you will have a renamed project with your own identifiers, Expo account,
API, tabs, colour palette, font and artwork, ready for development and
cloud builds.

## Prerequisites

- Node.js 22 (the version in `.nvmrc`) and npm.
- An [Expo](https://expo.dev) account (free tier is fine for development).
- Git.
- PowerShell 5.1 or later (ships with Windows; install
  [PowerShell 7](https://github.com/PowerShell/PowerShell) on macOS/Linux
  to use the `.ps1` scripts directly).

## 1. Clone or fork the template

If you want to track upstream template updates, fork the repository on
GitHub and clone your fork. If you want a clean start with no upstream
link, use GitHub's "Use this template" button or clone and re-init:

```bash
git clone <template-url> my-app
cd my-app
rm -rf .git
git init
git add -A
git commit -m "Initial commit from template"
```

Then install dependencies:

```bash
npm install
```

## 2. Rename the project

Several identifiers tie the project to its name and accounts. Update all
of them before your first build.

### app.config.ts

Open `app.config.ts` and set these values:

| Field                  | Template value        | Set it to                                                           |
| ---------------------- | --------------------- | ------------------------------------------------------------------- |
| `name`                 | `'ExpoTemplate'`      | Your app's display name (shown on the home screen).                 |
| `slug`                 | `'expo-template'`     | A URL-safe identifier for the Expo project (lowercase, hyphens OK). |
| `scheme`               | `'expo-template'`     | The deep-link scheme (e.g. `'my-app'` for `my-app://` links).       |
| `owner`                | `''` (blank)          | Your Expo account or organisation slug.                             |
| `ios.bundleIdentifier` | `'dev.template.expo'` | A reverse-domain bundle ID (e.g. `'com.mycompany.myapp'`).          |
| `android.package`      | `'dev.template.expo'` | The Android package name — typically matches the bundle ID.         |

Confirm the bundle ID before you create the App Store Connect and Play
Console records. After a store record exists, the ID cannot change.

### package.json

Change the `name` field from `"expo-template"` to your project's npm
package name (lowercase, no spaces). If the app is not open source, set
`"license"` to `"UNLICENSED"` and replace `LICENSE`. The MIT licence of this
template requires its notice to stay with copies of the template code, so
keep it in a `NOTICE` file.

### eas.json

The build profiles (`development`, `preview`, `production`) are generic —
no changes needed. The `submit.production` block leaves the Apple values
blank: before your first store submission, fill in `ios.appleId`,
`ios.ascAppId`, and `ios.appleTeamId` (from App Store Connect), and place
the Play service-account JSON at the path `android.serviceAccountKeyPath`
names (`pc-api-key.json`, which is gitignored).

### fastlane (store listing)

If you will publish to the stores, also update `APP_ID` in
`fastlane/Fastfile` and the identities in `fastlane/Appfile` to match your
bundle id and team, and work through the placeholder listing content —
[`fastlane/PUBLISHING.md`](../fastlane/PUBLISHING.md) is the field-by-field
checklist. This can wait until you are near a release; nothing else depends
on it.

### GitHub

Change the Discussions link in `.github/ISSUE_TEMPLATE/config.yml`, and the
issue links and contact details in `CONTRIBUTING.md` and
`CODE_OF_CONDUCT.md`.

## 3. Wire up EAS

EAS (Expo Application Services) handles cloud builds and store
submissions. Three things connect your project to the right Expo account:

1. **`owner`** in `app.config.ts` — the source of truth for which account
   owns this project. You set this in step 2.

2. **`extra.eas.projectId`** — links this repo to a specific EAS project.
   It is blank in the template. Generate it by running:

   ```bash
   npx eas-cli login          # if not already logged in
   npx eas-cli init           # prints the project ID
   ```

   `eas init` cannot edit a dynamic `app.config.ts`. It prints the
   project ID instead: copy that value into `extra.eas.projectId`.

3. **`EXPO_TOKEN`** (recommended) — a per-repo access token that overrides
   your global `eas login`, so this project always builds under the
   correct account regardless of what you are logged into elsewhere.

   ```bash
   cp .env.example .env
   # Open .env and paste your token after EXPO_TOKEN=
   ```

   Create the token at
   `https://expo.dev/accounts/<your-account>/settings/access-tokens`.

Verify the setup:

```bash
npm run verify:expo
```

This checks that `owner` and `projectId` are not blank, that `EXPO_TOKEN`
loaded, and that you are authenticated as the expected account.

For a deeper explanation of why the token matters and how the account
pinning works, see [Building under the correct Expo account](expo-account.md).

## 4. Point the app at your API

Every API call goes through the `ApiClient` from `useApi()` in `src/api/`.
Screens never call `fetch`. The base URL comes from the build, never from
a user setting:

1. For local runs, set `API_BASE_URL` in `.env` (for example
   `https://api.example.com`). A development build may use `http://` for a
   local backend; a release build must use `https://`.
2. For cloud builds, `.env` is not read. Set `API_BASE_URL` as an EAS
   environment variable for each environment your build profiles use. Each
   profile in `eas.json` names its environment (`development`, `preview` or `production`):

   ```bash
   npx eas-cli env:create --name API_BASE_URL --value <url> --environment development --visibility plaintext
   npx eas-cli env:create --name API_BASE_URL --value <url> --environment preview --visibility plaintext
   npx eas-cli env:create --name API_BASE_URL --value <url> --environment production --visibility plaintext
   ```

   An EAS build with no `API_BASE_URL` fails at once, so a build that cannot
   reach its API never reaches a store.

If your app has no backend, leave `API_BASE_URL` blank locally and delete
the guard at the top of `app.config.ts`. Once real endpoints exist, wrap the
generic `get` and `post` calls in typed endpoint functions. To add a
header, such as an auth token, add it in `buildInit` in
`src/api/httpApiClient.ts`. Tests and a demo mode pass their own client to
`ApiProvider`.

## 5. Set up the tabs

`TABS` in [`src/navigation/tabs.ts`](../src/navigation/tabs.ts) is the one
list of bottom tabs: order, titles, short labels and
[Ionicons](https://icons.expo.fyi) names. The template ships Home, Explore
and Settings.

- **Add a tab:** add a route file in `app/(tabs)/` and an entry in `TABS`
  with the same name. A test fails when the two disagree.
- **A tab that is not built yet:** render `FeaturePlaceholder` from
  `src/placeholders/`, as `app/(tabs)/explore.tsx` does. It shows the tab's
  icon and title, one sentence and a "Coming soon" badge over a faded
  preview.
- **Remove a tab:** delete its route file and its `TABS` entry.

## 6. Customise the font

The template ships with
[Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible),
chosen for readability and accessibility. To swap it for a different
Google Font:

1. **Install the font package.**

   ```bash
   npm install @expo-google-fonts/inter   # example: Inter
   ```

2. **Update the font-family tokens.** Open `src/theme/typography.ts` and
   change `FONT_FAMILIES` to the new font's family names (the exact names
   the `@expo-google-fonts` package exports). Add a key for each extra
   family, for example a serif for display text.

3. **Update the font loader.** Open `src/hooks/useAppFonts.ts` and update
   the `FONT_FILES` map. Its keys are the `FONT_FAMILIES` values, so the
   compiler flags a family that has no font file.

4. **Check the variant weights.** The `variants` object maps semantic
   roles (like `heading` and `body`) to a family and a weight. Use only the
   weights you load.

5. **Uninstall the old font package.**

   ```bash
   npm uninstall @expo-google-fonts/atkinson-hyperlegible
   ```

## 7. Customise the colours and themes

The template's colours meet WCAG AA contrast ratios. When you replace them
with your brand colours, the contrast test tells you if any pairing breaks
accessibility.

1. **Edit the palettes.** Open `src/theme/colors.ts` and change the hex
   values in `standardLightColors` and `standardDarkColors`. The
   `ColorPalette` interface makes every palette define the same slots — the
   compiler flags any you miss.

2. **Pay attention to `on*` tokens.** Each fill colour (`primary`,
   `secondary`, `success`, etc.) has a foreground colour (`onPrimary`,
   `onSecondary`, `onSuccess`) that sits on top of it. These pairings must
   meet at least 4.5:1 for normal text. The fill colours must also meet
   4.5:1 on `background`, `surface` and `surfaceVariant`, because links,
   text tones and soft badges draw them as text. A bright brand colour
   often fails this. If it does, use a darker shade for the token.

3. **Choose your themes.** `THEMES` in `src/theme/themes.ts` is the only
   list of themes. The template ships Standard and High contrast. Add your
   own, or remove High contrast; with one theme, Settings hides the theme
   choice. See [Theming](theming.md#add-a-theme).

4. **Match the splash screen.** Set the `expo-splash-screen` background
   colours in `app.config.ts` to the `background` token of your default
   theme, in light and dark mode. A test fails when they differ.

5. **Run the quality gate.**

   ```bash
   npm run quality
   ```

   If a contrast test fails, the output shows which pairing broke and by how
   much. Adjust the colour until the ratio clears the threshold: 4.5:1 for
   text, 3:1 for large text and non-text UI.

## 8. Replace the app icon and splash screen

The template ships **placeholder** artwork — solid brand-colour squares in
[`assets/`](../assets) — so the app builds and runs out of the box. Replace
it before shipping. [App artwork](app-artwork.md) lists every file, its
size, and the platform rules (the Android safe zone, the Android 12+ splash
circle, themed icons and a dark-mode splash image).

## 9. Remove what you do not need

The template includes demonstrations that a real app may not want:

- The **Component Gallery** (`app/gallery.tsx`, `src/gallery/`, and its
  test in `tests/app/`) and the Home button that opens it.
- The **example store** (`src/state/exampleStore.ts`). Keep the factory
  pattern it shows; delete the example.
- The **Explore** placeholder tab.

## 10. Verify everything

Run the full quality gate to confirm that the renamed, re-skinned project
compiles, passes lint, and meets the contrast and coverage thresholds:

```bash
npm run check
```

Then start the development server:

```bash
npm start
```

Press `w` for web, `i` for iOS simulator, or `a` for Android emulator.
Confirm that:

- The app launches with your colours and font.
- Light and dark modes both look correct.
- The splash screen background matches the first screen.

## 11. First cloud build

Once local development looks good, trigger a development build through
EAS:

```bash
npm run build:dev
```

Or use the deploy scripts for a platform-specific build:

```bash
npm run deploy:ios       # iOS TestFlight
npm run deploy:android   # Android Play Store internal track
```

These scripts run the Expo account verification automatically before
building, so a misconfigured account will fail early rather than producing
a build under the wrong project.

> **Store submission needs credentials (a manual step).** Building an artifact
> with `build:*` works as soon as your Expo account is wired up. **Submitting**
> it to the App Store or Play Store (`npm run submit:ios` / `submit:android`,
> and the submit half of the deploy scripts) needs store credentials that are
> not in this repo: an App Store Connect API key / app ID for iOS, and a Google
> Play service-account key for Android. Add them to the `submit.production`
> profile in [`eas.json`](../eas.json) (or supply them interactively) — see the
> [EAS Submit docs](https://docs.expo.dev/submit/introduction/). This is a
> human setup step; the template intentionally ships the profile empty.

## Quick-reference checklist

- [ ] Cloned or forked the template and ran `npm install`.
- [ ] Set `name`, `slug`, `scheme`, `owner`, `bundleIdentifier`, and
      `package` in `app.config.ts`.
- [ ] Set `name` (and `license`, if needed) in `package.json`.
- [ ] Updated the GitHub links and contacts.
- [ ] Ran `npx eas-cli init` and copied the `projectId` into `app.config.ts`.
- [ ] Created an `EXPO_TOKEN` and added it to `.env`.
- [ ] Ran `npm run verify:expo` to confirm account setup.
- [ ] Set `API_BASE_URL` in `.env`, and as an EAS environment variable for
      each build environment (or removed the guard if there is no API).
- [ ] Set up the tabs in `TABS` and `app/(tabs)/`.
- [ ] Swapped the font (or kept Atkinson Hyperlegible).
- [ ] Customised the palettes and the theme list.
- [ ] Replaced the placeholder artwork in `assets/`.
- [ ] Removed the demonstrations you do not need.
- [ ] (If submitting to stores) added store credentials to `eas.json`, and
      updated the identities in `fastlane/Fastfile` / `fastlane/Appfile`.
- [ ] (If submitting to stores) rewrote the placeholder listing content in
      `fastlane/metadata/` — see `fastlane/PUBLISHING.md`.
- [ ] Ran `npm run check` with all checks passing.
- [ ] Started the dev server and verified the app launches correctly.
