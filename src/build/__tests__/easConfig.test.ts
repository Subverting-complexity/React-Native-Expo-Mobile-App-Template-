import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  loadEasConfig,
  REQUIRED_BUILD_PROFILES,
  validateEasConfig,
} from '../easConfig';

/** Path to the committed eas.json, four levels up from this test file. */
const EAS_JSON_PATH = resolve(__dirname, '../../../eas.json');

/** A minimal config that passes every rule; tests mutate clones of it. */
function validConfig(): Record<string, unknown> {
  return {
    cli: { version: '>= 20.2.0', appVersionSource: 'remote' },
    build: {
      development: { developmentClient: true, distribution: 'internal' },
      preview: { distribution: 'internal' },
      production: { autoIncrement: true },
    },
    submit: { production: {} },
  };
}

describe('the committed eas.json', () => {
  it('validates against the required profile shape', () => {
    const result = loadEasConfig(EAS_JSON_PATH, (p) => readFileSync(p, 'utf8'));
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('defines every required build profile', () => {
    const raw = JSON.parse(readFileSync(EAS_JSON_PATH, 'utf8')) as {
      build: Record<string, unknown>;
    };
    for (const name of REQUIRED_BUILD_PROFILES) {
      expect(raw.build[name]).toBeDefined();
    }
  });
});

describe('validateEasConfig', () => {
  it('accepts a well-formed config', () => {
    expect(validateEasConfig(validConfig())).toEqual({ valid: true, errors: [] });
  });

  it('rejects a non-object', () => {
    const result = validateEasConfig('not an object');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('eas.json must be a JSON object');
  });

  it('flags a missing build object', () => {
    const result = validateEasConfig({
      cli: { appVersionSource: 'remote' },
      submit: { production: {} },
    });
    expect(result.errors).toContain('missing "build" object');
  });

  it('flags a missing build profile', () => {
    const config = validConfig();
    delete (config.build as Record<string, unknown>).preview;
    const result = validateEasConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('missing build profile "preview"');
  });

  it('requires the development profile to ship a dev client', () => {
    const config = validConfig();
    (config.build as Record<string, Record<string, unknown>>).development.developmentClient =
      false;
    const result = validateEasConfig(config);
    expect(result.errors).toContain('build.development.developmentClient must be true');
  });

  it('requires development and preview to use internal distribution', () => {
    const config = validConfig();
    (config.build as Record<string, Record<string, unknown>>).preview.distribution = 'store';
    const result = validateEasConfig(config);
    expect(result.errors).toContain('build.preview.distribution must be "internal"');
  });

  it('requires production to auto-increment the build number', () => {
    const config = validConfig();
    delete (config.build as Record<string, Record<string, unknown>>).production.autoIncrement;
    const result = validateEasConfig(config);
    expect(result.errors).toContain('build.production.autoIncrement must be true');
  });

  it('requires cli.appVersionSource to be remote', () => {
    const config = validConfig();
    (config.cli as Record<string, unknown>).appVersionSource = 'local';
    const result = validateEasConfig(config);
    expect(result.errors).toContain('cli.appVersionSource must be "remote"');
  });

  it('requires a submit.production block', () => {
    const config = validConfig();
    delete config.submit;
    const result = validateEasConfig(config);
    expect(result.errors).toContain('missing "submit.production" object');
  });

  it('reports every problem in a single pass', () => {
    const result = validateEasConfig({ build: {}, submit: {} });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('loadEasConfig', () => {
  it('validates JSON produced by the injected reader', () => {
    const result = loadEasConfig('eas.json', () => JSON.stringify(validConfig()));
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('reports unreadable JSON as a validation error rather than throwing', () => {
    const result = loadEasConfig('eas.json', () => '{ not json');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/not readable JSON/);
  });

  it('handles a reader that throws a non-Error value', () => {
    const result = loadEasConfig('eas.json', () => {
      throw 'disk gone';
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/disk gone/);
  });
});
