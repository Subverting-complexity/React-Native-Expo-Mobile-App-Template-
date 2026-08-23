#!/usr/bin/env node
/**
 * Moves the release version on by one, once per release cycle.
 *
 * The deploy scripts (`scripts/DeployiOSTestFlight.ps1`,
 * `scripts/DeployAndroidPlayStore.ps1`) call this before they cut the release
 * branch, so the branch carries the version that is about to be built. The
 * rules -- what the next version is, what the commit says, how the file is
 * edited -- live in `scripts/release/lib/version.js` and are unit-tested
 * there. This file is the side effects: git, the filesystem, the console.
 *
 * ## Running it twice bumps once
 *
 * iOS and Android are two deploys, and running both back to back must not
 * ship them on different versions. Before anything else, this checks whether
 * `HEAD` is already a commit it wrote, and stops if so -- successfully, so
 * the deploy carries on at that version. There is no flag for this and no
 * state file: it reads a fact that is already in shared git history, so it
 * holds whichever order the two deploys run in, on one machine or two, and
 * it resets on its own the moment a real commit lands on top.
 *
 * ## What it will not do
 *
 * It commits to the base branch automatically, so unlike the release-branch
 * tool it has no overrides at all. It refuses to run anywhere but the base
 * branch, refuses a dirty tree (it creates a commit rather than pointing at
 * one, and an override would sweep unrelated local edits into an automatic
 * commit on a shared branch), refuses a base branch that has drifted from
 * its remote, and refuses to touch a leftover `version-bump/*` branch from a
 * run that died partway. See `docs/releasing.md` for the operator's view.
 */

const { spawnSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const { UsageError, parseArgs, usage } = require('./lib/versionOptions');
const {
  VERSION_FILES,
  VersionError,
  bumpBranchName,
  bumpCommitMessage,
  bumpCommitVersion,
  bumpVersion,
  readVersionField,
  replaceVersionField,
} = require('./lib/version');

/** Thrown when git itself refuses. Carries the output so the operator sees it. */
class GitError extends Error {}

const say = (line = '') => console.log(line);
const ok = (line) => console.log(`  ok  ${line}`);
const warn = (line) => console.log(`WARN  ${line}`);
const fail = (line) => console.log(`FAIL  ${line}`);
const detail = (line) => console.log(`      ${line}`);

/** Runs git and returns `{ code, output }`. Quiet, for the same reason the
 * release-branch tool is: a bump asks git a dozen small questions and
 * echoing all of them would bury the one line that matters. */
function git(repoRoot, args, options = {}) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const code = result.status ?? 1;
  if (code !== 0 && !options.allowFailure) {
    throw new GitError(
      `git ${args.join(' ')} failed (exit ${code})\n${output.trim()}`,
    );
  }
  return { code, output };
}

function gitLine(repoRoot, args) {
  return git(repoRoot, args).output.trim();
}

function findRepoRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new GitError(
      'Not inside a git repository, so there is no version history to commit to.',
    );
  }
  return result.stdout.trim();
}

/** Whether a ref exists at all, local or remote-tracking. */
function refExists(repoRoot, ref) {
  const result = git(repoRoot, ['rev-parse', '--verify', '--quiet', ref], {
    allowFailure: true,
  });
  return result.code === 0 && result.output.trim().length > 0;
}

/**
 * The version each file currently holds, refusing if they disagree.
 *
 * With one file this can never fire; with two it is the check that catches
 * the drift the single-commit rule exists to prevent, before a bump quietly
 * papers over it by writing the same new number into both.
 */
function readCurrentVersion(repoRoot) {
  const found = VERSION_FILES.map((file) => ({
    file,
    version: readVersionField(
      readFileSync(join(repoRoot, file.path), 'utf8'),
      file,
    ),
  }));

  const distinct = new Set(found.map((entry) => entry.version));
  if (distinct.size > 1) {
    const listed = found
      .map((entry) => `${entry.file.path}: ${entry.version}`)
      .join(', ');
    throw new VersionError(
      `The version files disagree (${listed}). Put them on the same version first.`,
    );
  }
  return found[0].version;
}

/** Writes the next version into every version file, changing nothing else. */
function writeNextVersion(repoRoot, next) {
  for (const file of VERSION_FILES) {
    const path = join(repoRoot, file.path);
    const text = readFileSync(path, 'utf8');
    writeFileSync(path, replaceVersionField(text, next, file), 'utf8');
    ok(`${file.path} now reads ${next}`);
  }
}

/**
 * The checks that stop a bump, in the order they are cheapest to explain.
 *
 * @returns `null` when the bump may proceed, or the exit code to stop with.
 */
function checkPreconditions(repoRoot, options) {
  const branch = gitLine(repoRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch !== options.base) {
    fail(
      `A version bump only ever commits to ${options.base}, and this is ${branch}.`,
    );
    detail(`git switch ${options.base}`);
    return 1;
  }

  const modified = gitLine(repoRoot, [
    'status',
    '--porcelain',
    '--untracked-files=no',
  ]);
  if (modified.length > 0) {
    fail(
      `The working tree is dirty, and a bump commits to ${options.base}. Commit or stash first:`,
    );
    say();
    modified.split(/\r?\n/).forEach((line) => detail(line));
    return 1;
  }

  return checkRemoteInSync(repoRoot, options);
}

