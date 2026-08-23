/**
 * The version-bump command line.
 *
 * The case worth having here is the absent one: there is no `--skip-bump`
 * and no `--no-bump`, and the parser refusing them is what keeps it that
 * way. The tool detects its own last commit, so a manual lever would only be
 * a second thing to get wrong.
 */
const { UsageError, parseArgs, usage } = require('../lib/versionOptions');

describe('parseArgs', () => {
  it('defaults to a minor bump of main on origin', () => {
    expect(parseArgs(['bump'])).toEqual({
      command: 'bump',
      level: 'minor',
      base: 'main',
      remote: 'origin',
    });
  });

  it('takes a level, a base branch and a remote', () => {
    expect(
      parseArgs([
        'bump',
        '--level',
        'patch',
        '--base',
        'trunk',
        '--remote',
        'upstream',
      ]),
    ).toEqual({
      command: 'bump',
      level: 'patch',
      base: 'trunk',
      remote: 'upstream',
    });
  });

  it('refuses a level it does not know', () => {
    expect(() => parseArgs(['bump', '--level', 'huge'])).toThrow(UsageError);
  });

  it('refuses a flag with no value', () => {
    expect(() => parseArgs(['bump', '--level'])).toThrow(UsageError);
    expect(() => parseArgs(['bump', '--level', '--base'])).toThrow(UsageError);
  });

  it('refuses a command it does not know, and an empty one', () => {
    expect(() => parseArgs(['bounce'])).toThrow(UsageError);
    expect(() => parseArgs([])).toThrow(UsageError);
  });

  it('has no way to skip the bump', () => {
    // The gate is automatic. A flag would be a second thing to get wrong,
    // and the one that has to be remembered is the one that gets forgotten.
    expect(() => parseArgs(['bump', '--skip-bump'])).toThrow(UsageError);
    expect(() => parseArgs(['bump', '--no-bump'])).toThrow(UsageError);
    expect(usage()).not.toContain('skip');
  });

  it('refuses a mistyped flag rather than ignoring it', () => {
    expect(() => parseArgs(['bump', '--levle', 'patch'])).toThrow(UsageError);
  });
});
