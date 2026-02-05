import { defineConfig } from 'eslint/config'
import vueParser from 'vue-eslint-parser'
import babelParser from '@babel/eslint-parser'
import pluginVue from 'eslint-plugin-vue'
import vuetify from 'eslint-plugin-vuetify'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'
import VueI18n from '@intlify/eslint-plugin-vue-i18n'

export default defineConfig([
  {
    files: ['src/**/*.{js,vue}'],

    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: babelParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        requireConfigFile: false,
      },
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      vue: pluginVue,
      vuetify,
      'vue-i18n': VueI18n,
    },
    settings: {
      'vue-i18n': {
        localeDir: './src/app/plugins/locales/*.json',
        messageSyntaxVersion: '^9.0.0',
      },
    },

    extends: [
      ...pluginVue.configs['flat/recommended'],
      ...vuetify.configs['flat/base'],
      ...VueI18n.configs['flat/recommended'],
      eslintConfigPrettier, // disable rules that conflicts with prettier
    ],

    rules: {
      // Environment
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

      // Vue
      'vue/multi-word-component-names': 'off',
      'vue/no-required-prop-with-default': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-template-shadow': 'off',

      // JS
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Prettier format
      semi: 'off',

      // Vue I18n
      '@intlify/vue-i18n/no-raw-text': [
        'warn',
        { ignorePattern: String.raw`^\s*mdi-` },
      ],
      '@intlify/vue-i18n/no-missing-keys': 'warn',
    },
  },
])