/**
 * Refuses when the base branch has drifted from its remote, in either
 * direction: behind means the bump would be built on stale state, ahead or
 * diverged means something local has not been shared and the push would be
 * carrying more than a version bump.
 *
 * The fetch itself is best effort. Offline, or without credentials, this
 * warns and lets the bump through rather than making a safety check into a
 * hard network dependency.
 */
function checkRemoteInSync(repoRoot, options) {
  const remoteRef = `refs/remotes/${options.remote}/${options.base}`;
  const fetched = git(
    repoRoot,
    ['fetch', options.remote, options.base, '--quiet'],
    { allowFailure: true },
  );
  if (fetched.code !== 0) {
    warn(
      `Could not reach ${options.remote}, so the base branch could not be checked against it.`,
    );
    return null;
  }
  if (!refExists(repoRoot, remoteRef)) {
    warn(`${options.remote}/${options.base} does not exist yet. Continuing.`);
    return null;
  }

  const local = gitLine(repoRoot, ['rev-parse', 'HEAD']);
  const tracked = gitLine(repoRoot, ['rev-parse', remoteRef]);
  if (local !== tracked) {
    fail(
      `${options.base} is out of sync with ${options.remote}/${options.base}, so a bump would be built on the wrong state.`,
    );
    detail(`local  ${local.slice(0, 8)}`);
    detail(`remote ${tracked.slice(0, 8)}`);
    detail(`git pull --ff-only ${options.remote} ${options.base}`);
    return 1;
  }
  return null;
}

/**
 * Assembles the bump on a throwaway branch, then fast-forwards it into the
 * base branch.
 *
 * The fast-forward is deliberate. It can only succeed because nothing else
 * could have landed on the base branch in the seconds between cutting the
 * branch and merging it back, in this same run. If that ever stops being
 * true the merge refuses, which is the correct answer -- a merge commit
 * invented here would be hiding a race, not resolving one.
 */
function commitBump(repoRoot, options, current, next) {
  const branch = bumpBranchName(next);
  if (
    refExists(repoRoot, `refs/heads/${branch}`) ||
    refExists(repoRoot, `refs/remotes/${options.remote}/${branch}`)
  ) {
    fail(
      `${branch} already exists, which usually means an earlier bump died partway.`,
    );
    detail('Check what it holds, then remove it and run this again:');
    detail(`git branch -D ${branch}`);
    return 1;
  }

  const paths = VERSION_FILES.map((file) => file.path);
  git(repoRoot, ['switch', '--create', branch]);
  try {
    writeNextVersion(repoRoot, next);
    git(repoRoot, ['add', ...paths]);
    git(repoRoot, ['commit', '--message', bumpCommitMessage(next)]);
  } catch (error) {
    // Put back only the files this tool just wrote and drop the throwaway
    // branch, so a failure here leaves nothing for the next run to trip over.
    // Every step is best effort: the error being carried out is the one worth
    // reporting, not whatever the tidy-up runs into.
    git(repoRoot, ['checkout', '--', ...paths], { allowFailure: true });
    git(repoRoot, ['switch', options.base], { allowFailure: true });
    git(repoRoot, ['branch', '--delete', '--force', branch], {
      allowFailure: true,
    });
    throw error;
  }
  git(repoRoot, ['switch', options.base]);

  git(repoRoot, ['merge', '--ff-only', branch]);
  git(repoRoot, ['branch', '--delete', branch]);
  ok(`${current} -> ${next} on ${options.base}`);
  return 0;
}

/**
 * Pushes the bump. A refusal is a warning rather than a failure: the commit
 * is already made, the release branch cut next will carry it to the remote
 * anyway, and stopping the deploy over a push that can be retried by hand
 * would cost more than it saves.
 */
function pushBase(repoRoot, options) {
  const pushed = git(
    repoRoot,
    ['push', options.remote, `${options.base}:${options.base}`],
    { allowFailure: true },
  );
  if (pushed.code === 0) {
    ok(`Pushed ${options.base} to ${options.remote}`);
    return;
  }
  warn(
    `Could not push ${options.base} to ${options.remote}. The commit is here and unchanged.`,
  );
  detail(`git push ${options.remote} ${options.base}:${options.base}`);
  const reason = pushed.output.trim().split(/\r?\n/).slice(-3).join('\n');
  if (reason) detail(reason);
}

function bump(options) {
  const repoRoot = findRepoRoot();

  // First, before the tree is even looked at: if HEAD is already this tool's
  // own commit then this release cycle has had its bump, and a second deploy
  // asking for one is the case this check exists for.
  const alreadyBumped = bumpCommitVersion(
    gitLine(repoRoot, ['log', '-1', '--format=%s']),
  );
  if (alreadyBumped) {
    ok(`Already at ${alreadyBumped}. Nothing to bump.`);
    return 0;
  }

  const stopped = checkPreconditions(repoRoot, options);
  if (stopped !== null) return stopped;

  const current = readCurrentVersion(repoRoot);
  const next = bumpVersion(current, options.level);

  const committed = commitBump(repoRoot, options, current, next);
  if (committed !== 0) return committed;

  pushBase(repoRoot, options);
  return 0;
}

function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    fail(error.message);
    say();
    say(usage());
    return 2;
  }

  if (options.command === 'help') {
    say(usage());
    return 0;
  }

  try {
    return bump(options);
  } catch (error) {
    if (error instanceof GitError || error instanceof VersionError) {
      fail(error.message);
      return 1;
    }
    throw error;
  }
}

process.exitCode = main(process.argv.slice(2));
