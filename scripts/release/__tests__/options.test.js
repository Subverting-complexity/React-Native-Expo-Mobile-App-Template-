/**
 * The release-branch command line. An unknown flag must error rather than be
 * ignored — silently dropping a mistyped `--no-prume` is how a run that
 * should have skipped pruning goes and prunes anyway.
 */
const { UsageError, parseArgs, usage } = require('../lib/options');

describe('parseArgs', () => {
  it('parses a start command', () => {
    expect(
      parseArgs(['start', '--platform', 'ios', '--profile', 'production']),
    ).toMatchObject({
      command: 'start',
      platform: 'ios',
      profile: 'production',
      allowDirty: false,
    });
  });

  it('parses a full finish command with conversions', () => {
    const options = parseArgs([
      'finish',
      '--platform',
      'android',
      '--outcome',
      'success',
      '--duration',
      '00:14:02',
      '--exit-code',
      '0',
      '--submitted',
      'yes',
    ]);
    expect(options).toMatchObject({
      command: 'finish',
      outcome: 'success',
      exitCode: 0,
      submitted: true,
    });
  });

  it('parses prune flags', () => {
    expect(parseArgs(['prune', '--keep-days', '7', '--dry-run'])).toMatchObject(
      {
        command: 'prune',
        keepDays: 7,
        dryRun: true,
      },
    );
  });

  it.each([
    [[], 'no command'],
    [['launch'], 'unknown command'],
    [['start'], 'start without platform'],
    [['start', '--platform', 'ios', '--no-prume'], 'mistyped flag'],
    [['start', '--platform'], 'flag without value'],
    [['finish', '--platform', 'ios'], 'finish without outcome'],
    [['finish', '--platform', 'ios', '--outcome', 'exploded'], 'bad outcome'],
    [
      [
        'finish',
        '--platform',
        'ios',
        '--outcome',
        'success',
        '--submitted',
        'maybe',
      ],
      'bad submitted',
    ],
    [['prune', '--keep-days', 'soon'], 'non-integer keep-days'],
  ])('refuses %s (%s)', (argv) => {
    expect(() => parseArgs(argv)).toThrow(UsageError);
  });

  it('documents every command in usage()', () => {
    const text = usage();
    for (const command of ['start', 'finish', 'prune', 'help']) {
      expect(text).toContain(command);
    }
  });
});
