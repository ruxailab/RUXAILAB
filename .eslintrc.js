module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/recommended'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off',
    semi: ['warn', 'never'],
    'prefer-const': 'warn',
    indent: 'off',
    'object-curly-newline': 'off',
    'linebreak-style': 'off',
    'vue/max-attributes-per-line': 'off',
  },
}
