import type { ConfigContext } from 'expo/config';

// Return type is intentionally inferred — ExpoConfig doesn't yet declare newArchEnabled
export default ({ config }: ConfigContext) => ({
  ...config,
  name: 'ExpoTemplate',
  slug: 'expo-template',
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
});
