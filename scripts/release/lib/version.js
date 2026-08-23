/**
 * The rules for moving the release version forward, as pure functions.
 *
 * No git, no clock, no filesystem, so every rule that decides what the next
 * version is and how it gets written can be unit-tested directly (see
 * `__tests__/version.test.js`). The CLI in `scripts/release/version-bump.js`
 * keeps the side effects.
 *
 * ## Which version this is about
 *
 * The marketing version -- `version` in `app.config.ts`, the number a user
 * sees on the store listing. It is the only version number this repo
 * maintains by hand. The iOS build number and the Android version code are
 * assigned remotely by EAS (`appVersionSource: "remote"` plus
 * `build.production.autoIncrement` in `eas.json`), so nothing here touches
 * them: a local counter that a remote system ignores is dead weight, and one
 * it does not ignore is a fight waiting to happen.
 *
 * ## Why the commit message is a shared pattern
 *
 * A release cycle should bump once, not once per store. Two deploys run back
 * to back from the same checkout would otherwise ship iOS and Android on
 * different versions. The fix is that the tool recognises its own last
 * commit: {@link bumpCommitMessage} writes the subject, {@link
 * bumpCommitVersion} reads it back, and both are built from
 * {@link BUMP_SUBJECT} so a change to the format cannot leave the reader
 * behind. The check is against a fact already in shared git history, so it
 * holds across machines and in either order, with no state file and no flag.
 */

/**
 * A plain three-part version. Deliberately strict: a pre-release or build
 * suffix (`1.2.0-rc.1`, `1.2.0+2026`) is refused rather than quietly
 * dropped, because dropping it would change which release the number names.
 */
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** The bump levels, largest first for readability in error messages. */
const LEVELS = ['major', 'minor', 'patch'];

/**
 * What a bump does when nobody says. A minor bump is the usual shape of a
 * release from this template: a batch of user-facing changes that is not a
 * bugfix-only patch and not a deliberate breaking rewrite.
 */
const DEFAULT_LEVEL = 'minor';

/** The one commit subject this tool writes and the only one it recognises. */
const BUMP_SUBJECT = /^chore\(release\): bump version to (\d+\.\d+\.\d+)$/;

/** The prefix of the throwaway branch a bump is assembled on. */
const BUMP_BRANCH_PREFIX = 'version-bump';

/** Thrown for a version, level or file this module cannot make sense of. */
class VersionError extends Error {}

/**
 * The files that carry the release version, and how to find it in each.
 *
 * A list rather than a single path so that a project which needs two files
 * to move together gets them in one commit and they cannot drift. This
 * template has one: `app.config.ts`. A project that also wants its
 * `package.json` in lockstep adds
 *
 *     { path: 'package.json', label: 'the "version" field in package.json',
 *       pattern: /("version"\s*:\s*")([^"]*)(")/g }
 *
 * here, and both files then move in the same commit.
 *
 * Each `pattern` captures the opening quote and everything before it, the
 * value, and the closing quote, so {@link replaceVersionField} can swap the
 * value and leave every other byte of the file untouched -- see its comment
 * for why this is a text replace and not a parse.
 */
const VERSION_FILES = [
  {
    path: 'app.config.ts',
    label: 'the version field in app.config.ts',
    pattern: /(\bversion:\s*')([^']*)(')/g,
  },
];

/** Takes a version apart, refusing anything that is not exactly `x.y.z`. */
function parseVersion(text) {
  const match = SEMVER.exec(String(text).trim());
  if (!match) {
    throw new VersionError(
      `'${text}' is not a plain x.y.z version. Pre-release and build suffixes are not supported.`,
    );
  }
  const [major, minor, patch] = match.slice(1).map(Number);
  return { major, minor, patch };
}

/** The version, once it has been confirmed to be a plain `x.y.z`. */
function assertVersion(text) {
  parseVersion(text);
  return String(text).trim();
}

/** Puts one back together. */
function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

/**
 * The next version after `current` at the given level.
 *
 * The resets are the point: a minor bump zeroes the patch and a major bump
 * zeroes both, so `1.4.7` goes to `1.5.0` and then to `2.0.0` rather than
 * carrying the old trailing numbers along.
 */
function bumpVersion(current, level = DEFAULT_LEVEL) {
  if (!LEVELS.includes(level)) {
    throw new VersionError(
      `Unknown bump level '${level}'. Expected ${LEVELS.join(', ')}.`,
    );
  }
  const { major, minor, patch } = parseVersion(current);
  if (level === 'major')
    return formatVersion({ major: major + 1, minor: 0, patch: 0 });
  if (level === 'minor')
    return formatVersion({ major, minor: minor + 1, patch: 0 });
  return formatVersion({ major, minor, patch: patch + 1 });
}

/** The subject line a bump commit gets. Paired with {@link bumpCommitVersion}. */
function bumpCommitMessage(next) {
  return `chore(release): bump version to ${assertVersion(next)}`;
}

/**
 * The version a bump commit names, or `null` for any other commit.
 *
 * Anchored, so a commit that merely quotes the message in its body -- a
 * revert, a merge summary, a note about this tool -- is not mistaken for the
 * bump itself. That distinction is what stops a release cycle from silently
 * skipping its bump.
 */
function bumpCommitVersion(subject) {
  const match = BUMP_SUBJECT.exec(String(subject ?? '').trim());
  return match ? match[1] : null;
}

/** The throwaway branch a bump is assembled on before it is merged back. */
function bumpBranchName(next) {
  return `${BUMP_BRANCH_PREFIX}/${assertVersion(next)}`;
}

/**
 * The version currently written in a file, per that file's descriptor.
 *
 * Refuses zero matches and refuses more than one. A second occurrence
 * appearing later is a change in the file's shape, and the right response to
 * a shape change is to stop and say so rather than to pick one and hope.
 */
function readVersionField(text, file) {
  const found = matchesOf(text, file);
  return found[0][2];
}

/**
 * Swaps the version in a file's text, changing nothing else.
 *
 * A text replace rather than parse-and-reserialize because this repo's CI
 * runs Prettier in check mode over `app.config.ts`. No serializer promises
 * to reproduce a formatter's exact output, and a version bump that turns CI
 * red on a formatting check would defeat the whole point of automating it.
 * Swapping the characters between the quotes cannot change the formatting,
 * because it does not touch anything else in the file.
 */
function replaceVersionField(text, next, file) {
  matchesOf(text, file); // Refuses zero or several before anything is written.
  const version = assertVersion(next);
  return text.replace(
    new RegExp(file.pattern.source, 'g'),
    (_whole, open, _old, close) => `${open}${version}${close}`,
  );
}

/** The matches for a file's version pattern, refusing anything but exactly one. */
function matchesOf(text, file) {
  const found = [
    ...String(text).matchAll(new RegExp(file.pattern.source, 'g')),
  ];
  if (found.length !== 1) {
    throw new VersionError(
      `Expected exactly one match for ${file.label}, found ${found.length}. ` +
        'The file has changed shape; fix it or update VERSION_FILES.',
    );
  }
  return found;
}

module.exports = {
  BUMP_BRANCH_PREFIX,
  assertVersion,
  DEFAULT_LEVEL,
  LEVELS,
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
};
