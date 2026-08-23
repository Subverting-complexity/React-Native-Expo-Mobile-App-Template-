/**
 * Command line for the version-bump tool. Pure -- no process state -- so the
 * parsing rules are unit-testable (see `__tests__/versionOptions.test.js`).
 *
 * There is deliberately no `--skip-bump` or `--no-bump`. The tool already
 * detects that the last commit was its own and stops on its own, so a manual
 * lever would only add a second thing to get wrong, and the one that has to
 * be remembered is exactly the one that gets forgotten. See
 * `lib/version.js` for how the detection works.
 *
 * An unknown flag is an error rather than a shrug: a mistyped `--levle patch`
 * silently ignored is how a patch release goes out as a minor one.
 */

const { UsageError } = require('./options');
const { DEFAULT_LEVEL, LEVELS } = require('./version');

const COMMANDS = ['bump', 'help'];

/** The base branch a release is cut from when the caller does not say. */
const DEFAULT_BASE = 'main';

/** The remote a bump is pushed to when the caller does not say. */
const DEFAULT_REMOTE = 'origin';

/** Flags that take a value, mapped to the option key they fill. */
const VALUE_FLAGS = new Map([
  ['--level', 'level'],
  ['--base', 'base'],
  ['--remote', 'remote'],
]);

function usage() {
  return [
    'Usage: node scripts/release/version-bump.js <command> [flags]',
    '',
    'Commands:',
    `  bump  [--level ${LEVELS.join('|')}] [--base ${DEFAULT_BASE}] [--remote ${DEFAULT_REMOTE}]`,
    `        Move the release version on one level (default ${DEFAULT_LEVEL}), commit it`,
    '        to the base branch and push. Does nothing if the last commit was',
    '        already a bump, so running it once per store still bumps once.',
    '  help  Show this text.',
  ].join('\n');
}

/** One flag (and its value) folded into `options`. */
function consumeFlag(argv, index, options) {
  const flag = argv[index];
  const key = VALUE_FLAGS.get(flag);
  if (!key) {
    throw new UsageError(`Unknown flag '${flag}'.`);
  }
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new UsageError(`${flag} needs a value.`);
  }
  options[key] = value;
  return index + 2;
}

/** @returns the parsed options, with `command`, `level`, `base` and `remote` set. */
function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!command || !COMMANDS.includes(command)) {
    throw new UsageError(
      `Expected a command (${COMMANDS.join(', ')}), got '${command ?? ''}'.`,
    );
  }

  const options = {
    command,
    level: DEFAULT_LEVEL,
    base: DEFAULT_BASE,
    remote: DEFAULT_REMOTE,
  };
  let index = 0;
  while (index < rest.length) {
    index = consumeFlag(rest, index, options);
  }

  if (!LEVELS.includes(options.level)) {
    throw new UsageError(`--level takes ${LEVELS.join(', ')}.`);
  }
  return options;
}

module.exports = { DEFAULT_BASE, DEFAULT_REMOTE, UsageError, parseArgs, usage };
