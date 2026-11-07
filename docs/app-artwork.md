# App artwork

This page lists the app icon, splash screen and store icon files, and the
platform rules that each one must follow. The template ships **placeholder**
artwork: solid brand-colour squares. Replace it before you ship.

## The files

| File                                              | Used for                          | Size and rules                                    |
| ------------------------------------------------- | --------------------------------- | ------------------------------------------------- |
| `assets/icon.png`                                 | App icon (iOS and the base icon). | 1024x1024, no transparency.                       |
| `assets/adaptive-icon.png`                        | Android adaptive icon foreground. | 1024x1024, transparent, art in the centre 66%.    |
| `assets/splash-icon.png`                          | Splash image.                     | See [The splash screen](#the-splash-screen).      |
| `assets/favicon.png`                              | Web browser tab icon.             | 48x48 or a larger square.                         |
| `fastlane/metadata/android/en-US/images/icon.png` | Google Play listing icon.         | 512x512, 32-bit PNG. Not in the template; add it. |

`app.config.ts` names every file except the Play listing icon. EAS Build
makes every platform size from them, so you do not make each resolution
yourself. The App Store takes its listing icon from the build, so iOS needs
no separate listing file. `fastlane android listing` uploads the Play
listing icon.

Keep the file names, and you only need to replace the image files. The
`VerifyAssets` step of the quality gate reads the evaluated config and
checks that every local image it names exists and is not empty. It does not
check the content.

## Android adaptive icons

Android launchers show only the centre 72 of the 108dp adaptive icon, then
cut it to a circle, a square or another shape. Keep the art inside the
centre 66% of `adaptive-icon.png`. `android.adaptiveIcon.backgroundColor`
fills the layer behind it.

Android 13 and later can tint icons to match the home screen. To support
this, add a white, transparent `adaptive-icon-monochrome.png` with the same
shape, and name it in `app.config.ts`:

```ts
adaptiveIcon: {
  foregroundImage: './assets/adaptive-icon.png',
  monochromeImage: './assets/adaptive-icon-monochrome.png',
  backgroundColor: '#ffffff',
},
```

## The splash screen

The `expo-splash-screen` plugin in `app.config.ts` sets the splash image,
its width (`imageWidth`, in dp) and the background colours.

- **Backgrounds.** The light and dark `backgroundColor` values must match
  the `background` token of the default theme. The root layout keeps the
  splash screen up until the fonts and the saved theme are ready, so equal
  colours stop a flash. A test in `src/build/__tests__/appConfig.test.ts`
  fails when they differ.
- **The Android 12+ circle.** Android 12 and later show only a 192dp circle
  of the splash image. Art outside it is cut off. A wide wordmark must stay
  under about 178dp wide.
- **A dark-mode image.** If the image does not read on the dark background,
  add a light version and name it under `dark`:

  ```ts
  dark: {
    image: './assets/splash-icon-dark.png',
    backgroundColor: '#0D0D0D',
  },
  ```

## Make the files from one source

Make every file from one source logo with a script, not by hand, so a new
logo is one command. Keep the source and the script in `assets/brand/`.
The script must:

1. Write each file in the table above at its size.
2. Put the adaptive icon art inside the safe zone.
3. Write a review sheet (gitignore it) that shows the icon at small sizes,
   in the Android round and square masks, and the splash inside the 192dp
   circle.
