const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add web-specific module resolution aliases
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, redirect native-only modules to our shims
  if (platform === 'web') {
    if (moduleName === '@stripe/stripe-react-native') {
      return {
        filePath: path.resolve(__dirname, 'shims/stripe-web.tsx'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native-maps') {
      return {
        filePath: path.resolve(__dirname, 'shims/maps-web.tsx'),
        type: 'sourceFile',
      };
    }
    if (moduleName === 'react-native-signature-canvas') {
      return {
        filePath: path.resolve(__dirname, 'shims/signature-canvas-web.tsx'),
        type: 'sourceFile',
      };
    }
  }
  // Fall back to the default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
