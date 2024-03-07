module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
  testMatch: ['**/*.spec.js'],
  setupFilesAfterEnv: ['./tests/mocks/firebase.js'],
  resetMocks: true,
  clearMocks: true,
}
