# New project from template

This guide walks through adopting the template for a real app. By the end
you will have a renamed project with your own identifiers, Expo account,
color palette, and font — ready for development and cloud builds.

## Prerequisites

- Node.js (LTS) and npm installed.
- An [Expo](https://expo.dev) account (free tier is fine for development).
- Git.
- PowerShell 5.1 or later (ships with Windows; install
  [PowerShell Core](https://github.com/PowerShell/PowerShell) on macOS/Linux
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

Six identifiers tie the project to its name and accounts. Update all of
them before your first build.

### app.config.ts

Open `app.config.ts` and replace the placeholder values:

| Field                   | Template value                            | Replace with                                                                 |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `name`                  | `'ExpoTemplate'`                          | Your app's display name (shown on the home screen).                          |
| `slug`                  | `'expo-template'`                         | A URL-safe identifier for the Expo project (lowercase, hyphens OK).          |
| `scheme`                | `'expo-template'`                         | The deep-link scheme (e.g. `'my-app'` for `my-app://` links).               |
| `owner`                 | `'your-expo-account'`                     | Your Expo account or organisation slug.                                      |
| `ios.bundleIdentifier`  | `'dev.template.expo'`                     | A reverse-domain bundle ID (e.g. `'com.mycompany.myapp'`).                  |
| `android.package`       | `'dev.template.expo'`                     | The Android package name — typically matches the bundle ID.                  |

### package.json

Change the `name` field from `"expo-template"` to your project's npm
package name (lowercase, no spaces).

### eas.json

No changes needed — the build profiles (`development`, `preview`,
`production`) are generic. Customise them later when you set up internal
distribution or store submissions.

## 3. Wire up EAS

EAS (Expo Application Services) handles cloud builds and store
submissions. Three things connect your project to the right Expo account:

1. **`owner`** in `app.config.ts` — the source of truth for which account
   owns this project. You set this in step 2.

2. **`extra.eas.projectId`** — links this repo to a specific EAS project.
   Generate it by running:

   ```bash
   npx eas-cli login          # if not already logged in
   npx eas-cli init           # writes the real projectId into app.config.ts
   ```

   This replaces the placeholder UUID
   (`00000000-0000-0000-0000-000000000000`) with your project's actual ID.

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

This checks that `owner` is not still a placeholder, that `EXPO_TOKEN`
loaded, and that you are authenticated as the expected account.

For a deeper explanation of why the token matters and how the account
pinning works, see [Building under the correct Expo account](expo-account.md).

## 4. Customise the font

The template ships with
[Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible),
chosen for readability and accessibility. To swap it for a different
Google Font:

1. **Install the font package.**

   ```bash
   npm install @expo-google-fonts/inter   # example: Inter
   ```

2. **Update the font loader.** Open `src/hooks/useAppFonts.ts` and
   replace the Atkinson imports and `useFonts` entries with the new font's
   variants. Load at least a regular and a bold weight.

3. **Update the font-family tokens.** Open `src/theme/typography.ts` and
   change the `FONT_FAMILIES` object to reference the new font's family
   strings (the exact strings the `@expo-google-fonts` package exports).

4. **Check the variant weights.** The `variants` object maps semantic
   roles (like `heading` and `body`) to a font family and weight. If the
   new font supports weights beyond regular (400) and bold (700), you can
   use them in the variant definitions. If it supports fewer, adjust the
   variants to only reference weights you are loading.

5. **Uninstall the old font package.**

   ```bash
   npm uninstall @expo-google-fonts/atkinson-hyperlegible
   ```

6. **Run the quality gate** to confirm nothing broke:

   ```bash
   npm run quality
   ```

## 5. Customise the color palette

The template's colors are designed to meet WCAG AA contrast ratios out of
the box. When you replace them with your brand colors, the automated
contrast test will tell you if any pairing breaks accessibility.

1. **Edit the palettes.** Open `src/theme/colors.ts` and change the hex
   values in `lightColors` and `darkColors`. The `ColorPalette` interface
   enforces that both palettes define the same set of slots — the compiler
   will flag any that you miss.

2. **Pay attention to `on*` tokens.** Each fill color (`primary`,
   `secondary`, `success`, etc.) has a corresponding foreground color
   (`onPrimary`, `onSecondary`, `onSuccess`) that sits on top of it. Make
   sure these pairings meet at least 4.5:1 contrast for normal text. The
   contrast test will verify this automatically.

3. **Run the quality gate.**

   ```bash
   npm run quality
   ```

   If a contrast test fails, the output will show which pairing broke and
   by how much. Adjust the failing color until the ratio clears the
   threshold — 4.5:1 for body text, 3:1 for large text and non-text UI.

For a complete reference of the token categories and how to extend them,
see the [Theming guide](theming.md).

## 6. Verify everything

Run the full quality gate to confirm that the renamed, re-skinned project
compiles, passes lint, and meets the contrast and coverage thresholds:

```bash
npm run quality
```

Then start the development server:

```bash
npm start
```

Press `w` for web, `i` for iOS simulator, or `a` for Android emulator.
Confirm that:

- The app launches with your colors and font.
- Light and dark modes both look correct.
- The component gallery (if present) shows your updated tokens.

## 7. First cloud build

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

## Quick-reference checklist

- [ ] Cloned or forked the template and ran `npm install`.
- [ ] Updated `name`, `slug`, `scheme`, `owner`, `bundleIdentifier`, and
      `package` in `app.config.ts`.
- [ ] Updated `name` in `package.json`.
- [ ] Ran `npx eas-cli init` to generate the real `projectId`.
- [ ] Created an `EXPO_TOKEN` and added it to `.env`.
- [ ] Ran `npm run verify:expo` to confirm account setup.
- [ ] Swapped the font (or kept Atkinson Hyperlegible).
- [ ] Customised the color palettes in `colors.ts`.
- [ ] Ran `npm run quality` with all checks passing.
- [ ] Started the dev server and verified the app launches correctly.
