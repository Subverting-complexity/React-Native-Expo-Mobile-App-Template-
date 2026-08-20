/**
 * Command line for the release-branch tool. Pure — no process state — so the
 * parsing rules are unit-testable (see `__tests__/options.test.js`).
 *
 * An unknown flag is an error rather than a shrug: silently ignoring a
 * mistyped `--no-prume` is how a run that should have skipped pruning goes
 * and prunes anyway.
 */

/** Thrown for arguments the tool cannot act on. The CLI prints usage. */
class UsageError extends Error {}

const COMMANDS = ['start', 'finish', 'prune', 'help'];

/** Flags that take a value, mapped to the option key they fill. */
const VALUE_FLAGS = new Map([
  ['--platform', 'platform'],
  ['--profile', 'profile'],
  ['--outcome', 'outcome'],
  ['--duration', 'duration'],
  ['--exit-code', 'exitCode'],
  ['--submitted', 'submitted'],
  ['--notes', 'notes'],
  ['--remote', 'remote'],
  ['--keep-days', 'keepDays'],
]);

/** Flags that stand alone. */
const BOOLEAN_FLAGS = new Map([
  ['--dry-run', 'dryRun'],
  ['--allow-dirty', 'allowDirty'],
  ['--no-prune', 'noPrune'],
]);

function usage() {
  return [
    'Usage: node scripts/release/release-branch.js <command> [flags]',
    '',
    'Commands:',
    '  start   --platform <ios|android> [--profile <name>] [--allow-dirty]',
    '          Cut and push release/<platform>/<stamp> at HEAD, before the build.',
    '  finish  --platform <ios|android> --outcome <success|failed>',
    '          [--duration <text>] [--exit-code <n>] [--submitted <yes|no>]',
    '          [--notes <text>] [--no-prune]',
    '          Tag the open branch with how the run ended, then prune.',
    '  prune   [--keep-days <n>] [--dry-run]',
    '          Remove failed/unfinished branches past the keep window (default 30',
    '          days). Their tags are kept for good; successes are never pruned.',
    '  help    Show this text.',
    '',
    'Shared flags: --remote <name> (default origin)',
  ].join('\n');
}

/** One flag (and possibly its value) folded into `options`. */
function consumeFlag(argv, index, options) {
  const flag = argv[index];

  const booleanKey = BOOLEAN_FLAGS.get(flag);
  if (booleanKey) {
    options[booleanKey] = true;
    return index + 1;
  }

  const valueKey = VALUE_FLAGS.get(flag);
  if (!valueKey) {
    throw new UsageError(`Unknown flag '${flag}'.`);
  }
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new UsageError(`${flag} needs a value.`);
  }
  options[valueKey] = value;
  return index + 2;
}

/** The flags each command cannot run without. */
function assertRequiredFlags(options) {
  if (options.command === 'start' && !options.platform) {
    throw new UsageError('start needs --platform.');
  }
  if (options.command === 'finish') {
    if (!options.platform) throw new UsageError('finish needs --platform.');
    if (options.outcome !== 'success' && options.outcome !== 'failed') {
      throw new UsageError("finish needs --outcome 'success' or 'failed'.");
    }
  }
}

/** Converts the raw string values that are not actually strings. */
function convertTypedValues(options) {
  if (options.submitted !== undefined) {
    if (options.submitted !== 'yes' && options.submitted !== 'no') {
      throw new UsageError("--submitted takes 'yes' or 'no'.");
    }
    options.submitted = options.submitted === 'yes';
  }
  const integerFlags = [
    ['exitCode', '--exit-code'],
    ['keepDays', '--keep-days'],
  ];
  for (const [key, flag] of integerFlags) {
    if (options[key] === undefined) continue;
    const parsed = Number(options[key]);
    if (!Number.isInteger(parsed)) {
      throw new UsageError(`${flag} takes an integer.`);
    }
    options[key] = parsed;
  }
}

/** Validates and converts the raw string options for one command. */
function refineOptions(options) {
  assertRequiredFlags(options);
  convertTypedValues(options);
  return options;
}

/** @returns the parsed options, with `command` always set. */
function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!command || !COMMANDS.includes(command)) {
    throw new UsageError(
      `Expected a command (${COMMANDS.join(', ')}), got '${command ?? ''}'.`,
    );
  }

  const options = { command, dryRun: false, allowDirty: false, noPrune: false };
  let index = 0;
  while (index < rest.length) {
    index = consumeFlag(rest, index, options);
  }

  return refineOptions(options);
}

module.exports = { UsageError, parseArgs, usage };
