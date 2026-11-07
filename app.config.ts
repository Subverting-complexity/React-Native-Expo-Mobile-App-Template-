import type { ConfigContext } from 'expo/config';

const apiBaseUrl = process.env.API_BASE_URL?.trim();

// EAS sets EAS_BUILD on its build workers. Fail the cloud build, not the installed app.
if (process.env.EAS_BUILD && !apiBaseUrl) {
  throw new Error(
    'API_BASE_URL is not set for this EAS build. Add it to the EAS environment variables for this build profile.',
  );
}

// Return type is intentionally inferred — ExpoConfig doesn't yet declare newArchEnabled
export default ({ config }: ConfigContext) => ({
  ...config,
  name: 'ExpoTemplate',
  slug: 'expo-template',
  // Expo account/org that owns EAS builds for this project. Single source of
  // truth: the deploy/verify scripts read this `owner` to confirm you are
  // building under the correct account. Blank until you set your Expo account
  // or organisation slug (see docs/expo-account.md).
  owner: '',
  version: '1.0.0',
  orientation: 'portrait',
  // Placeholder app icon: a solid brand-colour square, 1024x1024 with no
  // transparency. EAS makes every platform size from it. Replace it before
  // you ship (see docs/app-artwork.md).
  icon: './assets/icon.png',
  scheme: 'expo-template',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'dev.template.expo',
    buildNumber: '1',
    infoPlist: {
      // Pre-answers Apple's export-compliance question on every submission.
      // Correct for apps that use only standard OS-level encryption (HTTPS,
      // at-rest). If you add your own cryptography, revisit this answer —
      // see docs/releasing.md.
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      // Replace assets/adaptive-icon.png with your real foreground
      // (1024x1024, art in the centre 66%). For Android 13+ themed icons, add
      // `monochromeImage` (see docs/app-artwork.md).
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'dev.template.expo',
    versionCode: 1,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    // Native splash screen. The backgrounds match the `background` token of
    // the default theme in light and dark mode, so the first themed screen
    // does not flash. Replace assets/splash-icon.png with your branding.
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        // Android 12+ shows only a 192dp circle of the splash icon. Keep the
        // art inside that circle, or its edges are cut off.
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#FFFFFF',
        dark: {
          backgroundColor: '#0D0D0D',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // The API base URL, fixed per build. Set API_BASE_URL in .env for local
    // runs and as an EAS environment variable for cloud builds. The app reads
    // it through `readApiBaseUrl()` in src/api; it is never a user setting.
    apiBaseUrl,
    eas: {
      // Pins this project to a specific EAS project under `owner` above.
      // Blank until `npx eas-cli init` writes it (see docs/expo-account.md).
      projectId: '',
    },
  },
});
