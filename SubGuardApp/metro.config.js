const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// react-native-gesture-handler TypeScript kaynak dosyaları bağımlılıklarını
// Metro'nun root node_modules'dan resolve edebilmesi için yönlendirme
config.resolver.extraNodeModules = {
  'hoist-non-react-statics': path.resolve(__dirname, 'node_modules/hoist-non-react-statics'),
  'invariant': path.resolve(__dirname, 'node_modules/invariant'),
  '@egjs/hammerjs': path.resolve(__dirname, 'node_modules/@egjs/hammerjs'),
};

module.exports = config;
