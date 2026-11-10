const webpack = require('webpack')
const Components = require('unplugin-vue-components/webpack')
const { Vuetify3Resolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  productionSourceMap: false,
  css: { sourceMap: false },

  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  },

  transpileDependencies: [
    'vuetify',
    'resize-detector',
  ],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },

  devServer: {
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
      overlay: {
        errors: true,
        warnings: true,
        runtimeErrors: (error) =>
          !/ResizeObserver loop/.test(error?.message ?? ''),
      },
    },
  },

  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),

      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      }),

      Components({
        resolvers: [Vuetify3Resolver()],
        dts: false,
      }),
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process'),
        "vm": false,

      },
    },
  },
};
