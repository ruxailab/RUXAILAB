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
    // Environment-specific rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // Style & formatting
    'semi': ['warn', 'never'],
    'quotes': ['warn', 'single'],
    'prefer-const': 'warn',
    'no-unused-vars': 'off',
    'indent': 'off',
    'max-len': ['warn', {
      code: 200,
      ignoreStrings: true,
      ignoreComments: true,
      ignoreTemplateLiterals: true,
    }],
    'no-trailing-spaces': 'warn',
    'arrow-parens': 'warn',
    'comma-dangle': ['warn', 'always-multiline'],
    'object-curly-newline': 'off',
    'linebreak-style': 'off',
    'operator-linebreak': 'off',

    // General logic & best practices
    'eqeqeq': 'off',
    'no-plusplus': 'off',
    'no-empty': 'warn',
    'no-continue': 'off',
    'no-loop-func': 'off',
    'no-restricted-syntax': 'off',
    'class-methods-use-this': 'off',

    // Vue-specific rules
    'vue/max-attributes-per-line': 'off',
    'vue/require-prop-types': 'warn',
    'vue/require-default-prop': 'warn',
    'vue/prop-name-casing': 'warn',
  },
}

