module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off',
    semi: ['warning', 'all'],
    'max-len': 'off',
    'linebreak-style': 'off',
    camelcase: [
      'error',
      { properties: 'never', ignoreDestructuring: true, ignoreImports: true },
    ],
    'arrow-parens': ['warn', 'always'],
    'vue/multiline-html-element-content-newline': 'off',
  },
}
