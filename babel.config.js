module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // react-native-reanimated/plugin must be listed last
      // Disable worklets optimization to avoid dependency issues
      [
        'react-native-reanimated/plugin',
        {
          disableInlineStylesWarning: true,
        },
      ],
    ],
  };
};
