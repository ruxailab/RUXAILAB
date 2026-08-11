const webpack = require('webpack')

module.exports = {
  productionSourceMap: false,
  css: { sourceMap: false },

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
        warnings: false,
        runtimeErrors: (error) =>
          !error?.message?.includes(
            'ResizeObserver loop completed with undelivered notifications',
          ) &&
          !error?.message?.includes('ResizeObserver loop limit exceeded'),
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
    ],
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
