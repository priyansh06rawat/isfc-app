// metro.config.js — required for React Native CLI (bare workflow)
// Expo Router + path aliases (@/*) work via Expo's default Metro config
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
