const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-community|expo|@expo|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-device-info)/)',
  ],
};

config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver.sourceExts ?? []), 'cjs'],
};

module.exports = config;
