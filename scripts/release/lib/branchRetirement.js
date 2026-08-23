/**
 * The decision to delete one release branch.
 *
 * `lib/releaseBranch.js` decides which branches are *candidates*; this module
 * decides whether a candidate actually goes, and in what order the steps
 * happen. That is a separate question and it gets its own module because
 * deleting a branch is the one act in this tooling that running it again
 * cannot undo.
 *
 * Every git operation arrives as a function in `ops`, so the whole decision
 * -- including the orderings that exist purely for safety -- can be asserted
 * against mocks with no repository anywhere near it (see
 * `__tests__/branchRetirement.test.js`). The CLI in
 * `scripts/release/release-branch.js` supplies the real implementations.
 *
 * ## The orderings that matter
 *
 * A branch is tagged before it is deleted, and the tag is on the remote
 * before the branch leaves it. Both directions of that are load-bearing. An
 * unfinished run has no tag at all, so if the branch it was cut from has
 * since been deleted, this ref is the only thing still holding the commit --
 * tag first and the deletion cannot lose anything. And a tag that exists
 * only locally is no substitute for a branch that exists on the remote, so
 * the push has to have succeeded before the remote branch is removed.
 *
 * Anything that stops a deletion is a warning and a `false`, never a throw.
 * The next prune tries the branch again, which is the right outcome for a
 * push that failed because the network was out for a minute.
 */

const {
  buildTagMessage,
  parseBranchName,
  tagNameFor,
} = require('./releaseBranch');

/**
 * Retires one release branch: tag it if it needs one, get the tag onto the
 * remote, then delete the branch.
 *
 * @param {object} candidate
 * @param {string} candidate.branch     The branch being considered.
 * @param {boolean} candidate.unfinished  True when no run ever tagged an
 *   outcome for it, so this module has to write the standing-in tag itself.
 * @param {string} candidate.current    The checked-out branch, which is never
 *   deleted.
 * @param {string} candidate.remote     The remote the branch may live on.
 * @param {boolean} [candidate.dryRun]  Report the steps, take none of them.
 * @param {object} ops                  The injected git operations.
 * @param {(ref: string) => string|null} ops.resolveCommit
 * @param {(tag: string) => boolean} ops.tagExists
 * @param {(tag: string, commit: string, message: string) => void} ops.writeTag
 * @param {(tag: string) => boolean} ops.pushTag
 * @param {(branch: string) => void} ops.deleteBranch
 * @param {(line: string) => void} ops.warn
 * @param {(line: string) => void} ops.ok
 * @param {(line: string) => void} ops.note
 * @returns {boolean} whether the branch was retired (or would have been, on a
 *   dry run). `false` means it is being kept and should be tried again later.
 */
function retireBranch(candidate, ops) {
  const { branch, unfinished, remote, dryRun = false } = candidate;

  const commit = deletableCommit(candidate, ops);
  if (!commit) return false;

  const tag = tagNameFor(branch, unfinished ? 'unfinished' : 'failed');
  if (unfinished) writeUnfinishedTag({ branch, commit, tag, dryRun }, ops);

  // Pushing a tag the remote already has costs one round trip and succeeds,
  // which is a cheap price for never deleting a remote branch whose only
  // replacement is a tag that never left this machine.
  const needsPush = dryRun || ops.tagExists(tag);
  if (needsPush && !pushOutcomeTag({ branch, tag, remote, dryRun }, ops)) {
    return false;
  }

  if (dryRun) {
    ops.note(`would delete ${branch}`);
    return true;
  }

  ops.deleteBranch(branch);
  return true;
}

/**
 * The commit a branch could be tagged at, or `null` with the reason already
 * reported. Two branches never get past this: the checked-out one, and one
 * that resolves to nothing -- a branch this cannot tag is a branch it must
 * not remove, because the tag is what makes the deletion lossless.
 */
function deletableCommit({ branch, current, remote }, ops) {
  if (branch === current) {
    ops.warn(`${branch} is checked out, so it is being left alone.`);
    return null;
  }

  const commit =
    ops.resolveCommit(`refs/heads/${branch}`) ??
    ops.resolveCommit(`refs/remotes/${remote}/${branch}`);
  if (!commit) {
    ops.warn(`${branch} resolves to no commit, so it is being left alone.`);
    return null;
  }
  return commit;
}

/**
 * Writes the tag that stands in for a run which never reported an outcome,
 * unless an earlier prune already wrote it.
 */
function writeUnfinishedTag({ branch, commit, tag, dryRun }, ops) {
  if (ops.tagExists(tag)) return;
  if (dryRun) {
    ops.note(`would tag ${tag}`);
    return;
  }

  const parsed = parseBranchName(branch);
  ops.writeTag(
    tag,
    commit,
    buildTagMessage({
      branch,
      platform: parsed?.platform ?? 'ios',
      outcome: 'unfinished',
      commit,
      notes:
        'No outcome was ever recorded. The run did not reach its own ending.',
    }),
  );
  ops.ok(`Tagged ${tag} before removing the branch`);
}

/** Gets the branch's standing-in tag onto the remote, or keeps the branch. */
function pushOutcomeTag({ branch, tag, remote, dryRun }, ops) {
  if (ops.pushTag(tag, { dryRun })) return true;
  ops.warn(`${branch} is being kept until ${tag} can be pushed to ${remote}.`);
  return false;
}

module.exports = { retireBranch };
