module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/*.spec.js'],
  testPathIgnorePatterns: ['/e2e/'],
  transformIgnorePatterns: ['/node_modules/(?!(axios)/)'],
  setupFilesAfterEnv: ['./tests/mocks/firebase.js'],
  resetMocks: true,
  clearMocks: true,
}
