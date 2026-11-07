'use strict';

const {
  getAttributeName,
  getPropertyName,
  literalValues,
} = require('../lib/ast');

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

  // Border widths (src/theme/borderWidths.ts)
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStartWidth',
  'borderEndWidth',

  // Opacity (src/theme/opacity.ts). 1 (fully visible) is allowed, like 0.
  'opacity',

  // Shadows (src/theme/shadows.ts). shadowOffset is an object, checked below.
  'shadowRadius',

  // Layering — z-index is a token category (src/theme/zIndex.ts); raw stacking
  // values fragment the layering scale. (Layout dimensions like width/height
  // stay exempt: they are behavioral, not part of the design-token contract.)
  'zIndex',
]);

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
    function report(node, value, property) {
      context.report({
        node,
        messageId: 'noHardcodedStyle',
        data: { value: String(value), property },
      });
    }

    function checkNumbers(valueNode, property) {
      for (const { node, value } of literalValues(valueNode)) {
        const neutral = value === 0 || (property === 'opacity' && value === 1);
        if (typeof value === 'number' && !neutral) {
          report(node, value, property);
        }
      }
    }

    // Weights come from the type variants (theme.typography.variants), so any literal is raw.
    function checkFontWeight(valueNode) {
      for (const { node, value } of literalValues(valueNode)) {
        if (typeof value === 'number' || typeof value === 'string') {
          report(node, value, 'fontWeight');
        }
      }
    }

    function checkShadowOffset(valueNode) {
      if (valueNode.type !== 'ObjectExpression') return;
      for (const axis of valueNode.properties) {
        if (axis.type !== 'Property') continue;
        checkNumbers(axis.value, `shadowOffset.${getPropertyName(axis)}`);
      }
    }

    return {
      Property(node) {
        const name = getPropertyName(node);
        if (name === 'fontWeight') checkFontWeight(node.value);
        if (name === 'shadowOffset') checkShadowOffset(node.value);
        if (VISUAL_PROPERTIES.has(name)) checkNumbers(node.value, name);
      },
      // A `size` prop on any element, such as an icon: `<Ionicons size={24} />`.
      JSXAttribute(node) {
        if (getAttributeName(node) === 'size' && node.value) {
          checkNumbers(node.value, 'size');
        }
      },
    };
  },
};
