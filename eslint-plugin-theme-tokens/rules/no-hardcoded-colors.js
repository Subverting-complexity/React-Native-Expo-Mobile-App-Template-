'use strict';

const {
  getAttributeName,
  getPropertyName,
  literalValues,
} = require('../lib/ast');

const COLOR_PROPERTIES = new Set([
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderStartColor',
  'borderEndColor',
  'borderBlockColor',
  'borderBlockEndColor',
  'borderBlockStartColor',
  'tintColor',
  'shadowColor',
  'textShadowColor',
  'textDecorationColor',
  'overlayColor',
  'selectionColor',
  'placeholderTextColor',
  'underlineColorAndroid',
]);

// Shorthand properties whose string value can EMBED one or more colors inside a
// larger value (e.g. `boxShadow: '0 2px 4px rgba(0,0,0,0.1)'`). The exact-match
// checks below don't see these because the color is not the whole string, so
// they get a separate "scan anywhere" pass.
const COLOR_BEARING_STRING_PROPERTIES = new Set([
  'boxShadow',
  'textShadow',
  'filter',
  'background',
  'backgroundImage',
  'outline',
  'border',
  'borderTop',
  'borderRight',
  'borderBottom',
  'borderLeft',
]);

const HEX_RE = /^#[0-9a-f]{3,8}$/i;
const COLOR_FN_RE = /^(rgb|rgba|hsl|hsla)\s*\(/i;

// Same color shapes, but matched anywhere within a larger string value.
const EMBEDDED_HEX_RE = /#[0-9a-f]{3,8}\b/i;
const EMBEDDED_COLOR_FN_RE = /\b(?:rgb|rgba|hsl|hsla)\s*\([^)]*\)/i;

// CSS named colors supported by React Native (excludes 'transparent').
const NAMED_COLORS = new Set([
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blanchedalmond',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
]);

function isColorValue(value) {
  if (typeof value !== 'string') return false;
  if (value === 'transparent') return false;
  if (HEX_RE.test(value)) return true;
  if (COLOR_FN_RE.test(value)) return true;
  if (NAMED_COLORS.has(value.toLowerCase())) return true;
  return false;
}

// A named CSS color appearing as a whole word inside a larger string.
const EMBEDDED_NAMED_COLOR_RE = new RegExp(
  `\\b(?:${[...NAMED_COLORS].join('|')})\\b`,
  'i',
);

/**
 * Find the first hardcoded color embedded anywhere in a shorthand string value,
 * returning the matched color text (for the report) or null if there is none.
 */
function findEmbeddedColor(value) {
  if (typeof value !== 'string') return null;
  const fn = value.match(EMBEDDED_COLOR_FN_RE);
  if (fn) return fn[0];
  const hex = value.match(EMBEDDED_HEX_RE);
  if (hex) return hex[0];
  const named = value.match(EMBEDDED_NAMED_COLOR_RE);
  if (named) return named[0];
  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded color values in style properties and color props',
    },
    messages: {
      noHardcodedColor:
        "Hardcoded color '{{value}}' — use a theme token from useTheme() instead.",
    },
    schema: [],
  },

  create(context) {
    function report(node, value) {
      context.report({ node, messageId: 'noHardcodedColor', data: { value } });
    }

    function checkWholeValue(valueNode) {
      for (const { node, value } of literalValues(valueNode)) {
        if (isColorValue(value)) report(node, value);
      }
    }

    function checkEmbedded(valueNode) {
      for (const { node, value } of literalValues(valueNode)) {
        const embedded = findEmbeddedColor(value);
        if (embedded) report(node, embedded);
      }
    }

    return {
      Property(node) {
        const name = getPropertyName(node);
        // Dedicated color properties: the whole value is expected to be a color.
        if (COLOR_PROPERTIES.has(name)) {
          checkWholeValue(node.value);
        }
        // Shorthand string properties: a color may be embedded mid-string.
        if (COLOR_BEARING_STRING_PROPERTIES.has(name)) {
          checkEmbedded(node.value);
        }
      },
      // A `color` prop on any element, such as an icon: `<Ionicons color="#fff" />`.
      JSXAttribute(node) {
        if (getAttributeName(node) === 'color' && node.value) {
          checkWholeValue(node.value);
        }
      },
    };
  },
};
