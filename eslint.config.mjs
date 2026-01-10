import { defineConfig } from "eslint/config"
import vueParser from "vue-eslint-parser"
import babelParser from "@babel/eslint-parser"
import pluginVue from "eslint-plugin-vue"
import vuetify from "eslint-plugin-vuetify"
import globals from "globals"
import eslintConfigPrettier from "eslint-config-prettier"

export default defineConfig([
  {
    files: ["src/**/*.{js,vue}"],

    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: babelParser,
        ecmaVersion: "latest",
        sourceType: "module",
        requireConfigFile: false,
      },
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      vue: pluginVue,
      vuetify,
    },

    extends: [
      ...pluginVue.configs["flat/recommended"],
      ...vuetify.configs["flat/base"],
      eslintConfigPrettier, // disable rules that conflicts with prettier
    ],

    rules: {
      // Environment
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",


      // Vue
      "vue/multi-word-component-names": "off",
      "vue/no-required-prop-with-default": "off",
      "vue/require-default-prop": "off",
      "vue/no-template-shadow": "off",

      // JS
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // Prettier format
      "semi": "off",
    },
  },
])
