'use strict';

function getPropertyName(node) {
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal') return String(node.key.value);
  return null;
}

function negativeNumber(node) {
  const isNumber =
    node.operator === '-' &&
    node.argument.type === 'Literal' &&
    typeof node.argument.value === 'number';
  return isNumber ? [{ node, value: -node.argument.value }] : [];
}

/**
 * Every literal value an expression can produce, each with the node to report
 * on. `a ? '#fff' : '#000'` gives both colors; `size || 16` gives 16.
 */
function literalValues(node) {
  switch (node.type) {
    case 'Literal':
      return [{ node, value: node.value }];
    case 'TemplateLiteral':
      return node.expressions.length === 0
        ? [{ node, value: node.quasis[0].value.cooked }]
        : [];
    case 'UnaryExpression':
      return negativeNumber(node);
    case 'ConditionalExpression':
      return [
        ...literalValues(node.consequent),
        ...literalValues(node.alternate),
      ];
    case 'LogicalExpression':
      return [...literalValues(node.left), ...literalValues(node.right)];
    case 'JSXExpressionContainer':
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
      return literalValues(node.expression);
    default:
      return [];
  }
}

/** The JSX attribute name, or null for a namespaced name such as `xlink:href`. */
function getAttributeName(node) {
  return node.name.type === 'JSXIdentifier' ? node.name.name : null;
}

module.exports = { getPropertyName, getAttributeName, literalValues };
