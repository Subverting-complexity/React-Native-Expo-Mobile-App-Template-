/**
 * A throwaway repository with a bare `origin`, for the integration tests.
 *
 * Lives outside `__tests__/` on purpose: everything under that directory is
 * collected as a test suite, and a helper file with no tests in it would
 * fail the run.
 *
 * The properties these tools promise -- a bump that happens once across two
 * deploys, a tag that is on the remote before its branch is deleted -- are
 * properties of real git state across more than one run. No amount of
 * asserting on pure functions demonstrates them, so the integration tests
 * spawn the real CLI as a child process and then read the repository back.
 *
 * Each test gets its own repository, because the tool under test mutates it.
 */
const { execFileSync, spawnSync } = require('node:child_process');
const {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

/** An `app.config.ts` with the fields the version tool cares about. */
const APP_CONFIG = [
  "import type { ConfigContext } from 'expo/config';",
  '',
  'export default ({ config }: ConfigContext) => ({',
  '  ...config,',
  "  name: 'ExpoTemplate',",
  "  version: '1.0.0',",
  "  ios: { bundleIdentifier: 'dev.template.expo', buildNumber: '1' },",
  "  android: { package: 'dev.template.expo', versionCode: 1 },",
  '});',
  '',
].join('\n');

/**
 * Creates `origin` (bare) and a `work` clone with one seed commit on `main`.
 *
 * Identity and default branch are set per repository rather than relied on
 * from the machine, so the tests behave the same on a developer's laptop and
 * on a CI runner with no global git config at all.
 */
function createTempRepo() {
  const root = mkdtempSync(join(tmpdir(), 'release-tool-it-'));
  const origin = join(root, 'origin.git');
  const work = join(root, 'work');

  run(root, ['init', '--bare', '--initial-branch=main', origin]);
  run(root, ['init', '--initial-branch=main', work]);
  configure(work);
  run(work, ['remote', 'add', 'origin', origin]);

  // The release tool writes its state file into scripts/release/.
  mkdirSync(join(work, 'scripts', 'release'), { recursive: true });
  writeFileSync(join(work, 'app.config.ts'), APP_CONFIG, 'utf8');
  writeFileSync(
    join(work, '.gitignore'),
    'scripts/release/release-state.json\n',
    'utf8',
  );
  run(work, ['add', '.']);
  run(work, ['commit', '--message', 'chore: seed']);
  run(work, ['push', '--set-upstream', 'origin', 'main']);

  return {
    root,
    origin,
    work,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function configure(repo) {
  // Line endings stay exactly as written, so the byte-for-byte assertions on
  // the version file mean the same thing on Windows as anywhere else.
  run(repo, ['config', 'core.autocrlf', 'false']);
  run(repo, ['config', 'user.email', 'tests@example.com']);
  run(repo, ['config', 'user.name', 'Release Tool Tests']);
  run(repo, ['config', 'commit.gpgsign', 'false']);
  run(repo, ['config', 'tag.gpgsign', 'false']);
}

/**
 * Runs git in `cwd`, throwing with git's own output when it refuses.
 *
 * stderr is captured rather than inherited: git reports a successful push and
 * its line-ending advice there, and letting several dozen of those through
 * would bury the test run's own output.
 */
function run(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** Runs git and returns its trimmed output, or '' when it refuses. */
function tryRun(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return result.status === 0 ? result.stdout.trim() : '';
}

/**
 * Runs one of the release CLIs as a real child process against `cwd`.
 *
 * A child process rather than an import, so what is being tested is the tool
 * as the deploy scripts actually invoke it -- argument parsing, exit code
 * and all -- and not a set of functions reached around the outside of it.
 */
function runTool(tool, cwd, args) {
  const toolPath = join(__dirname, '..', `${tool}.js`);
  const result = spawnSync(process.execPath, [toolPath, ...args], {
    cwd,
    encoding: 'utf8',
  });
  return {
    code: result.status,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

const runBump = (cwd, args = []) =>
  runTool('version-bump', cwd, ['bump', ...args]);
const runRelease = (cwd, args) => runTool('release-branch', cwd, args);

/** Local branch names, one per line. */
const branches = (repo) =>
  tryRun(repo, ['for-each-ref', '--format=%(refname:short)', 'refs/heads/'])
    .split(/\r?\n/)
    .filter(Boolean);

/** Tag names, one per line. */
const tags = (repo) =>
  tryRun(repo, ['for-each-ref', '--format=%(refname:short)', 'refs/tags/'])
    .split(/\r?\n/)
    .filter(Boolean);

/** Commit subjects, newest first. */
const subjects = (repo) =>
  tryRun(repo, ['log', '--format=%s']).split(/\r?\n/).filter(Boolean);

/** The version `app.config.ts` currently holds. */
function versionIn(repo) {
  const text = readFileSync(join(repo, 'app.config.ts'), 'utf8');
  return /\bversion:\s*'([^']*)'/.exec(text)?.[1] ?? null;
}

module.exports = {
  APP_CONFIG,
  branches,
  createTempRepo,
  run,
  runBump,
  runRelease,
  subjects,
  tags,
  tryRun,
  versionIn,
};
