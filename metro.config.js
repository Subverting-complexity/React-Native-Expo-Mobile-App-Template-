const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve all target platforms explicitly
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Prefer react-native field, fall back to browser then main for web compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
