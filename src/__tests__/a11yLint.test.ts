/**
 * Proves the accessibility lint gate is wired and actually fires.
 *
 * The rules and plugin are read straight out of the project's real
 * `eslint.config.js` (not a hand-maintained copy), then executed through the
 * ESLint Node API against fixture source. A regression that drops the
 * `react-native-a11y` plugin, removes a gated rule, or breaks rule execution
 * under the installed ESLint version fails this test.
 *
 * ESLint's own flat-config loader resolves config files with a dynamic
 * `import()`, which Jest's VM rejects without experimental module flags. So the
 * config file is `require()`d here (it is CommonJS) and its a11y block is passed
 * as an `overrideConfig`, with `overrideConfigFile: true` to stop ESLint
 * re-loading the file itself.
 */
import { ESLint, type Linter } from 'eslint';

type A11yBlock = {
  plugins?: Record<string, unknown>;
  rules?: Linter.RulesRecord;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const projectConfig = require('../../eslint.config.js') as A11yBlock[];

const a11yBlock = projectConfig.find(
  (block) => !!block.plugins && 'react-native-a11y' in block.plugins,
);

/** Collect only the accessibility rule ids reported for a chunk of TSX. */
async function a11yRuleIds(eslint: ESLint, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, {
    filePath: 'src/__a11y_fixture__.tsx',
  });
  return result.messages
    .map((message) => message.ruleId)
    .filter((id): id is string => !!id && id.startsWith('react-native-a11y/'));
}

describe('accessibility lint gate', () => {
  it('wires the react-native-a11y plugin into the project config', () => {
    expect(a11yBlock).toBeDefined();
    expect(Object.keys(a11yBlock?.rules ?? {})).toContain(
      'react-native-a11y/no-nested-touchables',
    );
  });

  // One instance, built from the project's real a11y plugin + rules.
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      // Flat config only lints .tsx when a block declares it; the fixtures are
      // linted under a .tsx filePath below.
      files: ['**/*.tsx'],
      plugins: a11yBlock?.plugins,
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      rules: a11yBlock?.rules,
    } as Linter.Config,
  });

  it('rejects an invalid accessibilityRole value', async () => {
    const ids = await a11yRuleIds(
      eslint,
      `import { Pressable } from 'react-native';
       export function Bad() {
         return <Pressable accessibilityRole="not-a-role" accessibilityLabel="x" />;
       }`,
    );
    expect(ids).toContain('react-native-a11y/has-valid-accessibility-role');
  });

  it('rejects an interactive element with no accessibility descriptor', async () => {
    const ids = await a11yRuleIds(
      eslint,
      `import { Pressable } from 'react-native';
       export function NoDescriptor() {
         return <Pressable />;
       }`,
    );
    expect(ids).toContain(
      'react-native-a11y/has-valid-accessibility-descriptors',
    );
  });

  it('rejects a clickable element nested in an accessible container', async () => {
    const ids = await a11yRuleIds(
      eslint,
      `import { View, TouchableOpacity } from 'react-native';
       export function Nested() {
         return (
           <View accessible={true}>
             <TouchableOpacity accessibilityRole="button" accessibilityLabel="inner" />
           </View>
         );
       }`,
    );
    expect(ids).toContain('react-native-a11y/no-nested-touchables');
  });

  it('accepts a correctly described interactive element', async () => {
    const ids = await a11yRuleIds(
      eslint,
      `import { Pressable } from 'react-native';
       export function Good() {
         return (
           <Pressable accessibilityRole="button" accessibilityLabel="Save">
             {null}
           </Pressable>
         );
       }`,
    );
    expect(ids).toEqual([]);
  });
});
