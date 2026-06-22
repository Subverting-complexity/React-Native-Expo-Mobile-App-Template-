'use strict';

const VISUAL_PROPERTIES = new Set([
  // Typography
  'fontSize',
  'lineHeight',
  'letterSpacing',

  // Spacing
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingHorizontal',
  'paddingVertical',
  'paddingStart',
  'paddingEnd',
  'gap',
  'rowGap',
  'columnGap',
  'top',
  'right',
  'bottom',
  'left',
  'start',
  'end',

  // Radii
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
]);

function getPropertyName(node) {
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal') return String(node.key.value);
  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded numeric values for visual style properties',
    },
    messages: {
      noHardcodedStyle:
        "Hardcoded {{value}} on '{{property}}' — use a theme token instead.",
    },
    schema: [],
  },

  create(context) {
    return {
      Property(node) {
        const name = getPropertyName(node);
        if (!name || !VISUAL_PROPERTIES.has(name)) return;
        if (node.value.type !== 'Literal') return;
        if (typeof node.value.value !== 'number') return;
        if (node.value.value === 0) return;

        context.report({
          node: node.value,
          messageId: 'noHardcodedStyle',
          data: { value: String(node.value.value), property: name },
        });
      },
    };
  },
};
