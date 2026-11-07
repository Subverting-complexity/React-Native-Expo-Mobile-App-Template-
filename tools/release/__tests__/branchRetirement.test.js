/**
 * The decision to delete one release branch, with every git operation faked.
 *
 * Deleting a branch is the one act in this tooling that running it again
 * cannot undo, so the refusals get more attention here than the happy path.
 * The case that matters most is the last one: a branch is never deleted
 * until the tag standing in for it has actually reached the remote, because
 * until then the branch may be the run's only remote record.
 */
const { retireBranch } = require('../lib/branchRetirement');

const BRANCH = 'release/ios/2026-06-01-1000';
const FAILED_TAG = `${BRANCH}-failed`;
const UNFINISHED_TAG = `${BRANCH}-unfinished`;

/**
 * Fake git. `commits` maps ref to sha, `tags` is the set that exists, and
 * `pushes` records what was attempted so the ordering can be asserted.
 */
function fakeOps(overrides = {}) {
  const state = {
    commits: { [`refs/heads/${BRANCH}`]: 'abc1234' },
    tags: new Set(),
    pushes: [],
    written: [],
    deleted: [],
    warnings: [],
    notes: [],
    pushSucceeds: true,
    ...overrides,
  };

  const ops = {
    resolveCommit: (ref) => state.commits[ref] ?? null,
    tagExists: (tag) => state.tags.has(tag),
    writeTag: (tag, commit, message) => {
      state.written.push({ tag, commit, message });
      state.tags.add(tag);
    },
    pushTag: (tag) => {
      state.pushes.push(tag);
      return state.pushSucceeds;
    },
    deleteBranch: (branch) => state.deleted.push(branch),
    warn: (line) => state.warnings.push(line),
    ok: (line) => state.notes.push(line),
    note: (line) => state.notes.push(line),
  };

  return { state, ops };
}

const candidate = (extra = {}) => ({
  branch: BRANCH,
  unfinished: false,
  current: 'main',
  remote: 'origin',
  ...extra,
});

describe('retireBranch', () => {
  it('pushes the existing failure tag, then deletes the branch', () => {
    const { state, ops } = fakeOps({ tags: new Set([FAILED_TAG]) });

    expect(retireBranch(candidate(), ops)).toBe(true);
    expect(state.pushes).toEqual([FAILED_TAG]);
    expect(state.deleted).toEqual([BRANCH]);
    // Nothing was written: the run already tagged its own outcome.
    expect(state.written).toEqual([]);
  });

  it('refuses to delete the checked-out branch', () => {
    const { state, ops } = fakeOps({ tags: new Set([FAILED_TAG]) });

    expect(retireBranch(candidate({ current: BRANCH }), ops)).toBe(false);
    expect(state.deleted).toEqual([]);
    expect(state.warnings[0]).toContain('checked out');
  });

  it('refuses to delete a branch whose commit cannot be resolved', () => {
    // No commit means no tag can be written, and a branch this cannot tag is
    // a branch it must not remove.
    const { state, ops } = fakeOps({ commits: {} });

    expect(retireBranch(candidate({ unfinished: true }), ops)).toBe(false);
    expect(state.written).toEqual([]);
    expect(state.deleted).toEqual([]);
    expect(state.warnings[0]).toContain('no commit');
  });

  it('falls back to the remote-tracking ref for the commit', () => {
    const { state, ops } = fakeOps({
      commits: { [`refs/remotes/origin/${BRANCH}`]: 'def5678' },
    });

    expect(retireBranch(candidate({ unfinished: true }), ops)).toBe(true);
    expect(state.written[0].commit).toBe('def5678');
  });

  it('tags an unfinished run before deleting it, never after', () => {
    const { state, ops } = fakeOps();
    const order = [];
    const { writeTag, deleteBranch } = ops;
    ops.writeTag = (...args) => {
      order.push('tag');
      writeTag(...args);
    };
    ops.pushTag = (tag) => {
      order.push('push');
      state.pushes.push(tag);
      return true;
    };
    ops.deleteBranch = (...args) => {
      order.push('delete');
      deleteBranch(...args);
    };

    expect(retireBranch(candidate({ unfinished: true }), ops)).toBe(true);
    expect(order).toEqual(['tag', 'push', 'delete']);
    expect(state.written[0].tag).toBe(UNFINISHED_TAG);
    expect(state.written[0].message).toContain('Release never finished');
  });

  it('does not rewrite an unfinished tag an earlier prune already wrote', () => {
    const { state, ops } = fakeOps({ tags: new Set([UNFINISHED_TAG]) });

    expect(retireBranch(candidate({ unfinished: true }), ops)).toBe(true);
    expect(state.written).toEqual([]);
    expect(state.deleted).toEqual([BRANCH]);
  });

  it('keeps the branch until its tag has reached the remote', () => {
    // The case this module exists for. Until the tag is on the remote, the
    // branch may be the only remote record that this attempt ever happened.
    const { state, ops } = fakeOps({
      tags: new Set([FAILED_TAG]),
      pushSucceeds: false,
    });

    expect(retireBranch(candidate(), ops)).toBe(false);
    expect(state.pushes).toEqual([FAILED_TAG]);
    expect(state.deleted).toEqual([]);
    expect(state.warnings[0]).toContain('being kept until');
  });

  it('reports a dry run without touching anything', () => {
    const { state, ops } = fakeOps();

    expect(
      retireBranch(candidate({ unfinished: true, dryRun: true }), ops),
    ).toBe(true);
    expect(state.written).toEqual([]);
    expect(state.deleted).toEqual([]);
    expect(state.notes.join('\n')).toContain(`would tag ${UNFINISHED_TAG}`);
    expect(state.notes.join('\n')).toContain(`would delete ${BRANCH}`);
  });
});
