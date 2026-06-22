'use strict';

const noHardcodedColors = require('./rules/no-hardcoded-colors');
const noHardcodedStyles = require('./rules/no-hardcoded-styles');

module.exports = {
  rules: {
    'no-hardcoded-colors': noHardcodedColors,
    'no-hardcoded-styles': noHardcodedStyles,
  },
};
