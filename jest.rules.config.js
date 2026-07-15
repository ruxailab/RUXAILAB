module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/rules/**/*.spec.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
}
