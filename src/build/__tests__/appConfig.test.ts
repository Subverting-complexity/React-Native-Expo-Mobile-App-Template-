import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { DEFAULT_THEME_NAME, THEMES } from '@/theme';

const APP_CONFIG_PATH = resolve(__dirname, '../../../app.config.ts');

describe('the committed app.config.ts', () => {
  const content = readFileSync(APP_CONFIG_PATH, 'utf8');

  it('defines ios.buildNumber as a quoted integer string', () => {
    expect(content).toMatch(/buildNumber:\s*'\d+'/);
  });

  it('defines android.versionCode as a bare integer', () => {
    expect(content).toMatch(/versionCode:\s*\d+/);
  });

  it('defines a semver version string', () => {
    expect(content).toMatch(/version:\s*'\d+\.\d+\.\d+'/);
  });
});

describe('the EAS build guard in app.config.ts', () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
  });

  function loadConfig() {
    jest.isolateModules(() => {
      // The guard runs at module load, so each case loads a fresh copy.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(APP_CONFIG_PATH);
    });
  }

  it('fails an EAS build that has no API base URL', () => {
    process.env.EAS_BUILD = 'true';
    process.env.API_BASE_URL = '  ';
    expect(loadConfig).toThrow('API_BASE_URL is not set');
  });

  it('loads for an EAS build that has an API base URL', () => {
    process.env.EAS_BUILD = 'true';
    process.env.API_BASE_URL = 'https://api.example.com';
    expect(loadConfig).not.toThrow();
  });

  it('loads outside EAS without an API base URL', () => {
    delete process.env.EAS_BUILD;
    delete process.env.API_BASE_URL;
    expect(loadConfig).not.toThrow();
  });
});

describe('the splash screen in app.config.ts', () => {
  interface SplashOptions {
    backgroundColor: string;
    dark?: { backgroundColor?: string };
  }

  function splashOptions(): SplashOptions {
    let options: SplashOptions | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const configFn = require(APP_CONFIG_PATH).default as (ctx: {
        config: object;
      }) => { plugins: unknown[] };
      const plugin = configFn({ config: {} }).plugins.find(
        (entry): entry is [string, SplashOptions] =>
          Array.isArray(entry) && entry[0] === 'expo-splash-screen',
      );
      options = plugin?.[1];
    });
    if (!options) {
      throw new Error('app.config.ts has no expo-splash-screen plugin');
    }
    return options;
  }

  // The splash stays up until the saved theme loads, then the first screen
  // appears. Matching backgrounds stop a flash of a different colour.
  it('uses the default theme background in light mode', () => {
    expect(splashOptions().backgroundColor.toUpperCase()).toBe(
      THEMES[DEFAULT_THEME_NAME].light.colors.background.toUpperCase(),
    );
  });

  it('uses the default theme background in dark mode', () => {
    expect(splashOptions().dark?.backgroundColor?.toUpperCase()).toBe(
      THEMES[DEFAULT_THEME_NAME].dark.colors.background.toUpperCase(),
    );
  });
});
