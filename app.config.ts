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
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#ffffff',
    },
    package: 'dev.template.expo',
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
});
