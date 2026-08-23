/**
 * The version-bump tool, run as a real process against a real repository.
 *
 * This file is where the double-bump problem is actually shown to be fixed.
 * That property -- iOS and Android deploying back to back ship one version,
 * not two -- only exists across two runs against real git history, so no
 * unit test can demonstrate it. The three cases that carry the argument are:
 * running twice bumps once, running twice at different levels still bumps
 * once, and a real commit landing afterwards makes it bump again.
 */
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const {
  branches,
  createTempRepo,
  run,
  runBump,
  subjects,
  tryRun,
  versionIn,
} = require('../test-support/tempRepo');

jest.setTimeout(60_000);

let repo;

beforeEach(() => {
  repo = createTempRepo();
});

afterEach(() => {
  repo.cleanup();
});

const bumpSubjects = (cwd) =>
  subjects(cwd).filter((line) =>
    line.startsWith('chore(release): bump version to'),
  );

describe('a single bump', () => {
  it('edits the file, commits once, fast-forwards and pushes', () => {
    const result = runBump(repo.work);

    expect(result.code).toBe(0);
    expect(versionIn(repo.work)).toBe('1.1.0');
    expect(bumpSubjects(repo.work)).toEqual([
      'chore(release): bump version to 1.1.0',
    ]);
    // Fast-forwarded, so the bump is the tip and no merge commit was invented.
    expect(tryRun(repo.work, ['log', '-1', '--format=%s'])).toBe(
      'chore(release): bump version to 1.1.0',
    );
    expect(tryRun(repo.work, ['rev-parse', 'HEAD'])).toBe(
      tryRun(repo.origin, ['rev-parse', 'refs/heads/main']),
    );
  });

  it('leaves no throwaway branch behind', () => {
    runBump(repo.work);

    expect(branches(repo.work)).toEqual(['main']);
    expect(
      branches(repo.work).filter((name) => name.startsWith('version-bump/')),
    ).toEqual([]);
  });

  it('takes the level it is given', () => {
    expect(runBump(repo.work, ['--level', 'major']).code).toBe(0);
    expect(versionIn(repo.work)).toBe('2.0.0');
  });

  it('leaves the remotely-managed build numbers alone', () => {
    runBump(repo.work);

    const config = readFileSync(join(repo.work, 'app.config.ts'), 'utf8');
    expect(config).toContain("buildNumber: '1'");
    expect(config).toContain('versionCode: 1');
  });
});

describe('running it twice bumps once', () => {
  it('skips the second run and changes nothing', () => {
    expect(runBump(repo.work).code).toBe(0);
    const afterFirst = versionIn(repo.work);

    const second = runBump(repo.work);

    expect(second.code).toBe(0);
    expect(second.output).toContain('Nothing to bump');
    expect(versionIn(repo.work)).toBe(afterFirst);
    expect(bumpSubjects(repo.work)).toHaveLength(1);
  });

  it('skips even when the second run asks for a different level', () => {
    // The gate is "HEAD is already my own commit", not "the same level was
    // asked for twice". A gate written the other way would let an Android
    // deploy asking for --level patch bump on top of the iOS deploy's minor.
    expect(runBump(repo.work, ['--level', 'minor']).code).toBe(0);

    const second = runBump(repo.work, ['--level', 'patch']);

    expect(second.code).toBe(0);
    expect(second.output).toContain('Nothing to bump');
    expect(versionIn(repo.work)).toBe('1.1.0');
    expect(bumpSubjects(repo.work)).toHaveLength(1);
  });

  it('bumps again once a real commit lands on top', () => {
    // The gate resets itself. Without this the first release would be the
    // last one that ever bumped.
    runBump(repo.work);
    writeFileSync(join(repo.work, 'README.md'), 'a real change\n', 'utf8');
    run(repo.work, ['add', 'README.md']);
    run(repo.work, ['commit', '--message', 'docs: a real change']);
    run(repo.work, ['push', 'origin', 'main']);

    const second = runBump(repo.work);

    expect(second.code).toBe(0);
    expect(versionIn(repo.work)).toBe('1.2.0');
    expect(bumpSubjects(repo.work)).toEqual([
      'chore(release): bump version to 1.2.0',
      'chore(release): bump version to 1.1.0',
    ]);
  });
});

describe('what it refuses', () => {
  it('refuses a dirty working tree, and touches nothing', () => {
    writeFileSync(join(repo.work, 'app.config.ts'), '// edited\n', 'utf8');

    const result = runBump(repo.work);

    expect(result.code).toBe(1);
    expect(result.output).toContain('working tree is dirty');
    expect(readFileSync(join(repo.work, 'app.config.ts'), 'utf8')).toBe(
      '// edited\n',
    );
    expect(bumpSubjects(repo.work)).toEqual([]);
  });

  it('refuses to run anywhere but the base branch', () => {
    run(repo.work, ['switch', '--create', 'feature/thing']);

    const result = runBump(repo.work);

    expect(result.code).toBe(1);
    expect(result.output).toContain('only ever commits to main');
    expect(versionIn(repo.work)).toBe('1.0.0');
    expect(bumpSubjects(repo.work)).toEqual([]);
  });

  it('refuses when the base branch has drifted from its remote', () => {
    writeFileSync(join(repo.work, 'README.md'), 'unpushed\n', 'utf8');
    run(repo.work, ['add', 'README.md']);
    run(repo.work, ['commit', '--message', 'docs: not pushed yet']);

    const result = runBump(repo.work);

    expect(result.code).toBe(1);
    expect(result.output).toContain('out of sync');
    expect(versionIn(repo.work)).toBe('1.0.0');
    expect(bumpSubjects(repo.work)).toEqual([]);
  });

  it('refuses a leftover throwaway branch rather than clobbering it', () => {
    // Almost always a previous run that died partway. What it holds is the
    // operator's call, not this tool's.
    run(repo.work, ['branch', 'version-bump/1.1.0']);

    const result = runBump(repo.work);

    expect(result.code).toBe(1);
    expect(result.output).toContain('version-bump/1.1.0 already exists');
    expect(result.output).toContain('git branch -D version-bump/1.1.0');
    expect(versionIn(repo.work)).toBe('1.0.0');
    expect(bumpSubjects(repo.work)).toEqual([]);
  });

  it('refuses a version file whose shape it does not recognise', () => {
    writeFileSync(
      join(repo.work, 'app.config.ts'),
      'export default {};\n',
      'utf8',
    );
    run(repo.work, ['add', 'app.config.ts']);
    run(repo.work, ['commit', '--message', 'chore: drop the version field']);
    run(repo.work, ['push', 'origin', 'main']);

    const result = runBump(repo.work);

    expect(result.code).toBe(1);
    expect(result.output).toContain('found 0');
    expect(bumpSubjects(repo.work)).toEqual([]);
  });
});
