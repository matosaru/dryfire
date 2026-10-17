module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/apps/**/*.test.tsx', '<rootDir>/packages/**/*.test.tsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { babelrc: false, configFile: false, presets: [['@babel/preset-react', { runtime: 'automatic' }], '@babel/preset-typescript'] }],
  },
  collectCoverageFrom: [
    'apps/web/src/**/*.{ts,tsx}',
    'packages/ui/src/**/*.{ts,tsx}',
    '!**/*.test.tsx',
    '!**/index.ts',
    'src/audio.js',
    'src/classifier.js',
    'src/storage.js',
    'src/eventDetector.js',
    'src/evaluation.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
};
