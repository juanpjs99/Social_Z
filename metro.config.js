const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
    extraNodeModules: new Proxy({}, {
      get: (target, name) => {
        return path.join(__dirname, `node_modules/${name}`);
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
