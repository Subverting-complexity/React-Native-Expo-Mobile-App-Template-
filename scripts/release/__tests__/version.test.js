/**
 * The rules for moving the release version forward.
 *
 * Two of these matter more than the rest. The commit-message writer and
 * reader are pinned against each other, because they are the whole mechanism
 * that stops two deploys in one release cycle from shipping two versions --
 * if they ever drift apart, the gate silently stops working and nothing else
 * would notice. And the file edit is pinned byte for byte, because a bump
 * that reformats `app.config.ts` would turn the Prettier check red and make
 * the automation worse than doing it by hand.
 */
const {
  DEFAULT_LEVEL,
  VERSION_FILES,
  VersionError,
  bumpBranchName,
  bumpCommitMessage,
  bumpCommitVersion,
  bumpVersion,
  formatVersion,
  parseVersion,
  readVersionField,
  replaceVersionField,
} = require('../lib/version');

const appConfig = VERSION_FILES[0];

describe('parseVersion', () => {
  it('takes a plain x.y.z apart', () => {
    expect(parseVersion('1.4.7')).toEqual({ major: 1, minor: 4, patch: 7 });
    expect(formatVersion(parseVersion('0.0.0'))).toBe('0.0.0');
  });

  it('refuses a pre-release or build suffix rather than dropping it', () => {
    // Dropping the suffix would change which release the number names.
    expect(() => parseVersion('1.2.0-rc.1')).toThrow(VersionError);
    expect(() => parseVersion('1.2.0+2026')).toThrow(VersionError);
  });

  it('refuses anything that is not three numbers', () => {
    expect(() => parseVersion('1.2')).toThrow(VersionError);
    expect(() => parseVersion('v1.2.0')).toThrow(VersionError);
    expect(() => parseVersion('01.2.0')).toThrow(VersionError);
    expect(() => parseVersion('')).toThrow(VersionError);
  });
});

describe('bumpVersion', () => {
  it('resets the lower parts, so a minor bump does not carry the old patch', () => {
    expect(bumpVersion('1.4.7', 'patch')).toBe('1.4.8');
    expect(bumpVersion('1.4.7', 'minor')).toBe('1.5.0');
    expect(bumpVersion('1.4.7', 'major')).toBe('2.0.0');
  });

  it('defaults to a minor bump', () => {
    expect(DEFAULT_LEVEL).toBe('minor');
    expect(bumpVersion('1.4.7')).toBe(bumpVersion('1.4.7', 'minor'));
  });

  it('refuses a level it does not know', () => {
    expect(() => bumpVersion('1.4.7', 'huge')).toThrow(VersionError);
  });
});

describe('the bump commit subject', () => {
  it('round-trips through the writer and the reader', () => {
    const subject = bumpCommitMessage('1.5.0');
    expect(subject).toBe('chore(release): bump version to 1.5.0');
    expect(bumpCommitVersion(subject)).toBe('1.5.0');
  });

  it('does not match an unrelated commit', () => {
    expect(bumpCommitVersion('feat: add a thing')).toBeNull();
    expect(bumpCommitVersion('')).toBeNull();
    expect(bumpCommitVersion(undefined)).toBeNull();
  });

  it('does not match a commit that merely mentions the message', () => {
    // Anchored, not a substring search: a revert or a note about this tool
    // is not the bump itself, and treating it as one would skip a release's
    // bump entirely.
    expect(
      bumpCommitVersion('Revert "chore(release): bump version to 1.5.0"'),
    ).toBeNull();
    expect(
      bumpCommitVersion('docs: explain chore(release): bump version to 1.5.0'),
    ).toBeNull();
    expect(
      bumpCommitVersion('chore(release): bump version to 1.5.0 (again)'),
    ).toBeNull();
  });

  it('refuses to write a subject for a version it would not read back', () => {
    expect(() => bumpCommitMessage('1.5.0-rc.1')).toThrow(VersionError);
  });
});

describe('bumpBranchName', () => {
  it('names the throwaway branch after the version it carries', () => {
    expect(bumpBranchName('1.5.0')).toBe('version-bump/1.5.0');
  });
});

describe('the version field edit', () => {
  const config = [
    'export default ({ config }) => ({',
    '  ...config,',
    "  name: 'ExpoTemplate',",
    "  version: '1.0.0',",
    "  ios: { buildNumber: '1' },",
    '  android: { versionCode: 1 },',
    '});',
    '',
  ].join('\n');

  it('reads the version out', () => {
    expect(readVersionField(config, appConfig)).toBe('1.0.0');
  });

  it('changes the version and nothing else, byte for byte', () => {
    const next = replaceVersionField(config, '1.1.0', appConfig);
    expect(next).toBe(config.replace("version: '1.0.0'", "version: '1.1.0'"));
    // The indentation, the quoting style and the trailing newline all survive,
    // which is what keeps the Prettier check green after a bump.
    expect(next).toContain("  version: '1.1.0',");
    expect(next.endsWith('\n')).toBe(true);
  });

  it('leaves the remotely-managed build numbers alone', () => {
    const next = replaceVersionField(config, '1.1.0', appConfig);
    expect(next).toContain("buildNumber: '1'");
    expect(next).toContain('versionCode: 1');
  });

  it('refuses a file with no version field', () => {
    expect(() =>
      replaceVersionField('const x = 1;\n', '1.1.0', appConfig),
    ).toThrow(VersionError);
  });

  it('refuses a file whose shape has changed to hold two', () => {
    // A second occurrence is a change this tool should surface, not guess at.
    const twice = `${config}\nconst other = { version: '9.9.9' };\n`;
    expect(() => readVersionField(twice, appConfig)).toThrow(VersionError);
    expect(() => replaceVersionField(twice, '1.1.0', appConfig)).toThrow(
      VersionError,
    );
  });

  it('refuses to write a version it would not read back', () => {
    expect(() => replaceVersionField(config, 'next', appConfig)).toThrow(
      VersionError,
    );
  });
});
