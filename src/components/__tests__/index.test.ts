import { readdirSync } from 'fs';
import { join } from 'path';

import * as components from '../index';

/**
 * Guard for the public component barrel (#29). Every `App*` component must
 * be reachable from the single `@/components` import path. The expected set
 * is derived from the `App*.tsx` files on disk — not a hardcoded list — so a
 * component added without a matching `export *` line in `index.ts` fails this
 * test, keeping the "single import path works app-wide" acceptance honest.
 *
 * Each `App*.tsx` file exports a component named exactly after the file, so the
 * filename (minus `.tsx`) is the symbol expected on the barrel.
 */
const COMPONENTS_DIR = join(__dirname, '..');

const EXPECTED_COMPONENTS = readdirSync(COMPONENTS_DIR)
  .filter((file) => /^App[A-Za-z]+\.tsx$/.test(file))
  .map((file) => file.replace(/\.tsx$/, ''))
  .sort();

describe('components barrel', () => {
  it('discovers App* components on disk', () => {
    expect(EXPECTED_COMPONENTS.length).toBeGreaterThan(0);
  });

  it.each(EXPECTED_COMPONENTS)('re-exports %s as a component', (name) => {
    expect(typeof (components as Record<string, unknown>)[name]).toBe(
      'function',
    );
  });
});
