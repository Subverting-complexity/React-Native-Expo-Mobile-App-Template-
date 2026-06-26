'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/no-hardcoded-colors');

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2022 } });

ruleTester.run('no-hardcoded-colors', rule, {
  valid: [
    // Variable references are fine
    { code: 'const s = { color: theme.colors.primary }' },
    { code: 'const s = { backgroundColor: getColor() }' },

    // 'transparent' is allowed
    { code: "const s = { backgroundColor: 'transparent' }" },

    // Non-color properties with string values are fine
    { code: "const s = { fontFamily: 'Arial' }" },
    { code: "const s = { display: 'flex' }" },

    // Numbers on color properties are fine (not string literals)
    { code: 'const s = { color: 0xff0000 }' },
  ],

  invalid: [
    // 3-digit hex
    {
      code: "const s = { color: '#fff' }",
      errors: [{ messageId: 'noHardcodedColor', data: { value: '#fff' } }],
    },
    // 6-digit hex
    {
      code: "const s = { backgroundColor: '#FF5733' }",
      errors: [{ messageId: 'noHardcodedColor', data: { value: '#FF5733' } }],
    },
    // 8-digit hex (with alpha)
    {
      code: "const s = { borderColor: '#FF573380' }",
      errors: [{ messageId: 'noHardcodedColor', data: { value: '#FF573380' } }],
    },
    // rgb()
    {
      code: "const s = { color: 'rgb(255, 0, 0)' }",
      errors: [
        {
          messageId: 'noHardcodedColor',
          data: { value: 'rgb(255, 0, 0)' },
        },
      ],
    },
    // rgba()
    {
      code: "const s = { shadowColor: 'rgba(0, 0, 0, 0.5)' }",
      errors: [
        {
          messageId: 'noHardcodedColor',
          data: { value: 'rgba(0, 0, 0, 0.5)' },
        },
      ],
    },
    // hsl()
    {
      code: "const s = { tintColor: 'hsl(120, 50%, 50%)' }",
      errors: [
        {
          messageId: 'noHardcodedColor',
          data: { value: 'hsl(120, 50%, 50%)' },
        },
      ],
    },
    // hsla()
    {
      code: "const s = { textShadowColor: 'hsla(0, 100%, 50%, 0.8)' }",
      errors: [
        {
          messageId: 'noHardcodedColor',
          data: { value: 'hsla(0, 100%, 50%, 0.8)' },
        },
      ],
    },
    // Named CSS color
    {
      code: "const s = { color: 'red' }",
      errors: [{ messageId: 'noHardcodedColor', data: { value: 'red' } }],
    },
    // Named color on backgroundColor
    {
      code: "const s = { backgroundColor: 'white' }",
      errors: [{ messageId: 'noHardcodedColor', data: { value: 'white' } }],
    },
    // textDecorationColor
    {
      code: "const s = { textDecorationColor: 'blue' }",
      errors: [{ messageId: 'noHardcodedColor', data: { value: 'blue' } }],
    },
    // placeholderTextColor
    {
      code: "const s = { placeholderTextColor: '#aaa' }",
      errors: [{ messageId: 'noHardcodedColor', data: { value: '#aaa' } }],
    },
  ],
});
