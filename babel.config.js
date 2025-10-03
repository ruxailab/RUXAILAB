module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining'
  ],
  env: {
    test: {
      plugins: ['transform-require-context'],
    },
  },
}
