// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  preset: 'ts-jest',
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/plugins',
    '<rootDir>/packages',
    '<rootDir>/server'
  ],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)']
}
