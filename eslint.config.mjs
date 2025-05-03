import { defineConfig } from "eslint/config"
import vueParser from "vue-eslint-parser"
import babelParser from "@babel/eslint-parser"
import pluginVue from "eslint-plugin-vue"
import vuetify from "eslint-plugin-vuetify"
import globals from "globals"

export default defineConfig({
  files: ["src/**/*.{vue,js}"],
  extends: [
    ...pluginVue.configs["flat/recommended"],
    ...pluginVue.configs["flat/base"],
    ...vuetify.configs["flat/base"],
  ],
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      parser: babelParser,
      sourceType: "module",
      globals: {
        ...globals.browser
      }
    },
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/multi-word-component-names": "off", 
    "vue/no-required-prop-with-default": "off",
    "vue/require-default-prop": "off",
    "vue/no-template-shadow": "off"
    // "semi": "off",
    // "no-unused-vars": "warn",
  },
})
