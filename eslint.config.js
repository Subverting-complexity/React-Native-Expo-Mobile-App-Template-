// Flat ESLint config for the Expo template.
// Layers: Expo's recommended flat config (core + TypeScript + React +
// Expo rules), project complexity/nesting limits, accessibility validation,
// then eslint-config-prettier last so Prettier owns all formatting and ESLint
// never fights it.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const reactNativeA11y = require('eslint-plugin-react-native-a11y');

module.exports = defineConfig([
  // Paths ESLint should never look at (generated output, deps, coverage).
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'coverage/**',
    ],
  },

  ...expoConfig,

  // Project guardrails: keep functions and control flow shallow and small.
  {
    rules: {
      complexity: ['error', 10],
      'max-depth': ['error', 4],
      'max-nested-callbacks': ['error', 3],
    },
  },

  // Accessibility gating for shipped app/UI source (JSX lives in .tsx here).
  // The CI/quality gate runs `eslint`, so enabling these here makes them gate
  // automatically. Two kinds of rule are enabled:
  //   - has-valid-* rules fire only when the matching accessibility prop is
  //     present but malformed (wrong role, bad state/value shape, invalid
  //     actions, bad live-region/invert-colors/importance value) — no noise on
  //     elements that omit the prop.
  //   - has-valid-accessibility-descriptors requires every *interactive*
  //     element (touchables, TextInput) to carry at least one descriptor
  //     (role, label+hint, or actions) so it is announceable. This matches the
  //     template rule that every interactive surface must reach assistive tech.
  //   - no-nested-touchables catches a structural bug (a touchable inside a
  //     touchable swallows one of the targets).
  // Test files are excluded: they render bare primitives to assert behaviour,
  // not to ship UI, so descriptor requirements do not apply to them.
  //
  // The blanket "require an accessibility prop on everything" rules
  // (has-accessibility-props / has-accessibility-hint) are intentionally NOT
  // enabled: the App* components already force accessibilityLabel +
  // accessibilityRole at the type level, and requiring a hint on every labelled
  // element is noisy without improving the experience.
  {
    files: ['app/**/*.tsx', 'src/**/*.tsx'],
    ignores: ['**/__tests__/**', '**/*.test.tsx'],
    plugins: { 'react-native-a11y': reactNativeA11y },
    rules: {
      'react-native-a11y/has-valid-accessibility-role': 'error',
      'react-native-a11y/has-valid-accessibility-state': 'error',
      'react-native-a11y/has-valid-accessibility-value': 'error',
      'react-native-a11y/has-valid-accessibility-actions': 'error',
      'react-native-a11y/has-valid-accessibility-descriptors': 'error',
      'react-native-a11y/has-valid-accessibility-ignores-invert-colors':
        'error',
      'react-native-a11y/has-valid-accessibility-live-region': 'error',
      'react-native-a11y/has-valid-important-for-accessibility': 'error',
      'react-native-a11y/no-nested-touchables': 'error',
    },
  },

  // Disable ESLint rules that conflict with Prettier. Keep last.
  prettierConfig,
]);
