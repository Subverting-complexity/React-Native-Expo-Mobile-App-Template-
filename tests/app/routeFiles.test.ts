import fs from 'fs';
import path from 'path';

import { TAB_NAMES } from '@/navigation';

// Expo Router loads every .ts/.tsx file under app/ as a route, test files
// included, and refuses to start when one is named `+…`. Screen tests
// therefore live here in tests/app/, never under app/.
const APP_DIR = path.join(__dirname, '..', '..', 'app');

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

describe('app/ route files', () => {
  const files = listFiles(APP_DIR).map((file) => path.relative(APP_DIR, file));

  it('finds the route files (an empty list is a misconfigured test)', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('holds no test files, because Expo Router would load them as routes', () => {
    const testFiles = files.filter(
      (file) =>
        /(^|[\\/])__tests__[\\/]/.test(file) || /\.test\.[tj]sx?$/.test(file),
    );
    expect(testFiles).toEqual([]);
  });
});

describe('app/(tabs) route files', () => {
  it('match the TABS list, so every tab file has a tab and every tab a file', () => {
    const routes = fs
      .readdirSync(path.join(APP_DIR, '(tabs)'))
      .filter((file) => !file.startsWith('_'))
      .map((file) => file.replace(/\.tsx?$/, ''));
    expect([...routes].sort()).toEqual([...TAB_NAMES].sort());
  });
});
