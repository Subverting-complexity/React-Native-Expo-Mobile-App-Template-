# Release branches and outcome tags

Every attempt to put a build in front of a store leaves a record in git. This
document says what that record is, where it lives, how long it lives for, and
what to do when part of it goes wrong.

The two scripts that produce these records are `scripts/DeployiOSTestFlight.ps1`
(`npm run deploy:ios`) and `scripts/DeployAndroidPlayStore.ps1`
(`npm run deploy:android`). Development builds and dry runs do none of this —
it is a record of release attempts, not of builds.

A deploy also moves the release version on before it cuts anything, so the
branch names the commit that carries the version being built. That is a
separate mechanism with its own rules -- see
[`docs/releasing.md`](releasing.md#automatic-version-bump).

## What a release leaves behind

A deploy cuts a branch at the commit it is about to build, named for the
platform and the minute the run began:

```
release/ios/2026-08-13-1432
release/android/2026-08-13-1432
```

The branch is pushed immediately, **before** the build starts. When the run
finishes, an annotated tag is written at the same commit and pushed:

```
release/ios/2026-08-13-1432-success
release/android/2026-08-13-1432-failed
```

The tag's message holds what a name cannot: the profile, the full commit, the
start time, the duration, the exit code, and whether the build was handed to
the store. Read the whole deployment history with:

```bash
git tag -n20 -l "release/*"
```

`git show <tag>` gives the same information alongside the commit.

## Why the outcome is on a tag rather than in the branch name

The outcome is not known when the branch is created, so a branch named for
its outcome would have to be renamed at the end. Git has no rename on a
remote: you push the new name and delete the old ref, so every release would
leave churn behind and anyone who had already fetched would keep the stale
name.

Writing the tag at the end instead means nothing is ever renamed. It also
buys a state that no naming scheme could express on its own: **a release
branch with no tag beside it is a run that never reached its own ending** —
the window was closed, the machine slept, the power went. That is worth
being able to see, and it is the reason the branch is pushed before the build
rather than after it. A record that only survives the runs that finished
politely is recording the wrong half.

## What is kept, and for how long

| State          | Branch                                           | Tag           |
| -------------- | ------------------------------------------------ | ------------- |
| Succeeded      | kept for good                                    | kept for good |
| Failed         | removed after 30 days                            | kept for good |
| Never finished | tagged `-unfinished`, then removed after 30 days | kept for good |

Tags are cheap, stay out of the branch picker, and hold more than the branch
did, so pruning the branch loses nothing. Successful branches are never
pruned, because those are the commits you may still need to cut a hotfix
from.

Pruning runs automatically at the end of every deploy. To run it by itself,
or to see what it would do without doing it:

```bash
node scripts/release/release-branch.js prune --dry-run
```

An unfinished branch is tagged **before** it is deleted, never after. That
ordering is the whole safety argument: a failed run's commit is already
pinned by its own tag, but an unfinished run has no tag at all, and if the
release was cut from a feature branch that has since been merged and deleted
then this ref is the only thing holding that commit. Tag first and the
deletion cannot lose anything. For the same reason the pruner ignores every
branch whose name it does not fully recognise rather than guessing at it.

## Refusing a dirty working tree

A deploy stops before it starts if tracked files have been modified. A
branch is a pointer to a commit, so a branch cut from a dirty tree names a
commit that is not what gets built, and a record that looks trustworthy and
is not is worse than no record at all.

Commit or stash the changes and run again. If you genuinely mean to build
from an unclean tree, both deploy scripts take `-AllowDirty`, and the tag
then says `Built from a dirty working tree.` in its notes.

Untracked files produce a warning rather than a refusal, because EAS builds
committed state and an untracked file will not ship either way.

## When something goes wrong

**The push failed.** The branch or tag is on your machine and nowhere else.
This is a warning, never a failure: the deploy is the point of the exercise
and the bookkeeping is not allowed to stop it. `finish` retries the branch
push at the end of the run, and the console prints the exact `git push` to
run by hand.

**Two runs started in the same minute.** The second walks the stamp forward
a minute at a time until it finds a free name, so its branch can read a
minute or two later than the clock did. Names stay unique and stay in order.

**A deploy was interrupted.** `scripts/release/release-state.json` still
names the open branch. Starting another deploy for the same platform simply
replaces it; the abandoned branch is tagged `-unfinished` by a later prune
and removed 30 days after it was cut. To close it out by hand:

```bash
node scripts/release/release-branch.js finish --platform ios --outcome failed --notes "Interrupted"
```

## Where the code is

| File                                   | What it holds                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `scripts/release/lib/releaseBranch.js` | Naming, parsing, tag messages, and the rule deciding what gets pruned. Pure functions, no git. |
| `scripts/release/lib/options.js`       | The command line, also pure.                                                                   |
| `scripts/release/release-branch.js`    | The `start`, `finish` and `prune` commands. All the git and filesystem work.                   |
| `scripts/release/__tests__/`           | The naming and pruning rules, and the command line.                                            |

The split is deliberate: deleting a branch is the one thing here that
running the command again cannot undo, so the rule that decides which
branches die is kept where it can be unit-tested, and PowerShell is left
holding as little logic as possible.

`scripts/release/release-state.json` is the one file this writes into the
working tree, and it is gitignored. It has to be: a tracked file that a
release writes would make the next release's clean-tree check fail on the
previous release's bookkeeping.
