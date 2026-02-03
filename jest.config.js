module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/*.spec.js'],
  testPathIgnorePatterns: ['/e2e/'],
  setupFilesAfterEnv: ['./tests/mocks/firebase.js'],
  resetMocks: true,
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
}
