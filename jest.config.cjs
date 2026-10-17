module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.{js,ts,tsx}', '<rootDir>/apps/**/*.test.{ts,tsx}', '<rootDir>/packages/**/*.test.{ts,tsx}'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { babelrc: false, configFile: false, presets: [['@babel/preset-react', { runtime: 'automatic' }], '@babel/preset-typescript'] }],
  },
  collectCoverageFrom: [
    'src/**/*.js',
    'workers/**/*.js',
    'apps/web/src/**/*.{ts,tsx}',
    'packages/ui/src/**/*.{ts,tsx}',
    '!**/*.test.{js,ts,tsx}',
    '!**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'html', 'json-summary', 'lcov'],
};
