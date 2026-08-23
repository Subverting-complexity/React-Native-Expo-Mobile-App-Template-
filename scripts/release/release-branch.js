#!/usr/bin/env node
/**
 * Records every store release attempt as a branch and an outcome tag.
 *
 * The deploy scripts (`scripts/DeployiOSTestFlight.ps1`,
 * `scripts/DeployAndroidPlayStore.ps1`) call this at three points: `start`
 * before the build, `finish` after it, and `prune` (which `finish` runs for
 * you) to clear out branches nobody needs any more. It is a Node tool rather
 * than PowerShell so the naming and retention rules can be unit-tested, and
 * so the same commands work if a release is ever driven from somewhere other
 * than a Windows console.
 *
 * `scripts/release/lib/releaseBranch.js` explains the naming scheme and why
 * the outcome lives on a tag instead of in the branch name. This file is the
 * side effects: git, the filesystem, and the console. See
 * `docs/release-branches.md` for the operator's view.
 *
 * ## What it will not do
 *
 * It refuses to cut a release branch when tracked files have been modified.
 * A branch is a pointer to a commit, so a branch cut from a dirty tree
 * claims a commit was built that never was, and the record is then worse
 * than no record because it looks trustworthy. `--allow-dirty` exists for
 * the rare deliberate case and says so in the tag message.
 *
 * A failed push is a warning, never a failure. The deploy is the point of
 * the exercise and the bookkeeping is not allowed to stop it; the branch
 * stays local, `finish` retries the push, and the console says what to run
 * by hand.
 */

const { spawnSync } = require('node:child_process');
const {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const { retireBranch } = require('./lib/branchRetirement');
const { UsageError, parseArgs, usage } = require('./lib/options');
const {
  DEFAULT_KEEP_DAYS,
  REF_PREFIX,
  ReleaseNameError,
  assertPlatform,
  availableBranchName,
  buildTagMessage,
  selectPrunable,
  tagNameFor,
} = require('./lib/releaseBranch');

/** Where `start` leaves the branch it cut for `finish` to find. Gitignored —
 * a tracked file that a release writes would make the next release's
 * clean-tree check fail on the previous release's bookkeeping. */
const STATE_FILE = join('scripts', 'release', 'release-state.json');

const DEFAULT_REMOTE = 'origin';

/** Thrown when git itself refuses. Carries the output so the operator sees it. */
class GitError extends Error {}

const say = (line = '') => console.log(line);
const ok = (line) => console.log(`  ok  ${line}`);
const warn = (line) => console.log(`WARN  ${line}`);
const fail = (line) => console.log(`FAIL  ${line}`);
const detail = (line) => console.log(`      ${line}`);

const pad = (value) => String(value).padStart(2, '0');

/** Local `YYYY-MM-DD HH:mm`, matching how the branch stamps read. */
function formatTimestamp(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Runs git and returns `{ code, output }`. Quiet: a single `finish` asks git
 * for a SHA, three ref lists and a tag, and echoing all of that would bury
 * the two lines the operator needs. git is a real executable, so no shell is
 * involved and arguments need no quoting even on Windows.
 */
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

/**
 * The root of the repository this is being run from. In a git worktree this
 * is the worktree's own root, which is where `package.json` and `scripts/`
 * live, so the state file lands in the right place either way.
 */
function findRepoRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new GitError(
      'Not inside a git repository, so there is nothing to cut a branch from.',
    );
  }
  return result.stdout.trim();
}

/**
 * Full ref names under a prefix. `%(refname)` rather than `%(refname:short)`
 * because the short form drops whichever leading segments git considers
 * unambiguous, which is not a fixed number and is exactly the sort of thing
 * to get wrong once and then delete the wrong branch over.
 */
