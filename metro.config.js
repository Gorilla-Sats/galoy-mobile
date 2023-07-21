/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path")
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config")

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig()
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
    },
    projectRoot: path.resolve(__dirname),
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...sourceExts, "svg", "cjs", "json"],
      extraNodeModules: {
        stream: path.resolve(__dirname, "node_modules/readable-stream"),
        zlib: path.resolve(__dirname, "node_modules/browserify-zlib"),
      },
    },
  }
})()
