const webpack = require('@nativescript/webpack');

module.exports = (env) => {
  webpack.init(env);

  webpack.chainWebpack((config) => {
    // Add polyfills for browser APIs
    config.resolve.fallback = {
      "assert": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "stream": require.resolve("stream-browserify"),
      "tty": require.resolve("tty-browserify"),
      "url": require.resolve("url/"),
      "util": require.resolve("util/"),
      "zlib": require.resolve("browserify-zlib")
    };

    // Add cache-loader for better rebuild performance
    config.module
      .rule('typescript')
      .use('cache-loader')
      .loader('cache-loader')
      .before('ts-loader');

    // Optimize bundle size
    config.optimization.splitChunks({
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    });
  });

  // Remove HMR option
  if (env && env.hmr) {
    delete env.hmr;
  }

  return webpack.resolveConfig();
};