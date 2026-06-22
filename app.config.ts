import type { ConfigContext } from 'expo/config';

// Return type is intentionally inferred — ExpoConfig doesn't yet declare newArchEnabled
export default ({ config }: ConfigContext) => ({
  ...config,
  name: 'ExpoTemplate',
  slug: 'expo-template',
  // Expo account/org that owns EAS builds for this project. Single source of
  // truth: the deploy/verify scripts read this `owner` to confirm you are
  // building under the correct account. Replace the placeholder below with
  // your real Expo account or organisation slug (see docs/expo-account.md).
  owner: 'your-expo-account',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'expo-template',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'dev.template.expo',
    buildNumber: '1',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#ffffff',
    },
    package: 'dev.template.expo',
    versionCode: 1,
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: ['expo-router', 'expo-font'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      // Pins this project to a specific EAS project under `owner` above.
      // Populated automatically by `npx eas-cli init`; replace the placeholder
      // UUID before your first cloud build (see docs/expo-account.md).
      projectId: '00000000-0000-0000-0000-000000000000',
    },
  },
});
