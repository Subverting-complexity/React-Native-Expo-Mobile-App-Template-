/**
 * The release-branch tool, run as a real process against a real repository.
 *
 * The retention rules are pinned against the pure module elsewhere. What is
 * checked here is what only real git can show: that the branch reaches the
 * remote before the build starts, that the outcome tag lands on the same
 * commit with the fields the operator will grep for, and -- the one that
 * matters -- that an unfinished run is tagged before its branch is deleted,
 * so pruning can never be the thing that loses a commit.
 */
const { execFileSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

const {
  branches,
  createTempRepo,
  runRelease,
  tags,
  tryRun,
} = require('../test-support/tempRepo');

jest.setTimeout(60_000);

let repo;

beforeEach(() => {
  repo = createTempRepo();
});

afterEach(() => {
  repo.cleanup();
});

const releaseBranches = (repo_) =>
  branches(repo_).filter((name) => name.startsWith('release/'));

/** The single release branch that exists, which every test here expects. */
const soleBranch = (repo_) => {
  const found = releaseBranches(repo_);
  expect(found).toHaveLength(1);
  return found[0];
};

describe('start', () => {
  it('cuts the branch at HEAD and pushes it before the build', () => {
    const result = runRelease(repo.work, [
      'start',
      '--platform',
      'ios',
      '--profile',
      'production',
    ]);

    expect(result.code).toBe(0);
    const branch = soleBranch(repo.work);
    expect(branch).toMatch(/^release\/ios\/\d{4}-\d{2}-\d{2}-\d{4}$/);
    // At HEAD, and on the remote already -- a run that never comes back has
    // still left its record.
    expect(tryRun(repo.work, ['rev-parse', branch])).toBe(
      tryRun(repo.work, ['rev-parse', 'main']),
    );
    expect(tryRun(repo.origin, ['rev-parse', `refs/heads/${branch}`])).toBe(
      tryRun(repo.work, ['rev-parse', 'main']),
    );
  });

  it('refuses a dirty working tree', () => {
    writeFileSync(join(repo.work, 'app.config.ts'), '// edited\n', 'utf8');

    const result = runRelease(repo.work, ['start', '--platform', 'ios']);

    expect(result.code).toBe(1);
    expect(result.output).toContain('Tracked files have been modified');
    expect(releaseBranches(repo.work)).toEqual([]);
  });
});

describe('finish', () => {
  it('tags a success at the same commit, with the fields to grep for', () => {
    runRelease(repo.work, [
      'start',
      '--platform',
      'ios',
      '--profile',
      'production',
    ]);
    const branch = soleBranch(repo.work);

    const result = runRelease(repo.work, [
      'finish',
      '--platform',
      'ios',
      '--outcome',
      'success',
      '--duration',
      '00:14:02',
      '--exit-code',
      '0',
      '--submitted',
      'yes',
    ]);

    expect(result.code).toBe(0);
    const tag = `${branch}-success`;
    expect(tags(repo.work)).toContain(tag);
    expect(tryRun(repo.work, ['rev-parse', `${tag}^{commit}`])).toBe(
      tryRun(repo.work, ['rev-parse', branch]),
    );
    expect(tryRun(repo.origin, ['rev-parse', `refs/tags/${tag}`])).not.toBe('');

    const message = tryRun(repo.work, [
      'tag',
      '-l',
      tag,
      '--format=%(contents)',
    ]);
    expect(message).toContain('Platform: ios');
    expect(message).toContain('Profile: production');
    expect(message).toContain('Duration: 00:14:02');
    expect(message).toContain('Exit code: 0');
    expect(message).toContain('Submitted: yes');
  });

  it('tags a failure, and prune keeps the tag while removing the branch', () => {
    runRelease(repo.work, [
      'start',
      '--platform',
      'android',
      '--profile',
      'production',
    ]);
    const branch = soleBranch(repo.work);
    runRelease(repo.work, [
      'finish',
      '--platform',
      'android',
      '--outcome',
      'failed',
      '--exit-code',
      '1',
    ]);
    expect(tags(repo.work)).toContain(`${branch}-failed`);

    const result = runRelease(repo.work, ['prune', '--keep-days', '0']);

    expect(result.code).toBe(0);
    expect(releaseBranches(repo.work)).toEqual([]);
    expect(tryRun(repo.origin, ['rev-parse', `refs/heads/${branch}`])).toBe('');
    // The tag outlives the branch and still pins the commit.
    expect(tags(repo.work)).toContain(`${branch}-failed`);
    expect(
      tryRun(repo.origin, ['rev-parse', `refs/tags/${branch}-failed`]),
    ).not.toBe('');
  });
});

describe('prune', () => {
  it('tags an unfinished run before deleting its branch', () => {
    // No finish at all: the machine slept, the window was closed. Both
    // artifacts have to exist afterwards, not just an absent branch -- the
    // tag is what stops the deletion from losing the commit.
    runRelease(repo.work, [
      'start',
      '--platform',
      'ios',
      '--profile',
      'production',
    ]);
    const branch = soleBranch(repo.work);
    const commit = tryRun(repo.work, ['rev-parse', branch]);

    const result = runRelease(repo.work, ['prune', '--keep-days', '0']);

    expect(result.code).toBe(0);
    expect(releaseBranches(repo.work)).toEqual([]);
    const tag = `${branch}-unfinished`;
    expect(tags(repo.work)).toContain(tag);
    expect(tryRun(repo.work, ['rev-parse', `${tag}^{commit}`])).toBe(commit);
    expect(tryRun(repo.origin, ['rev-parse', `refs/tags/${tag}`])).not.toBe('');
  });

  it('never prunes a successful branch, whatever the keep window', () => {
    runRelease(repo.work, [
      'start',
      '--platform',
      'ios',
      '--profile',
      'production',
    ]);
    const branch = soleBranch(repo.work);
    runRelease(repo.work, [
      'finish',
      '--platform',
      'ios',
      '--outcome',
      'success',
    ]);

    runRelease(repo.work, ['prune', '--keep-days', '0']);

    // What you would cut a hotfix from. It stays.
    expect(releaseBranches(repo.work)).toEqual([branch]);
    expect(tryRun(repo.origin, ['rev-parse', `refs/heads/${branch}`])).not.toBe(
      '',
    );
  });

  it('leaves branches it does not recognise alone', () => {
    runRelease(repo.work, ['start', '--platform', 'ios']);
    execFileSync('git', ['branch', 'feature/thing'], { cwd: repo.work });

    runRelease(repo.work, ['prune', '--keep-days', '0']);

    expect(branches(repo.work)).toContain('feature/thing');
  });

  it('reports a dry run without changing anything', () => {
    runRelease(repo.work, ['start', '--platform', 'ios']);
    const branch = soleBranch(repo.work);

    const result = runRelease(repo.work, [
      'prune',
      '--keep-days',
      '0',
      '--dry-run',
    ]);

    expect(result.code).toBe(0);
    expect(result.output).toContain(`would delete ${branch}`);
    expect(releaseBranches(repo.work)).toEqual([branch]);
    expect(tags(repo.work)).toEqual([]);
  });
});
