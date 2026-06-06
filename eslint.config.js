// Flat ESLint config for the Expo template.
// Layers: Expo's recommended flat config (core + TypeScript + React +
// Expo rules), project complexity/nesting limits, then eslint-config-prettier
// last so Prettier owns all formatting and ESLint never fights it.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

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

  // Disable ESLint rules that conflict with Prettier. Keep last.
  prettierConfig,
]);
