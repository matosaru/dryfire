module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/audio.js',
    'src/classifier.js',
    'src/storage.js',
    'src/eventDetector.js',
    'src/evaluation.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
};
