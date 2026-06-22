/**
 * Account-free validation for the project's EAS build configuration.
 *
 * `eas.json` drives every cloud build and store submission, but the only
 * official way to "validate" it is to run an `eas` command that requires an
 * Expo account — something this template deliberately never provisions. This
 * module is the single source of truth for the *shape* a valid eas.json must
 * have, so the quality gate (and CI) can assert the profiles are well-formed
 * with no network and no credentials.
 *
 * The check is pure over already-parsed data; the file read is injected (see
 * `loadEasConfig`) so the validator stays unit-testable in isolation.
 */

/** Build profiles every project copy of eas.json must define. */
export const REQUIRED_BUILD_PROFILES = ['development', 'preview', 'production'] as const;

export type RequiredBuildProfile = (typeof REQUIRED_BUILD_PROFILES)[number];

/** Outcome of {@link validateEasConfig}: validity plus a flat list of reasons. */
export interface EasConfigValidation {
  valid: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Assert a single build profile carries the invariants its role requires.
 * `development` ships a dev client over internal distribution; `preview` is an
 * internal-distribution build; `production` auto-increments the build number
 * (paired with `cli.appVersionSource: remote`). Reasons are pushed onto the
 * shared `errors` list so every problem surfaces in one pass.
 */
function checkBuildProfile(
  name: RequiredBuildProfile,
  profile: Record<string, unknown>,
  errors: string[],
): void {
  if (name === 'development' && profile.developmentClient !== true) {
    errors.push('build.development.developmentClient must be true');
  }
  if (
    (name === 'development' || name === 'preview') &&
    profile.distribution !== 'internal'
  ) {
    errors.push(`build.${name}.distribution must be "internal"`);
  }
  if (name === 'production' && profile.autoIncrement !== true) {
    errors.push('build.production.autoIncrement must be true');
  }
}

/**
 * Validate an already-parsed eas.json object against the template's required
 * shape. Returns every problem found rather than throwing on the first, so a
 * failing quality gate reports the whole list at once.
 */
export function validateEasConfig(raw: unknown): EasConfigValidation {
  if (!isRecord(raw)) {
    return { valid: false, errors: ['eas.json must be a JSON object'] };
  }

  const errors: string[] = [];

  const cli = raw.cli;
  if (!isRecord(cli)) {
    errors.push('missing "cli" object');
  } else if (cli.appVersionSource !== 'remote') {
    errors.push('cli.appVersionSource must be "remote"');
  }

  const build = raw.build;
  if (!isRecord(build)) {
    errors.push('missing "build" object');
  } else {
    for (const name of REQUIRED_BUILD_PROFILES) {
      const profile = build[name];
      if (!isRecord(profile)) {
        errors.push(`missing build profile "${name}"`);
        continue;
      }
      checkBuildProfile(name, profile, errors);
    }
  }

  const submit = raw.submit;
  if (!isRecord(submit) || !isRecord(submit.production)) {
    errors.push('missing "submit.production" object');
  }

  return { valid: errors.length === 0, errors };
}

/** Reads a file's UTF-8 text. Matches `fs.readFileSync(path, 'utf8')`. */
export type FileReader = (path: string) => string;

/**
 * Parse and validate the eas.json at `path`. The reader is injected so tests
 * drive it without touching the filesystem; production callers pass
 * `(p) => readFileSync(p, 'utf8')`. Unreadable or non-JSON input is reported
 * as a validation error rather than thrown, keeping the caller's flow flat.
 */
export function loadEasConfig(path: string, readFile: FileReader): EasConfigValidation {
  let raw: unknown;
  try {
    raw = JSON.parse(readFile(path));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { valid: false, errors: [`eas.json is not readable JSON: ${detail}`] };
  }
  return validateEasConfig(raw);
}
