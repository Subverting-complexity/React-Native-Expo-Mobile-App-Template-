'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/no-hardcoded-styles');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-hardcoded-styles', rule, {
  valid: [
    // Allowed behavioral properties
    { code: 'const s = { flex: 1 }' },
    { code: 'const s = { flexGrow: 2 }' },
    { code: 'const s = { flexShrink: 0 }' },
    { code: 'const s = { elevation: 4 }' },
    { code: 'const s = { aspectRatio: 1.5 }' },
    { code: 'const s = { width: 100 }' },

    // Opacity 0 and 1 are "hidden" and "fully visible", not design values
    { code: 'const s = { opacity: disabled ? theme.opacity.disabled : 1 }' },
    { code: 'const s = { opacity: 0 }' },
    { code: 'const s = { borderWidth: 0 }' },
    { code: 'const s = { borderWidth: theme.borderWidths.thin }' },
    { code: 'const s = { height: 44 }' },

    // Zero is always allowed (structural "none/off")
    { code: 'const s = { margin: 0 }' },
    { code: 'const s = { padding: 0 }' },
    { code: 'const s = { borderRadius: 0 }' },
    { code: 'const s = { fontSize: 0 }' },

    // Theme token references are fine
    { code: 'const s = { fontSize: theme.typography.sizes.md.fontSize }' },
    { code: 'const s = { padding: theme.spacing[4] }' },
    { code: 'const s = { borderRadius: theme.radii.md }' },

    // String values on visual properties are fine (e.g. 'auto')
    { code: "const s = { margin: 'auto' }" },

    // Token weights, zero shadow offsets and token sizes are fine
    { code: 'const s = { fontWeight: theme.typography.weights.bold }' },
    { code: 'const s = { shadowOffset: { width: 0, height: 0 } }' },
    { code: 'const s = { shadowOffset: theme.shadows.md.shadowOffset }' },
    { code: '<Icon size={theme.typography.sizes.md.fontSize} />' },
    // A string size is a named variant, such as ActivityIndicator's 'large'
    { code: '<ActivityIndicator size="large" />' },
    // Negative zero is still zero
    { code: 'const s = { margin: -0 }' },
  ],

  invalid: [
    // Typography
    {
      code: 'const s = { fontSize: 14 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '14', property: 'fontSize' },
        },
      ],
    },
    {
      code: 'const s = { lineHeight: 20 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '20', property: 'lineHeight' },
        },
      ],
    },
    {
      code: 'const s = { letterSpacing: 0.5 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '0.5', property: 'letterSpacing' },
        },
      ],
    },

    // Spacing
    {
      code: 'const s = { margin: 16 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '16', property: 'margin' },
        },
      ],
    },
    {
      code: 'const s = { paddingHorizontal: 12 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '12', property: 'paddingHorizontal' },
        },
      ],
    },
    {
      code: 'const s = { gap: 8 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '8', property: 'gap' },
        },
      ],
    },
    {
      code: 'const s = { top: 10 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '10', property: 'top' },
        },
      ],
    },

    // Radii
    {
      code: 'const s = { borderRadius: 8 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '8', property: 'borderRadius' },
        },
      ],
    },
    {
      code: 'const s = { borderTopLeftRadius: 4 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '4', property: 'borderTopLeftRadius' },
        },
      ],
    },

    // Border widths and opacity
    {
      code: 'const s = { borderWidth: 1 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '1', property: 'borderWidth' },
        },
      ],
    },
    {
      code: 'const s = { borderTopWidth: 2 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '2', property: 'borderTopWidth' },
        },
      ],
    },
    {
      code: 'const s = { opacity: pressed ? 0.85 : 1 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '0.85', property: 'opacity' },
        },
      ],
    },

    // Layering
    {
      code: 'const s = { zIndex: 10 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '10', property: 'zIndex' },
        },
      ],
    },

    // Negative numbers
    {
      code: 'const s = { marginTop: -8 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '-8', property: 'marginTop' },
        },
      ],
    },
    // Both branches of a conditional, and a logical fallback
    {
      code: 'const s = { padding: compact ? 4 : 8, gap: custom ?? 12 }',
      errors: [
        { data: { value: '4', property: 'padding' } },
        { data: { value: '8', property: 'padding' } },
        { data: { value: '12', property: 'gap' } },
      ].map((error) => ({ messageId: 'noHardcodedStyle', ...error })),
    },
    // Shadows
    {
      code: 'const s = { shadowRadius: 4 }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '4', property: 'shadowRadius' },
        },
      ],
    },
    {
      code: 'const s = { shadowOffset: { width: 0, height: 2 } }',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '2', property: 'shadowOffset.height' },
        },
      ],
    },
    // Font weight, as a string or a number
    {
      code: "const s = { fontWeight: '600' }",
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '600', property: 'fontWeight' },
        },
      ],
    },
    {
      code: "const s = { fontWeight: 'bold' }",
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: 'bold', property: 'fontWeight' },
        },
      ],
    },
    // A numeric size prop on any JSX element
    {
      code: '<Ionicons name="close" size={24} />',
      errors: [
        {
          messageId: 'noHardcodedStyle',
          data: { value: '24', property: 'size' },
        },
      ],
    },
  ],
});
