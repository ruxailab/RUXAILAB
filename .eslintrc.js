module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'prettier',
    'plugin:vuetify/base',
    'plugin:@intlify/vue-i18n/recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-required-prop-with-default': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-template-shadow': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    semi: 'off',
    '@intlify/vue-i18n/no-raw-text': [
      'warn',
      {
        ignorePattern: '^\\s*[mdi-]|^[%.,!?;:()\\s/•-]+$|^\\d+$|^\\/\\d+$',
      },
    ],
    '@intlify/vue-i18n/no-missing-keys': 'warn',
  },
  settings: {
    '@intlify/vue-i18n': {
      localeDir: './src/app/plugins/locales/*.json',
      messageSyntaxVersion: '^9.0.0',
    },
  },
};
