import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
