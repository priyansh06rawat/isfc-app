/**
 * react-native.config.js
 * Required for React Native CLI (bare workflow) to correctly discover
 * native modules, assets, and the project structure.
 */
module.exports = {
  project: {
    android: {
      sourceDir: './android',
    },
    // ios: {} — iOS not generated on Windows; add when built on Mac/EAS
  },
};
