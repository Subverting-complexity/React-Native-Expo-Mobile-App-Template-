'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/no-hardcoded-styles');

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022 } });

ruleTester.run('no-hardcoded-styles', rule, {
  valid: [
    // Allowed behavioral properties
    { code: 'const s = { opacity: 0.85 }' },
    { code: 'const s = { flex: 1 }' },
    { code: 'const s = { flexGrow: 2 }' },
    { code: 'const s = { flexShrink: 0 }' },
    { code: 'const s = { elevation: 4 }' },
    { code: 'const s = { aspectRatio: 1.5 }' },
    { code: 'const s = { borderWidth: 1 }' },
    { code: 'const s = { width: 100 }' },
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
  ],
});
