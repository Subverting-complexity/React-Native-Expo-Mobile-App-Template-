/**
 * The naming and retention rules for release branches and outcome tags.
 *
 * These are the rules that decide what gets deleted, so they are pinned
 * here, against the pure module, with no git involved. The one invariant
 * that matters most: a name the module does not recognise is never returned
 * by the pruner, because deleting a branch is the one act running the tool
 * again cannot undo.
 */
const {
  DEFAULT_KEEP_DAYS,
  ReleaseNameError,
  availableBranchName,
  branchNameFor,
  buildTagMessage,
  formatStamp,
  parseBranchName,
  parseStamp,
  parseTagName,
  selectPrunable,
  tagNameFor,
} = require('../lib/releaseBranch');

const noon = new Date(2026, 7, 13, 14, 32); // 2026-08-13 14:32 local

describe('stamps', () => {
  it('formats local time as YYYY-MM-DD-HHmm', () => {
    expect(formatStamp(noon)).toBe('2026-08-13-1432');
  });

  it('round-trips through parseStamp', () => {
    expect(parseStamp(formatStamp(noon))).toEqual(noon);
  });

  it('rejects a stamp that only looks like a date', () => {
    // new Date(2026, 12, 40) would silently roll into the next year; the
    // bounds check refuses it instead of pruning against the wrong month.
    expect(parseStamp('2026-13-40-1432')).toBeNull();
    expect(parseStamp('2026-02-30-0000')).toBeNull();
    expect(parseStamp('not-a-stamp')).toBeNull();
  });
});

describe('names', () => {
  it('builds a branch name from platform and date', () => {
    expect(branchNameFor('ios', noon)).toBe('release/ios/2026-08-13-1432');
  });

  it('refuses a platform that does not ship to a store', () => {
    expect(() => branchNameFor('web', noon)).toThrow(ReleaseNameError);
  });

  it('builds the tag from the branch name, not the clock', () => {
    expect(tagNameFor('release/ios/2026-08-13-1432', 'success')).toBe(
      'release/ios/2026-08-13-1432-success',
    );
  });

  it('refuses to tag a name that is not a release branch', () => {
    expect(() => tagNameFor('feature/thing', 'success')).toThrow(
      ReleaseNameError,
    );
    expect(() => tagNameFor('release/ios/2026-08-13-1432', 'exploded')).toThrow(
      ReleaseNameError,
    );
  });

  it('never mistakes a tag for a branch', () => {
    // The anchored pattern is what keeps a tag out of the deletion list.
    expect(parseBranchName('release/ios/2026-08-13-1432')).toEqual({
      platform: 'ios',
      stamp: '2026-08-13-1432',
    });
    expect(parseBranchName('release/ios/2026-08-13-1432-success')).toBeNull();
  });

  it('parses a tag name including its outcome', () => {
    expect(parseTagName('release/android/2026-08-13-1432-failed')).toEqual({
      platform: 'android',
      stamp: '2026-08-13-1432',
      outcome: 'failed',
    });
    expect(parseTagName('release/android/2026-08-13-1432')).toBeNull();
  });
});

describe('availableBranchName', () => {
  it('walks the stamp forward when two runs collide in the same minute', () => {
    const taken = [
      'release/ios/2026-08-13-1432',
      'release/ios/2026-08-13-1433',
    ];
    expect(availableBranchName('ios', noon, taken)).toBe(
      'release/ios/2026-08-13-1434',
    );
  });

  it('gives up rather than looping forever', () => {
    const taken = [];
    for (let minute = 0; minute < 120; minute += 1) {
      const date = new Date(noon.getTime() + minute * 60_000);
      taken.push(branchNameFor('ios', date));
    }
    expect(() => availableBranchName('ios', noon, taken, 60)).toThrow(
      ReleaseNameError,
    );
  });
});

describe('buildTagMessage', () => {
  it('writes greppable key: value lines and drops blank fields', () => {
    const message = buildTagMessage({
      branch: 'release/ios/2026-08-13-1432',
      platform: 'ios',
      outcome: 'success',
      commit: 'abc123',
      profile: 'production',
      duration: '00:14:02',
      exitCode: 0,
      submitted: true,
      notes: '',
    });
    expect(message).toContain('Released: ios release/ios/2026-08-13-1432');
    expect(message).toContain('Profile: production');
    expect(message).toContain('Exit code: 0');
    expect(message).toContain('Submitted: yes');
    // Blank notes say nothing rather than claiming they were blank.
    expect(message).not.toContain('Notes:');
  });
});

describe('selectPrunable', () => {
  const now = new Date(2026, 7, 13);
  const old = 'release/ios/2026-06-01-1000'; // 73 days before `now`
  const fresh = 'release/ios/2026-08-10-1000'; // 3 days before `now`

  it('keeps a successful branch forever', () => {
    const plan = selectPrunable({
      branches: [old],
      tags: [`${old}-success`],
      now,
    });
    expect(plan.kept).toEqual([old]);
    expect(plan.failed).toEqual([]);
  });

  it('keeps any branch younger than the window, failed or not', () => {
    const plan = selectPrunable({
      branches: [fresh],
      tags: [`${fresh}-failed`],
      now,
    });
    expect(plan.kept).toEqual([fresh]);
  });

  it('prunes an old failed branch and an old untagged one, separately', () => {
    const untagged = 'release/android/2026-06-01-1000';
    const plan = selectPrunable({
      branches: [old, untagged],
      tags: [`${old}-failed`],
      now,
    });
    expect(plan.failed).toEqual([old]);
    expect(plan.unfinished).toEqual([untagged]);
  });

  it('a retried run with both a failure and a success is kept', () => {
    const plan = selectPrunable({
      branches: [old],
      tags: [`${old}-failed`, `${old}-success`],
      now,
    });
    expect(plan.kept).toEqual([old]);
  });

  it('keeps two platforms with the same stamp from contaminating each other', () => {
    // iOS and Android deployed in the same minute share a stamp. The success
    // on one must not save the failure on the other.
    const ios = 'release/ios/2026-06-01-1000';
    const android = 'release/android/2026-06-01-1000';
    const plan = selectPrunable({
      branches: [ios, android],
      tags: [`${ios}-success`, `${android}-failed`],
      now,
    });
    expect(plan.kept).toEqual([ios]);
    expect(plan.failed).toEqual([android]);
  });

  it('never returns a name it does not recognise', () => {
    const plan = selectPrunable({
      branches: ['main', 'feature/x', 'release/web/2026-06-01-1000'],
      tags: [],
      now,
    });
    expect(plan.failed).toEqual([]);
    expect(plan.unfinished).toEqual([]);
    expect(plan.kept).toEqual([]);
  });

  it('honours a custom keep window', () => {
    const plan = selectPrunable({
      branches: [fresh],
      tags: [`${fresh}-failed`],
      now,
      keepDays: 1,
    });
    expect(plan.failed).toEqual([fresh]);
  });

  it('defaults to a 30-day window', () => {
    expect(DEFAULT_KEEP_DAYS).toBe(30);
  });
});