function refNames(repoRoot, prefix) {
  return git(repoRoot, ['for-each-ref', '--format=%(refname)', prefix])
    .output.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Release branch names, from local refs and from one remote's tracking refs.
 * Both, because a branch pushed from another machine has to count as taken
 * when a name is being chosen, and has to be considered for pruning even
 * where no local copy was ever made.
 */
function listReleaseBranches(repoRoot, remote) {
  const local = new Set(
    refNames(repoRoot, `refs/heads/${REF_PREFIX}/`).map((ref) =>
      ref.slice('refs/heads/'.length),
    ),
  );
  const tracked = new Set(
    refNames(repoRoot, `refs/remotes/${remote}/${REF_PREFIX}/`).map((ref) =>
      ref.slice(`refs/remotes/${remote}/`.length),
    ),
  );
  return { local, remote: tracked, all: new Set([...local, ...tracked]) };
}

function listReleaseTags(repoRoot) {
  return new Set(
    refNames(repoRoot, `refs/tags/${REF_PREFIX}/`).map((ref) =>
      ref.slice('refs/tags/'.length),
    ),
  );
}

/** The commit a ref points at, or `null` if there is no such ref. */
function resolveCommit(repoRoot, ref) {
  const result = git(
    repoRoot,
    ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`],
    { allowFailure: true },
  );
  const sha = result.output.trim();
  return result.code === 0 && sha.length > 0 ? sha : null;
}

function tagExists(repoRoot, tag) {
  return resolveCommit(repoRoot, `refs/tags/${tag}`) !== null;
}

function readState(repoRoot) {
  const path = join(repoRoot, STATE_FILE);
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    warn(
      'The release state file was unreadable. Treating this as a fresh start.',
    );
  }
  return {};
}

function writeState(repoRoot, state) {
  writeFileSync(
    join(repoRoot, STATE_FILE),
    `${JSON.stringify(state, null, 2)}\n`,
    'utf8',
  );
}

/**
 * Writes an annotated tag, with the message passed through a file rather
 * than `-m`: the message is several lines, and a multi-line argument is not
 * something Windows quoting reliably survives. A temp file has no such
 * problem and is removed either way.
 */
function writeAnnotatedTag(repoRoot, tag, commit, message) {
  const dir = mkdtempSync(join(tmpdir(), 'release-tag-'));
  const messagePath = join(dir, 'tag-message.txt');
  try {
    writeFileSync(messagePath, message, 'utf8');
    git(repoRoot, ['tag', '-a', tag, commit, '-F', messagePath]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Pushes one ref, reporting a refusal rather than raising it. The explicit
 * `src:dst` refspec keeps this independent of whatever `push.default` and
 * `push.autoSetupRemote` are set to on the machine.
 */
function pushRef(repoRoot, remote, ref, options = {}) {
  if (options.dryRun) {
    detail(`would push ${ref} to ${remote}`);
    return true;
  }
  const result = git(repoRoot, ['push', remote, `${ref}:${ref}`], {
    allowFailure: true,
  });
  if (result.code === 0) return true;

  warn(
    `Could not push ${ref} to ${remote}. The local ref is there and is unchanged.`,
  );
  detail(`git push ${remote} ${ref}:${ref}`);
  const reason = result.output.trim().split(/\r?\n/).slice(-3).join('\n');
  if (reason) detail(reason);
  return false;
}

/** Refuses (exit 1) or warns about a working tree that is not clean. */
function checkTree(repoRoot, allowDirty) {
  const modified = gitLine(repoRoot, [
    'status',
    '--porcelain',
    '--untracked-files=no',
  ]);
  if (modified.length > 0 && !allowDirty) {
    fail(
      'Tracked files have been modified, so a release branch would name a commit',
    );
    fail('that is not what gets built. Commit or stash these first:');
    say();
    modified.split(/\r?\n/).forEach((line) => detail(line));
    say();
    detail('Pass --allow-dirty to record the attempt anyway.');
    return { ok: false, dirty: true };
  }
  if (modified.length > 0) {
    warn('Building from a dirty tree. The tag will say so.');
  }

  const untracked = gitLine(repoRoot, [
    'ls-files',
    '--others',
    '--exclude-standard',
  ]);
  if (untracked.length > 0) {
    warn(
      'Untracked files are present. EAS builds committed state, so these will not ship.',
    );
  }
  return { ok: true, dirty: modified.length > 0 };
}

/**
 * Cuts the branch for a run about to start, and pushes it straight away —
 * so a run that never comes back still left a record. The branch is created
 * without checking it out: the build has to run from the working tree as it
 * stands, and switching branches under it would at best be a surprise and at
 * worst lose somebody's place.
 */
function start(options) {
  const repoRoot = findRepoRoot();
  const platform = assertPlatform(options.platform ?? '');
  const remote = options.remote ?? DEFAULT_REMOTE;

  const tree = checkTree(repoRoot, options.allowDirty);
  if (!tree.ok) return 1;

  const commit = gitLine(repoRoot, ['rev-parse', 'HEAD']);
  const branches = listReleaseBranches(repoRoot, remote);
  const branch = availableBranchName(platform, new Date(), branches.all);

  git(repoRoot, ['branch', branch, commit]);
  ok(`Cut ${branch} at ${commit.slice(0, 8)}`);

  const pushed = pushRef(repoRoot, remote, `refs/heads/${branch}`);
  if (pushed) ok(`Pushed to ${remote}`);

  const state = readState(repoRoot);
  state[platform] = {
    branch,
    commit,
    startedAt: formatTimestamp(new Date()),
    remote,
    pushed,
    profile: options.profile,
    dirty: tree.dirty,
  };
  writeState(repoRoot, state);

  return 0;
}

/**
 * Tags the branch with how the run ended, then prunes.
 *
 * Missing state is a warning rather than an error: it means the deploy
 * started before this tooling existed, or `start` refused and the caller
 * carried on. Neither is a reason to report a successful release as a
 * failure.
 */
function finish(options) {
  const repoRoot = findRepoRoot();
  const platform = assertPlatform(options.platform ?? '');
  // The parser has already refused anything but these two; failure is the
  // safer of the two to land on if that ever stops being true.
  const outcome = options.outcome === 'success' ? 'success' : 'failed';

  const state = readState(repoRoot);
  const run = state[platform];
  if (!run) {
    warn(
      `No release branch is open for ${platform}, so there is nothing to tag.`,
    );
    return 0;
  }

  const remote = options.remote ?? run.remote ?? DEFAULT_REMOTE;
  const tag = tagNameFor(run.branch, outcome);
  writeOutcomeTag(repoRoot, tag, run, platform, outcome, options);

  // A branch whose push failed at the start gets one more try now, so an
  // outage that lasted a build does not cost the record.
  if (!run.pushed) pushRef(repoRoot, remote, `refs/heads/${run.branch}`);
  pushRef(repoRoot, remote, `refs/tags/${tag}`);

  delete state[platform];
  writeState(repoRoot, state);

  if (!options.noPrune) {
    prune({ ...options, command: 'prune', remote });
  }
  return 0;
}

/**
 * Writes the outcome tag for a finished run, unless one already exists (a
 * re-run of `finish` leaves the first answer standing).
 */
function writeOutcomeTag(repoRoot, tag, run, platform, outcome, options) {
  if (tagExists(repoRoot, tag)) {
    warn(`${tag} already exists. Leaving it as it is.`);
    return;
  }
  const notes = [
    run.dirty ? 'Built from a dirty working tree.' : '',
    options.notes ?? '',
  ]
    .filter((part) => part.length > 0)
    .join(' ');
  writeAnnotatedTag(
    repoRoot,
    tag,
    run.commit,
    buildTagMessage({
      branch: run.branch,
      platform,
      outcome,
      commit: run.commit,
      profile: run.profile,
      startedAt: run.startedAt,
      duration: options.duration,
      exitCode: options.exitCode,
      submitted: options.submitted,
      notes: notes.length > 0 ? notes : undefined,
    }),
  );
  ok(`Tagged ${tag}`);
}

/**
 * Removes failed and unfinished release branches past the keep window.
 *
 * An unfinished branch is tagged before it is deleted — that ordering is the
 * point rather than a nicety. A failed run's commit is already pinned by its
 * tag, but an unfinished run has no tag at all, and if the release was cut
 * from a branch that has since been deleted then this ref is the only thing
 * holding the commit. Tag first and the deletion cannot lose anything.
 */
function prune(options) {
  const repoRoot = findRepoRoot();
  const remote = options.remote ?? DEFAULT_REMOTE;
  const keepDays = options.keepDays ?? DEFAULT_KEEP_DAYS;

  const branches = listReleaseBranches(repoRoot, remote);
  const plan = selectPrunable({
    branches: branches.all,
    tags: listReleaseTags(repoRoot),
    now: new Date(),
    keepDays,
  });

  const doomed = [...plan.failed, ...plan.unfinished];
  if (doomed.length === 0) {
    if (plan.kept.length > 0) {
      detail(
        `${plan.kept.length} release branch(es) kept, none past ${keepDays} days.`,
      );
    }
    return 0;
  }

  const current = gitLine(repoRoot, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const unfinished = new Set(plan.unfinished);
  const ops = gitOpsFor(repoRoot, remote, branches);

  // Counted from what was actually retired, not from what was listed:
  // `retireBranch` keeps a branch whose tag could not be pushed, and a
  // summary naming the doomed list would report those as pruned.
  let pruned = 0;
  for (const branch of doomed) {
    const retired = retireBranch(
      {
        branch,
        unfinished: unfinished.has(branch),
        current,
        remote,
        dryRun: options.dryRun,
      },
      ops,
    );
    if (retired) pruned += 1;
  }

  say();
  const kept = doomed.length - pruned;
  detail(
    `Pruned ${pruned} branch(es) older than ${keepDays} days. Their tags are kept.` +
      (kept > 0 ? ` Kept ${kept} whose tag could not be pushed.` : ''),
  );
  return 0;
}

/**
 * The git operations `retireBranch` needs, bound to this repository.
 *
 * The decision itself lives in `lib/branchRetirement.js` with no git in it;
 * this is the half that touches the repository, kept small enough that
 * reading it tells you exactly what each injected function does.
 */
function gitOpsFor(repoRoot, remote, branches) {
  return {
    resolveCommit: (ref) => resolveCommit(repoRoot, ref),
    tagExists: (tag) => tagExists(repoRoot, tag),
    writeTag: (tag, commit, message) =>
      writeAnnotatedTag(repoRoot, tag, commit, message),
    pushTag: (tag, options = {}) =>
      pushRef(repoRoot, remote, `refs/tags/${tag}`, options),
    deleteBranch: (branch) => deleteBranch(repoRoot, remote, branches, branch),
    warn,
    ok,
    note: detail,
  };
}

/**
 * Deletes a branch wherever it exists, locally and on the remote. A remote
 * deletion that fails is a warning: the local one has already happened, and
 * the next prune will try the remote again.
 */
function deleteBranch(repoRoot, remote, branches, branch) {
  if (branches.local.has(branch)) {
    git(repoRoot, ['branch', '-D', branch]);
  }
  if (branches.remote.has(branch)) {
    const deleted = git(repoRoot, ['push', remote, '--delete', branch], {
      allowFailure: true,
    });
    if (deleted.code !== 0) warn(`Could not delete ${branch} from ${remote}.`);
  }
  ok(`Removed ${branch}`);
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
    if (options.command === 'start') return start(options);
    if (options.command === 'finish') return finish(options);
    return prune(options);
  } catch (error) {
    if (error instanceof GitError || error instanceof ReleaseNameError) {
      fail(error.message);
      return 1;
    }
    throw error;
  }
}

process.exitCode = main(process.argv.slice(2));
